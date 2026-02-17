package com.photocopy.backend.service.impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.photocopy.backend.entity.RefreshToken;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.exception.BadRequestException;
import com.photocopy.backend.repository.RefreshTokenRepository;
import com.photocopy.backend.service.RefreshTokenService;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final long jwtRefreshExpiration;

    public RefreshTokenServiceImpl(RefreshTokenRepository repository, @Qualifier("jwtRefreshExpiration") long jwtRefreshExpiration){
        this.repository= repository;
        this.jwtRefreshExpiration=jwtRefreshExpiration;
    }

    @Override
    public RefreshToken create(User user) {
        RefreshToken token = new RefreshToken(
            user,
            UUID.randomUUID().toString(),
            Instant.now().plusMillis(jwtRefreshExpiration)
        );
        return repository.save(token);
    }

    @Override
    public RefreshToken verify(String token) {
        RefreshToken refreshToken = repository.findByToken(token)
            .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ"));
        if (refreshToken.isExpired()) {
            refreshToken.revoke();
            repository.save(refreshToken);
            throw new BadRequestException("Refresh token đã hết hạn");
        }
        if (refreshToken.isRevoked()) {
            throw new BadRequestException("Refresh token đã bị thu hồi");
        }

        return refreshToken;
    }

    @Transactional
    @Override
    public RefreshToken rotate(RefreshToken oldToken) {
        oldToken.revoke();
        repository.save(oldToken);

        return create(oldToken.getUser());
    }

    @Override
    public void revoke(RefreshToken token) {
        token.revoke();
        repository.save(token);
    }
}
