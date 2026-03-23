package com.photocopy.backend.repository;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.constant.OrderStatus;
import com.photocopy.backend.entity.Orders;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Long countByOrderDateAfter(Instant date);
    Long countByStatus(OrderStatus status);
    @Query("SELECT SUM(o.totalAmount) FROM Orders o WHERE o.status = :status")
    Long sumTotalAmountByStatus(@Param("status") OrderStatus status);
    @EntityGraph(attributePaths = {"user"})
    Page<Orders> findAll(Pageable pageable);
    Page<Orders> findByUserId(Long userId, Pageable pageable);
    boolean existsByStatus(OrderStatus status);
}
