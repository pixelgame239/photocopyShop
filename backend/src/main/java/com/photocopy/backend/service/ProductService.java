package com.photocopy.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.photocopy.backend.dto.request.ProductRequest;
import com.photocopy.backend.dto.response.ProductResponse;
import com.photocopy.backend.entity.Category;
import com.photocopy.backend.entity.Product;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.repository.CategoryRepository;
import com.photocopy.backend.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;
    private final CategoryRepository categoryRepository;
    @Value("${supabase.s3.buckets.products}")
    private String productsBucketName;

    public Page<ProductResponse> getProducts(String searchTerm, Long categoryId, Pageable pageable) {
        return productRepository.findWithFilters(searchTerm, categoryId, pageable).map(p -> new ProductResponse(p.getId(), p.getProductName(), p.getDescription(), p.getCategory().getId(), p.getCategory().getCategoryName(), p.getPrice(), p.getStock(), p.getImageUrl()));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden: You do not have permission to perform this action");
        }
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        System.out.println("Creating product with name: " + productRequest.getProductName() + ", category: " + category.getCategoryName());
        String imageUrl = null;
        if (productRequest.getImageFile() != null && !productRequest.getImageFile().isEmpty()) {
            imageUrl = fileStorageService.uploadFile(productRequest.getImageFile(), productsBucketName, authentication);
        }
        Product newProduct = Product.builder()
                .productName(productRequest.getProductName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .stock(productRequest.getStock())
                .imageUrl(imageUrl)
                .category(category)
                .build();
        productRepository.save(newProduct);
        return new ProductResponse(newProduct.getId(), newProduct.getProductName(), newProduct.getDescription(), newProduct.getCategory().getId(), newProduct.getCategory().getCategoryName(), newProduct.getPrice(), newProduct.getStock(), newProduct.getImageUrl());
    }
    
    @Transactional
    public void deleteProduct(Long id, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden: You do not have permission to perform this action");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        if (product.getImageUrl() != null) {
            fileStorageService.deleteFile(product.getImageUrl(), productsBucketName, authentication);
        }
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest productRequest, Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Forbidden: You do not have permission to perform this action");
        };
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        String imageUrl = product.getImageUrl();
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        if (productRequest.getImageFile() != null && !productRequest.getImageFile().isEmpty()) {
            if (product.getImageUrl() != null) {
                fileStorageService.deleteFile(product.getImageUrl(), productsBucketName, authentication);
            }
            imageUrl = fileStorageService.uploadFile(productRequest.getImageFile(), productsBucketName, authentication);
        }
        product.update(productRequest.getProductName(), productRequest.getDescription(), productRequest.getPrice(), productRequest.getStock(), imageUrl, category);
        productRepository.save(product);
        return new ProductResponse(product.getId(), product.getProductName(), product.getDescription(), product.getCategory().getId(), product.getCategory().getCategoryName(), product.getPrice(), product.getStock(), product.getImageUrl());
    }
}
