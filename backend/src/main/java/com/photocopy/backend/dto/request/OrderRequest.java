package com.photocopy.backend.dto.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {
    private Long userId;
    private Long totalAmount;
    private String paymentOption;
    private String orderType;
    private String address;
    private String phoneNumber;
    private Long discount;
    private String serviceDescription;
    private MultipartFile serviceFile;
}
