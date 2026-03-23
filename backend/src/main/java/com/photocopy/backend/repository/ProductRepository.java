package com.photocopy.backend.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.dto.response.LowStockProductResponse;
import com.photocopy.backend.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findById(Long id);
    Page<Product> findAll(Pageable pageable);
    @Query("SELECT p FROM Product p WHERE " +
           "(CAST(:searchTerm AS string) IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> findWithFilters(String searchTerm, Long categoryId, Pageable pageable);
    @Query("SELECT new com.photocopy.backend.dto.response.LowStockProductResponse(p.id, p.productName, p.imageUrl, p.stock) from Product p WHERE p.stock < :threshold")
    List<LowStockProductResponse> findLowStockProducts(@Param("threshold") Long threshold);
}
