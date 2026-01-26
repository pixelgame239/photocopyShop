package com.photocopy.backend.service;

import com.photocopy.backend.entity.RefreshToken;
import com.photocopy.backend.entity.User;

public interface RefreshTokenService {
    
    RefreshToken create(User user);

    RefreshToken verify(String token);

    RefreshToken rotate(RefreshToken oldToken);

    void revoke(RefreshToken token);

}