package com.photocopy.backend.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.photocopy.backend.dto.request.CategoryRequest;
import com.photocopy.backend.dto.response.CategoryResponse;
import com.photocopy.backend.entity.Category;
import com.photocopy.backend.exception.ForbiddenException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.repository.CategoryRepository;
import com.photocopy.backend.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getCategoryName()))
                .toList();
    }
    
    public CategoryResponse createCategory(CategoryRequest categoryRequest, Authentication authentication) {
        if (authentication == null || !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden");
        }
        Category newCategory = Category.builder()
                .categoryName(categoryRequest.getCategoryName())
                .build();
        categoryRepository.save(newCategory);
        return new CategoryResponse(newCategory.getId(), newCategory.getCategoryName());
    }
    @Transactional
    public CategoryResponse updateCategory(CategoryRequest categoryRequest, Authentication authentication) {
        if (authentication == null || !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden");
        }
        Category category = categoryRepository.findById(categoryRequest.getId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        category.updateCategory(categoryRequest.getCategoryName());
        categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getCategoryName());
    }
    @Transactional
    public void deleteCategory(Long categoryId, Authentication authentication) {
        if (authentication == null || !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        if (!productRepository.findAll().stream().filter(p -> p.getCategory().getId().equals(categoryId)).toList().isEmpty()) {
            throw new ForbiddenException("Cannot delete category with associated products");
        }
        categoryRepository.delete(category);
    }
}
