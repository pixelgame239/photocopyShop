package com.photocopy.backend.dto.response;

public record ProductResponse(
    Long id,
    String productName,
    String description,
    Long categoryId,
    String categoryName,
    Long price,
    Long stock,
    String imageFile
) {}
