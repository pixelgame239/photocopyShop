package com.photocopy.backend.dto.response;


public record UserCartResponse(
    Long cartId,    
    Long productId,
    String productName,
    String productUrl,
    Long productPrice,
    int quantity
) {}