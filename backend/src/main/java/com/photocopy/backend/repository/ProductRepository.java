package com.photocopy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.photocopy.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findAll(Pageable pageable);
    @Query("SELECT p FROM Product p WHERE " +
           "(CAST(:searchTerm AS string) IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> findWithFilters(String searchTerm, Long categoryId, Pageable pageable);
}
