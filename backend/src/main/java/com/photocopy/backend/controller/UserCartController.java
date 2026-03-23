package com.photocopy.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.response.UserCartResponse;
import com.photocopy.backend.service.UserCartService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class UserCartController {
    private final UserCartService userCartService;
    @GetMapping
    public ResponseEntity<List<UserCartResponse>> fetchCartItems(Authentication authentication) {
        return ResponseEntity.ok(userCartService.getCartItems(authentication));
    }
    @PostMapping("add/{productId}")
    public ResponseEntity<Void> addToCart(@PathVariable Long productId, Authentication authentication) {
        userCartService.addToCart(productId, authentication);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("update/{cartId}")
    public ResponseEntity<Void> updateCartItem(@PathVariable Long cartId, @RequestParam int quantity, Authentication authentication) {
        userCartService.updateQuantity(cartId, quantity, authentication);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("remove/{cartId}")
    public ResponseEntity<Void> removeCartItem(@PathVariable Long cartId, Authentication authentication) {
        userCartService.removeFromCart(cartId, authentication);
        return ResponseEntity.ok().build();
    }
    @GetMapping("count")
    public ResponseEntity<Integer> countCartItems(Authentication authentication) {
        return ResponseEntity.ok(userCartService.countCartItems(authentication));
    }
}
