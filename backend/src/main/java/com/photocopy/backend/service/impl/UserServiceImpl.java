package com.photocopy.backend.service.impl;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocopy.backend.constant.UserRole;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.entity.RefreshToken;
import com.photocopy.backend.entity.PendingSignup;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.exception.ConflictException;
import com.photocopy.backend.exception.InternalServerException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.mapper.UserMapper;
import com.photocopy.backend.repository.UserRepository;
import com.photocopy.backend.repository.PendingSignupRepository;
import com.photocopy.backend.repository.UserCartRepository;
import com.photocopy.backend.security.JwtProvider;
import com.photocopy.backend.service.EmailService;
import com.photocopy.backend.service.LoginAttemptService;
import com.photocopy.backend.service.RefreshTokenService;
import com.photocopy.backend.service.UserService;

import com.photocopy.backend.dto.request.LoginRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final LoginAttemptService loginAttemptService;
    private final EmailService emailService;
    private final PendingSignupRepository pendingSignupRepository;
    private final UserCartRepository userCartRepository;

    private static final long OTP_EXPIRATION_SECONDS = 5 * 60; 

    @Override
    @Transactional
    public ResponseEntity<Void> preSignup(SignupRequest request) {
        if(userRepository.existsByEmail(request.getEmail())){
            throw new ConflictException("Email đã tồn tại !");
        }
        String randomCode = String.valueOf((int)((Math.random() * 900000) + 100000));
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Instant expiry = Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS);
        PendingSignup pending = pendingSignupRepository.findByEmail(request.getEmail()).
        map(existing->{
            existing.updatePendingSignup(encodedPassword, request.getFullName(), request.getPhoneNumber(), randomCode, expiry);
            return existing;
        }).orElseGet(()-> {
            return PendingSignup.builder()
                            .email(request.getEmail())
                            .password(encodedPassword)
                            .fullName(request.getFullName())
                            .phoneNumber(request.getPhoneNumber())
                            .otp(randomCode)
                            .expiresAt(expiry)
                            .build();
        });
        pendingSignupRepository.save(pending);
        try {
            emailService.sendVerificationEmail(request.getEmail(), request.getFullName(), randomCode);
        } catch (Exception e) {
            e.printStackTrace();
            throw new InternalServerException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
        return ResponseEntity.ok().build();
    }
    
    @Transactional
    @Override
    public AuthResponse signup(SignupRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new ConflictException("Email đã tồn tại !");
        }

        PendingSignup pending = pendingSignupRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ConflictException("Không tìm thấy thông tin đăng ký. Vui lòng yêu cầu mã xác thực."));

        if(pending.getExpiresAt().isBefore(java.time.Instant.now())){
            pendingSignupRepository.deleteByEmail(request.getEmail());
            throw new ConflictException("Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if(request.getOtp() == null || !request.getOtp().equals(pending.getOtp())){
            throw new ConflictException("Mã xác thực không chính xác.");
        }

        User user = User.builder()
                            .email(pending.getEmail())
                            .password(pending.getPassword())
                            .role(UserRole.USER)
                            .fullName(pending.getFullName())
                            .phoneNumber(pending.getPhoneNumber())
                            .build();

        User savedUser = userRepository.save(user);
        pendingSignupRepository.deleteByEmail(request.getEmail());
        String token = jwtProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(user);
        int cartItemCount = userCartRepository.countByUserId(savedUser.getId());
        return new AuthResponse(token, refreshToken.getToken(), UserMapper.toResponse(savedUser, cartItemCount));
    }

    @Override
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("Unexpected Error"));
        return UserMapper.toResponse(user, userCartRepository.countByUserId(id));
    }
    @Override
    public AuthResponse login(LoginRequest request){
        if(loginAttemptService.isBlocked(request.getEmail())) {
            throw new UnauthorizedException("Tài khoản bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng"));
        if (!user.isActive()) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.");
        }
        boolean matchedPassword = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!matchedPassword){
            loginAttemptService.loginFailed(request.getEmail());
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng");
        }
        loginAttemptService.loginSucceeded(request.getEmail());
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(user);
        int cartItemCount = userCartRepository.countByUserId(user.getId());
        return new AuthResponse(token, refreshToken.getToken(), UserMapper.toResponse(user, cartItemCount));
    }

    @Override
    public AuthResponse refresh(String token) {
        RefreshToken oldToken = refreshTokenService.verify(token);
        RefreshToken newToken = refreshTokenService.rotate(oldToken);

        String accessToken = jwtProvider.generateToken(
            oldToken.getUser().getId(),
            oldToken.getUser().getEmail(),
            oldToken.getUser().getRole().name()
        );
        int cartItemCount = userCartRepository.countByUserId(oldToken.getUser().getId());
        return new AuthResponse(
            accessToken,
            newToken.getToken(),
            UserMapper.toResponse(oldToken.getUser(), cartItemCount)
        );
    }

    @Override
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenService.verify(token);
        refreshTokenService.revoke(refreshToken);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        return userRepository.findAll(pageable).map(user -> {
            int cartItemCount = userCartRepository.countByUserId(user.getId());
            return UserMapper.toResponse(user, cartItemCount);
        });
    }
    @Override
    public void changeUserStatus(Long userId, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        user.changeStatus();
        userRepository.save(user);
     }

     @Override
     public UserResponse createNewStaff(SignupRequest request, Authentication authentication) {
         if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
             throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
         }
         if(userRepository.existsByEmail(request.getEmail())){
             throw new ConflictException("Email đã tồn tại !");
         }
         String encodedPassword = passwordEncoder.encode(request.getPassword());
         User staff = User.builder()
                             .email(request.getEmail())
                             .password(encodedPassword)
                             .role(UserRole.STAFF)
                             .fullName(request.getFullName())
                             .phoneNumber(request.getPhoneNumber())
                             .build();
         User savedStaff = userRepository.save(staff);
         return UserMapper.toResponse(savedStaff, 0);
      }

      @Override
      public void deleteUser(Long userId, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        userRepository.delete(user);
      }
}
