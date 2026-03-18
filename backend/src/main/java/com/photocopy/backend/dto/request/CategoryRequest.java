package com.photocopy.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CategoryRequest {
    private Long id;
    @NotBlank
    private String categoryName;
}
