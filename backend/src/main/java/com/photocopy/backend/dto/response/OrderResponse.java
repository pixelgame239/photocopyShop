package com.photocopy.backend.dto.response;

import java.time.Instant;

public record OrderResponse(
    Long id,
    Long userId,
    String fullName,
    String phoneNumber,
    Long totalAmount,
    String paymentOption,
    Instant orderDate,
    String status,
    String orderType,
    String address,
    Long discount,
    ServiceOrderResponse serviceOrder,
    ProductOrderResponse[] productOrders
) {}
