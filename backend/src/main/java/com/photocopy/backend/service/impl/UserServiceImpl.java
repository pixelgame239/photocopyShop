package com.photocopy.backend.service.impl;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocopy.backend.constant.UserRole;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.request.UpdateUserRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.entity.RefreshToken;
import com.photocopy.backend.entity.ResetPassword;
import com.photocopy.backend.entity.PendingSignup;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.exception.BadRequestException;
import com.photocopy.backend.exception.ConflictException;
import com.photocopy.backend.exception.InternalServerException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.mapper.UserMapper;
import com.photocopy.backend.repository.UserRepository;
import com.photocopy.backend.repository.PendingSignupRepository;
import com.photocopy.backend.repository.ResetPasswordRepository;
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
    private final ResetPasswordRepository resetPasswordRepository;

    private static final long OTP_EXPIRATION_SECONDS = 5 * 60; 

    @Override
    @Transactional
    public void sendResetPasswordEmail(UpdateUserRequest request) {
        String email = request.getEmail();
        Optional<User> userOptional = userRepository.findByEmail(email);
        String resetToken = "";
        if (userOptional.isPresent()) {
            resetToken = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS);
            resetPasswordRepository.deleteByEmail(email);
            ResetPassword resetPassword = ResetPassword.builder()
                .email(email)
                .resetToken(resetToken)
                .expiresAt(expiry)
                .build();
                resetPasswordRepository.save(resetPassword);
        }
        try {
            emailService.sendResetPasswordEmail(email, resetToken);
        } catch (Exception e) {
            e.printStackTrace();
            throw new InternalServerException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
    }

    @Override
    @Transactional
    public boolean verifyResetToken(String token) {
        ResetPassword resetPassword = resetPasswordRepository.findByResetToken(token)
            .orElseThrow(() -> new NotFoundException("Mã đặt lại mật khẩu không hợp lệ."));
        if (resetPassword.isExpired()) {
            resetPasswordRepository.delete(resetPassword);
            throw new BadRequestException("Mã đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
        return true;
    }

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
    @Transactional
    public AuthResponse login(LoginRequest request){
        if(loginAttemptService.isBlocked(request.getEmail())) {
            throw new BadRequestException("Tài khoản bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new BadRequestException("Tài khoản hoặc mật khẩu không đúng"));
        if (!user.isActive()) {
            throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.");
        }
        boolean matchedPassword = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!matchedPassword){
            loginAttemptService.loginFailed(request.getEmail());
            throw new BadRequestException("Tài khoản hoặc mật khẩu không đúng");
        }
        loginAttemptService.loginSucceeded(request.getEmail());
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(user);
        int cartItemCount = userCartRepository.countByUserId(user.getId());
        return new AuthResponse(token, refreshToken.getToken(), UserMapper.toResponse(user, cartItemCount));
    }

    @Override
    @Transactional
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
    @Transactional
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
    @Transactional
    public void changeUserStatus(Long userId, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        user.changeStatus();
        userRepository.save(user);
     }

     @Override
     @Transactional
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
      @Transactional
      public void deleteUser(Long userId, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        userRepository.delete(user);
      }

      @Override
      @Transactional
      public void updateUserProfile(UpdateUserRequest request, Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("Unauthorized: You must be authenticated to update your profile");
        }
        User user = userRepository.findById(Long.parseLong(authentication.getName())).orElseThrow(() -> new NotFoundException("User not found"));
        user.updateProfile(request.getPhoneNumber(), request.getAddress());
        userRepository.save(user);
      }

      @Override
      @Transactional
      public void changePassword(UpdateUserRequest request, Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            if(verifyResetToken(request.getResetToken())) {
                User user = userRepository.findByEmail(resetPasswordRepository.findByResetToken(request.getResetToken()).get().getEmail())
                    .orElseThrow(() -> new NotFoundException("User not found"));
                String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
                user.changePassword(encodedNewPassword);
                userRepository.save(user);
                resetPasswordRepository.deleteByEmail(user.getEmail());
                return;
            }
            throw new UnauthorizedException("Unauthorized: Invalid reset token");
        }
        User user = userRepository.findById(Long.parseLong(authentication.getName())).orElseThrow(() -> new NotFoundException("User not found"));
        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ConflictException("Mật khẩu hiện tại không đúng");
        }
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.changePassword(encodedNewPassword);
        userRepository.save(user);
    }
}
