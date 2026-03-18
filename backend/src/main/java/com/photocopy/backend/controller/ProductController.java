package com.photocopy.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.response.ProductResponse;
import com.photocopy.backend.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
public class ProductController {
    private final ProductService productService;
    @GetMapping
    public Page<ProductResponse> getProducts(@RequestParam(required = false) String searchTerm, @RequestParam(required = false) Long categoryId, Pageable pageable) {
        return productService.getProducts(searchTerm, categoryId, pageable);
    }
    
    
}
