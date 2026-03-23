package com.photocopy.backend.entity;

import java.time.Instant;

import com.photocopy.backend.constant.OrderStatus;
import com.photocopy.backend.constant.OrderType;
import com.photocopy.backend.constant.PaymentOption;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@AllArgsConstructor
@Builder
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentOption paymentOption;
    @Column
    private Long totalAmount;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;
    @Column(nullable = false)
    private Instant orderDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    @Column
    private Long discount;
    @Column
    private String address;

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
    }

    public void updateTotalAmount(Long newTotalAmount) {
        this.totalAmount = newTotalAmount;
    }

    public void updateDiscount(Long newDiscount) {
        this.discount = newDiscount;
    }
}
