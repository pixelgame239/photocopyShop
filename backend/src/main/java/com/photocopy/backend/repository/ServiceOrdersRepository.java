package com.photocopy.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.Orders;
import com.photocopy.backend.entity.ServiceOrders;

@Repository
public interface ServiceOrdersRepository extends JpaRepository<ServiceOrders, Long> {
    Optional<ServiceOrders> findByOrders(Orders orders);
}
