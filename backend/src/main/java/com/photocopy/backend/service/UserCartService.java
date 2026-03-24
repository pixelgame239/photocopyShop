package com.photocopy.backend.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.photocopy.backend.dto.response.UserCartResponse;
import com.photocopy.backend.entity.Product;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.entity.UserCart;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.repository.ProductRepository;
import com.photocopy.backend.repository.UserCartRepository;
import com.photocopy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserCartService {
    private final UserCartRepository userCartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<UserCartResponse> getCartItems(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to view cart items.");
        }
        Long userId = Long.parseLong(authentication.getName());
        List<UserCart> cartItems = userCartRepository.findByUserId(userId);
        return cartItems.stream()
                .map(uc -> new UserCartResponse(uc.getId(), uc.getProduct().getId(), uc.getProduct().getProductName(),uc.getProduct().getImageUrl(), uc.getProduct().getPrice(), uc.getQuantity()))
                .toList();
    }
    @Transactional
    public void addToCart(Long productId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to add items to cart.");
        }
        Long userId = Long.parseLong(authentication.getName());
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));
        boolean alreadyInCart = userCartRepository.existsByUserIdAndProductId(userId, productId);
        if (alreadyInCart) {
            UserCart existingCartItem = userCartRepository.findByUserIdAndProductId(userId, productId)
                    .orElseThrow(() -> new NotFoundException("Cart item not found for user id: " + userId + " and product id: " + productId));
            updateQuantity(existingCartItem.getId(), existingCartItem.getQuantity() + 1, authentication);
            return;
        }
        else {
            UserCart userCart = UserCart.builder()
                    .user(currentUser)
                    .product(currentProduct)
                    .quantity(1)
                    .build();
            userCartRepository.save(userCart);
        }
    }
    @Transactional
    public void updateQuantity(Long cartId, int quantity, Authentication authentication) {
        UserCart userCart = userCartRepository.findById(cartId)
                .orElseThrow(() -> new NotFoundException("Cart item not found with id: " + cartId));
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST")) || !userCart.getUser().getId().equals(Long.parseLong(authentication.getName()))) {
            throw new UnauthorizedException("User must be authenticated to update cart items.");
        }
        userCart.changeQuantity(quantity);
        userCartRepository.save(userCart);
    }
    @Transactional
    public void removeFromCart(Long cartId, Authentication authentication) {
        UserCart userCart = userCartRepository.findById(cartId)
                .orElseThrow(() -> new NotFoundException("Cart item not found with id: " + cartId));
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST")) || !userCart.getUser().getId().equals(Long.parseLong(authentication.getName()))) {
            throw new UnauthorizedException("User must be authenticated to remove items from cart.");
        }
        userCartRepository.delete(userCart);
    }

    public int countCartItems(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to view cart items.");
        }
        Long userId = Long.parseLong(authentication.getName());
        return userCartRepository.countByUserId(userId);
    }
}
