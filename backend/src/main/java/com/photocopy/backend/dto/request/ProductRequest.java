package com.photocopy.backend.dto.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {
    private Long id;
    private String productName;
    private String description;
    private Long price;
    private MultipartFile imageFile;
    private Long stock;
    @NotBlank(message = "Category ID is required")
    private Long categoryId;
}