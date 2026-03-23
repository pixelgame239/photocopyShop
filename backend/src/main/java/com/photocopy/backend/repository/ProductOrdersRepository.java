package com.photocopy.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.Orders;
import com.photocopy.backend.entity.ProductOrders;

@Repository
public interface ProductOrdersRepository extends JpaRepository<ProductOrders, Long> {
   @EntityGraph(attributePaths = {"product"})
    List<ProductOrders> findByOrders(Orders orders);
}
