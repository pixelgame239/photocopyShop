package com.photocopy.backend.controller;

import com.photocopy.backend.service.ProductService;
import com.photocopy.backend.service.UserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.request.CategoryRequest;
import com.photocopy.backend.dto.request.ProductRequest;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.response.CategoryResponse;
import com.photocopy.backend.dto.response.ProductResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final UserService userService;
    @PostMapping("/category/create")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest categoryRequest, Authentication authentication) {
        CategoryResponse createdCategory = categoryService.createCategory(categoryRequest, authentication);
        return ResponseEntity.status(201).body(createdCategory);
    }
    @PutMapping("/category/update")
    public ResponseEntity<CategoryResponse> updateCategory(@Valid @RequestBody CategoryRequest categoryRequest, Authentication authentication) {
        System.out.println("Received update request for category: " + categoryRequest.getId() + " with name: " + categoryRequest.getCategoryName());
        CategoryResponse updatedCategory = categoryService.updateCategory(categoryRequest, authentication);
        return ResponseEntity.ok(updatedCategory);
    }
    @DeleteMapping("/category/delete/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId, Authentication authentication) {
        categoryService.deleteCategory(categoryId, authentication);
        return ResponseEntity.ok("Category deleted successfully");
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, path = "/product/createProduct")
    public ResponseEntity<ProductResponse> createProduct(@ModelAttribute ProductRequest productRequest, Authentication authentication) {
        ProductResponse createdProduct = productService.createProduct(productRequest, authentication);
        return ResponseEntity.status(201).body(createdProduct);
    }
    @DeleteMapping("/product/delete/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId, Authentication authentication) {
        productService.deleteProduct(productId, authentication);
        return ResponseEntity.ok("Product deleted successfully");
    }
    @PutMapping("/product/update/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long productId, @ModelAttribute ProductRequest productRequest, Authentication authentication) {
        ProductResponse updatedProduct = productService.updateProduct(productId, productRequest, authentication);
        return ResponseEntity.ok(updatedProduct);
    }
    @GetMapping("/users")
    public Page<UserResponse> getUsers(Pageable pageable, Authentication authentication) {
        Page<UserResponse> users = userService.getAllUsers(pageable, authentication);
        return users;
    }
    @PostMapping("/users/changeStatus/{userId}")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId, Authentication authentication) {
        userService.changeUserStatus(userId, authentication);
        return ResponseEntity.ok("User status updated successfully");
    }
    @PostMapping("/users/createStaff")
    public ResponseEntity<UserResponse> createStaff(@RequestBody SignupRequest signupRequest, Authentication authentication) {
        UserResponse createdStaff = userService.createNewStaff(signupRequest, authentication);
        return ResponseEntity.ok(createdStaff);
    }
    
    @DeleteMapping("/users/delete/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        userService.deleteUser(userId, authentication);
        return ResponseEntity.ok("User deleted successfully");
    }
}
