package com.photocopy.backend.dto.request;

import lombok.Getter;

@Getter
public class ChangeOrderStatusRequest {
    Long orderId;
    String action;
    Long totalAmount;
    Long discount;
}
