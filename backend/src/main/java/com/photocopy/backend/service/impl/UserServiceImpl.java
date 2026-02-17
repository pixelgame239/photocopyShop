package com.photocopy.backend.service.impl;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
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
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.mapper.UserMapper;
import com.photocopy.backend.repository.UserRepository;
import com.photocopy.backend.repository.PendingSignupRepository;
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

    private static final long OTP_EXPIRATION_SECONDS = 5 * 60; // 10 minutes

    @Override
    @Transactional
    public ResponseEntity<Void> preSignup(SignupRequest request) {
        if(userRepository.existsByEmail(request.getEmail())){
            throw new ConflictException("Email đã tồn tại !");
        }

        // generate 6-digit OTP
        String randomCode = String.valueOf((int)((Math.random() * 900000) + 100000));

        // encode password before storing pending signup
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Instant expiry = Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS);


        // Save or replace existing pending signup
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
        // send verification email; let exception bubble up to caller
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

        // check expiry
        if(pending.getExpiresAt().isBefore(java.time.Instant.now())){
            pendingSignupRepository.deleteByEmail(request.getEmail());
            throw new ConflictException("Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // check OTP match
        if(request.getOtp() == null || !request.getOtp().equals(pending.getOtp())){
            throw new ConflictException("Mã xác thực không chính xác.");
        }

        // create user from pending signup (password already encoded)
        User user = User.builder()
                            .email(pending.getEmail())
                            .password(pending.getPassword())
                            .role(UserRole.USER)
                            .fullName(pending.getFullName())
                            .phoneNumber(pending.getPhoneNumber())
                            .build();

        User savedUser = userRepository.save(user);

        // remove pending entry
        pendingSignupRepository.deleteByEmail(request.getEmail());

        String token = jwtProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(token, refreshToken.getToken(), UserMapper.toResponse(savedUser));
    }

    @Override
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("Unexpected Error"));
        return UserMapper.toResponse(user);
    }
    @Override
    public AuthResponse login(LoginRequest request){
        if(loginAttemptService.isBlocked(request.getEmail())) {
            throw new UnauthorizedException("Tài khoản bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng"));
        boolean matchedPassword = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!matchedPassword){
            loginAttemptService.loginFailed(request.getEmail());
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng");
        }
        loginAttemptService.loginSucceeded(request.getEmail());
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(token, refreshToken.getToken(), UserMapper.toResponse(user));
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

        return new AuthResponse(
            accessToken,
            newToken.getToken(),
            UserMapper.toResponse(oldToken.getUser())
        );
    }

    @Override
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenService.verify(token);
        refreshTokenService.revoke(refreshToken);
    }
}
