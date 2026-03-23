package com.photocopy.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.photocopy.backend.constant.OrderStatus;
import com.photocopy.backend.constant.OrderType;
import com.photocopy.backend.constant.PaymentOption;
import com.photocopy.backend.constant.UserRole;
import com.photocopy.backend.dto.request.ChangeOrderStatusRequest;
import com.photocopy.backend.dto.request.OrderRequest;
import com.photocopy.backend.dto.response.DashboardResponse;
import com.photocopy.backend.dto.response.LowStockProductResponse;
import com.photocopy.backend.dto.response.OrderResponse;
import com.photocopy.backend.dto.response.ProductOrderResponse;
import com.photocopy.backend.dto.response.ServiceOrderResponse;
import com.photocopy.backend.entity.Orders;
import com.photocopy.backend.entity.ProductOrders;
import com.photocopy.backend.entity.ServiceOrders;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.exception.ForbiddenException;
import com.photocopy.backend.exception.InternalServerException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.repository.OrdersRepository;
import com.photocopy.backend.repository.ProductOrdersRepository;
import com.photocopy.backend.repository.ProductRepository;
import com.photocopy.backend.repository.ServiceOrdersRepository;
import com.photocopy.backend.repository.UserCartRepository;
import com.photocopy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final ProductOrdersRepository productOrdersRepository;
    private final ServiceOrdersRepository serviceOrdersRepository;
    private final UserRepository userRepository;
    private final UserCartRepository userCartRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FileStorageService fileStorageService;
    private final TemplateEngine templateEngine;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    
    @Transactional
    public void changeOrderStatus(ChangeOrderStatusRequest request, Authentication authentication){
        Long orderId = request.getOrderId();
        String action = request.getAction();
        Orders selectedOrder = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
        String targetUser = selectedOrder.getUser().getId().toString() + "_" + selectedOrder.getUser().getFullName();
        if(action.equals("PROCESSING")){
            if(selectedOrder.getStatus() != OrderStatus.PENDING && selectedOrder.getStatus() != OrderStatus.WAITING) {
                throw new ForbiddenException("Only pending or waiting orders can be moved to processing.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF")|| a.getAuthority().equals("ROLE_USER") && selectedOrder.getUser().getId().equals(Long.parseLong(authentication.getName())))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            if(selectedOrder.getStatus() == OrderStatus.PENDING){
                HashMap<String, Object> userNoti = new HashMap<>();
                userNoti.put("title", "Đơn hàng của bạn đang được xử lý");
                userNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đang được xử lý. Hãy theo dõi trạng thái đơn hàng");
                userNoti.put("orderId", selectedOrder.getId());
                userNoti.put("status", OrderStatus.PROCESSING.name());
                messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
            }else{
                selectedOrder.updateDiscount(request.getDiscount());
                selectedOrder.updateTotalAmount(request.getTotalAmount()-request.getDiscount());
                userRepository.findById(selectedOrder.getUser().getId()).ifPresent(user -> {
                    Long newPoint = user.getUserPoint() - request.getDiscount() + (request.getTotalAmount()-request.getDiscount()) / 100L;
                    user.updateUserPoint(newPoint);
                    userRepository.save(user);
                });
                HashMap<String, Object> staffNoti = new HashMap<>();
                staffNoti.put("title", "Đơn hàng đã được khách hàng đồng ý xử lý");
                staffNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đã được khách hàng đồng ý xử lý. Vui lòng kiểm tra và tiếp tục xử lý đơn hàng.");
                staffNoti.put("orderId", selectedOrder.getId());
                staffNoti.put("status", OrderStatus.PROCESSING.name());
                staffNoti.put("totalAmount", request.getTotalAmount()-request.getDiscount());
                staffNoti.put("discount", request.getDiscount());
                messagingTemplate.convertAndSend("/topic/orders/notifications", (Object) staffNoti);
            }
            selectedOrder.updateStatus(OrderStatus.PROCESSING);
        }
        else if(action.equals("COMPLETED")){
            if(selectedOrder.getStatus() != OrderStatus.PROCESSING && selectedOrder.getStatus() != OrderStatus.SHIPPING) {
                throw new ForbiddenException("Only processing or shipping orders can be moved to completed.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            selectedOrder.updateStatus(OrderStatus.COMPLETED);
            HashMap<String, Object> userNoti = new HashMap<>();
            userNoti.put("title", "Đơn hàng của bạn đã hoàn thành");
            userNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.");
            userNoti.put("orderId", selectedOrder.getId());
            userNoti.put("status", OrderStatus.COMPLETED.name());
            messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
        }
        else if(action.equals("CANCELLED")){
            if(selectedOrder.getStatus() != OrderStatus.PENDING) {
                throw new ForbiddenException("Only pending orders can be cancelled.");
            }
             if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_USER")) || !selectedOrder.getUser().getId().equals(Long.parseLong(authentication.getName()))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            selectedOrder.updateStatus(OrderStatus.CANCELLED);
            HashMap<String, Object> staffNoti = new HashMap<>();
            staffNoti.put("title", "Đơn hàng đã bị khách hàng hủy");
            staffNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đã bị khách hàng hủy. Vui lòng kiểm tra và cập nhật trạng thái đơn hàng.");
            staffNoti.put("orderId", selectedOrder.getId());
            staffNoti.put("status", OrderStatus.CANCELLED.name());
            messagingTemplate.convertAndSend("/topic/orders/notifications", (Object) staffNoti);

        }
        else if(action.equals("WAITING")){
            if(selectedOrder.getStatus() != OrderStatus.PENDING) {
                throw new ForbiddenException("Only pending orders can be moved to waiting.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            HashMap<String, Object> userNoti = new HashMap<>();
            userNoti.put("title", "Đơn hàng của bạn đang chờ bạn xác nhận");
            userNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đang chờ bạn xác nhận. Vui lòng kiểm tra và đồng ý để chúng tôi tiếp tục xử lý đơn hàng.");
            userNoti.put("orderId", selectedOrder.getId());
            userNoti.put("status", OrderStatus.WAITING.name());
            userNoti.put("totalAmount", request.getTotalAmount());
            messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
            selectedOrder.updateTotalAmount(request.getTotalAmount());
            selectedOrder.updateStatus(OrderStatus.WAITING);
        }
        else if(action.equals("REJECTED")){
            if(selectedOrder.getStatus() != OrderStatus.PENDING) {
                throw new ForbiddenException("Only pending orders can be rejected.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            selectedOrder.updateStatus(OrderStatus.REJECTED);
            HashMap<String, Object> userNoti = new HashMap<>();
            userNoti.put("title", "Đơn hàng của bạn đã bị từ chối");
            userNoti.put("message", "Đơn hàng của bạn đã bị từ chối. Chúng tôi sẽ liên hệ với bạn để biết thêm chi tiết.");
            userNoti.put("orderId", selectedOrder.getId());
            userNoti.put("status", OrderStatus.REJECTED.name());
            messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
            emailService.sendRejectionEmail(selectedOrder.getUser().getEmail(), selectedOrder.getId());
        }
        else if(action.equals("SHIPPING")){
            if(selectedOrder.getStatus() != OrderStatus.PROCESSING) {
                throw new ForbiddenException("Only processing orders can be moved to shipping.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            selectedOrder.updateStatus(OrderStatus.SHIPPING);
            HashMap<String, Object> userNoti = new HashMap<>();
            userNoti.put("title", "Đơn hàng của bạn đang được giao");
            userNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đang được giao. Vui lòng chuẩn bị nhận hàng.");
            userNoti.put("orderId", selectedOrder.getId());
            userNoti.put("status", OrderStatus.SHIPPING.name());
            messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
        }
        else if(action.equals("FAILED")){
            if(selectedOrder.getStatus() != OrderStatus.COMPLETED) {
                throw new ForbiddenException("Only completed orders can be moved to failed.");
            }
            if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
                throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
            }
            selectedOrder.updateStatus(OrderStatus.FAILED);
            HashMap<String, Object> userNoti = new HashMap<>();
            userNoti.put("title", "Bạn đã không nhận đơn hàng");
            userNoti.put("message", "Đơn hàng #" + selectedOrder.getId() + " đã thất bại. Bạn hãy chú ý nhận đơn hàng để tránh bị khóa tài khoản.");
            userNoti.put("orderId", selectedOrder.getId());
            userNoti.put("status", OrderStatus.FAILED.name());
            messagingTemplate.convertAndSendToUser(targetUser, "/queue/orders/notifications", userNoti);
        }
         else{
            throw new ForbiddenException("Invalid action: " + action);
        }
        ordersRepository.save(selectedOrder);
    }

    public boolean existByStatus(Authentication authentication) {
        if(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
            return ordersRepository.existsByStatus(OrderStatus.PENDING);
        } else if(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"))){
            return ordersRepository.findByUserId(Long.parseLong(authentication.getName()), Pageable.unpaged())
                    .getContent()
                    .stream()
                    .anyMatch(order -> order.getStatus() == OrderStatus.WAITING);
        } else {
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
    }

    @Transactional
    public void deleteOrder(Long orderId, Authentication authentication){
        Orders selectedOrder = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))){
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        ordersRepository.delete(selectedOrder);
    }

    public Page<OrderResponse> getAllOrders(Authentication authentication, Pageable pageable) {
         if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))){
            throw new UnauthorizedException("Unauthorized: You do not have permission to perform this action");
        }
        if(pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("id").descending());
        }
        return ordersRepository.findAll(pageable).map(order -> {
            ServiceOrders serviceOrder = serviceOrdersRepository.findByOrders(order).orElse(null);
            List<ProductOrders> productOrders = productOrdersRepository.findByOrders(order);
            ServiceOrderResponse serviceOrderResponse = null;
            if(serviceOrder != null) {
                serviceOrderResponse = new ServiceOrderResponse(serviceOrder.getRequestDescription(), serviceOrder.getFileName());
            }
            ProductOrderResponse[] productOrderResponses = productOrders.stream().map(po -> new ProductOrderResponse(po.getProduct().getId(), po.getProduct().getProductName(), po.getQuantity(), po.getProduct().getPrice())).toArray(ProductOrderResponse[]::new);
            return new OrderResponse(order.getId(), order.getUser().getId(), order.getUser().getFullName(), 
            order.getUser().getPhoneNumber(), order.getTotalAmount(), order.getPaymentOption().name(), 
            order.getOrderDate(), order.getStatus().name(), order.getOrderType().name(), order.getAddress(), 
            order.getDiscount(), serviceOrderResponse, productOrderResponses);
        });
    }

    public Page<OrderResponse> getUserOrders(Authentication authentication, Pageable pageable) {
        if(authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to view orders.");
        }
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("id").descending());
        Page<Orders> orders = ordersRepository.findByUserId(Long.parseLong(authentication.getName()), pageable);
        if (orders.isEmpty()) {
            throw new NotFoundException("No orders found for user with id: " + Long.parseLong(authentication.getName()));
        }
        return orders.map(order -> {
            ServiceOrders serviceOrder = serviceOrdersRepository.findByOrders(order).orElse(null);
            List<ProductOrders> productOrders = productOrdersRepository.findByOrders(order);
            ServiceOrderResponse serviceOrderResponse = null;
            if(serviceOrder != null) {
                serviceOrderResponse = new ServiceOrderResponse(serviceOrder.getRequestDescription(), serviceOrder.getFileName());
            }
            ProductOrderResponse[] productOrderResponses = productOrders.stream().map(po -> new ProductOrderResponse(po.getProduct().getId(), po.getProduct().getProductName(), po.getQuantity(), po.getProduct().getPrice())).toArray(ProductOrderResponse[]::new);
            return new OrderResponse(order.getId(), order.getUser().getId(), order.getUser().getFullName(), 
            order.getUser().getPhoneNumber(), order.getTotalAmount(), order.getPaymentOption().name(), 
            order.getOrderDate(), order.getStatus().name(), order.getOrderType().name(), order.getAddress(), 
            order.getDiscount(), serviceOrderResponse, productOrderResponses);
        });
    }

    public DashboardResponse getDashboardStats(Authentication authentication) {
        if(authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Unauthorized: Admins only.");
        }
        Long totalUsers = userRepository.countByRoleEquals(UserRole.USER);
        Long totalOrders = ordersRepository.countByOrderDateAfter(Instant.now().minusSeconds(24 * 60 * 60));
        Long pendingOrders = ordersRepository.countByStatus(OrderStatus.PENDING);
        Long revenue = ordersRepository.sumTotalAmountByStatus(OrderStatus.COMPLETED);
        List<LowStockProductResponse> lowStockProducts = productRepository.findLowStockProducts(10L);
        return new DashboardResponse(totalUsers, totalOrders, pendingOrders, revenue, lowStockProducts);
    }

    public String generateCartQRCode(OrderRequest orderRequest, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to generate QR code.");
        }
        return "https://img.vietqr.io/image/BIDV-4521101247-print.png?amount=" + orderRequest.getTotalAmount() + "&addInfo=Don%20hang%20cua%20" + orderRequest.getUserId() + "%20" + orderRequest.getPhoneNumber() + "&accountName=Le%20Hoang%20An";
    }

    @Transactional
    public Long createOrder(OrderRequest orderRequest, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()|| authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("User must be authenticated to create an order.");
        }
        ServiceOrderResponse serviceOrderResponse = null;
        List<ProductOrderResponse> productOrderResponses = new ArrayList<>();
        User currentUser = userRepository.findById(Long.parseLong(authentication.getName()))
            .orElseThrow(() -> new NotFoundException("User not found with id: " + authentication.getName()));
        Orders order = Orders.builder()
                .user(currentUser)
                .totalAmount(orderRequest.getTotalAmount())
                .status(OrderStatus.PENDING)
                .discount(orderRequest.getDiscount())
                .orderDate(Instant.now())
                .orderType(OrderType.valueOf(orderRequest.getOrderType()))
                .paymentOption(PaymentOption.valueOf(orderRequest.getPaymentOption()))
                .address(orderRequest.getAddress())
                .build();
        ordersRepository.save(order);
        if(orderRequest.getTotalAmount() + orderRequest.getDiscount() >= 10000) {
            Long newPoint = currentUser.getUserPoint() - orderRequest.getDiscount() + orderRequest.getTotalAmount() / 100L;
            currentUser.updateUserPoint(newPoint);
            userRepository.save(currentUser);
        }
        if(currentUser.getAddress() == null || currentUser.getAddress().isEmpty()) {
            currentUser.updateAddress(orderRequest.getAddress());
            userRepository.save(currentUser);
        }
        if(orderRequest.getServiceDescription() != null && !orderRequest.getServiceDescription().isEmpty()) {
            String fileName = null;
            if(orderRequest.getServiceFile() != null && !orderRequest.getServiceFile().isEmpty()) {
                fileName = fileStorageService.uploadPrivateFile(orderRequest.getServiceFile(), "orders");
            }
            serviceOrdersRepository.save(
                ServiceOrders.builder()
                    .orders(order)
                        .requestDescription(orderRequest.getServiceDescription())
                        .fileName(fileName)
                        .build()
                );
                serviceOrderResponse = new ServiceOrderResponse(orderRequest.getServiceDescription(), fileName);
            }
        else{
            userCartRepository.findByUserId(currentUser.getId()).forEach(cartItem -> {
                productOrdersRepository.save(
                    ProductOrders.builder()
                        .orders(order)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .build()
                );
                productOrderResponses.add(new ProductOrderResponse(cartItem.getProduct().getId(), cartItem.getProduct().getProductName(), cartItem.getQuantity(), cartItem.getProduct().getPrice()));
            });
        }
        userCartRepository.deleteAllByUserId(currentUser.getId());
        Map<String, Object> adminNoti = new HashMap<>();
        adminNoti.put("title", "Đơn hàng mới chờ xử lý");
        adminNoti.put("message", "Đơn hàng của " + currentUser.getFullName());
        adminNoti.put("type", "NEW_ORDER");
        adminNoti.put("orderId", order.getId().toString());
        adminNoti.put("status", OrderStatus.PENDING.name());
        adminNoti.put("totalAmount", (order.getTotalAmount() != null && order.getTotalAmount() > 0) ? order.getTotalAmount() : null);
        adminNoti.put("discount", (order.getDiscount() != null && order.getDiscount() > 0) ? order.getDiscount() : null);
        adminNoti.put("userId", currentUser.getId().toString());
        adminNoti.put("fullName", currentUser.getFullName());
        adminNoti.put("phoneNumber", currentUser.getPhoneNumber());
        adminNoti.put("orderType", order.getOrderType().name());
        adminNoti.put("paymentOption", order.getPaymentOption().name());
        adminNoti.put("address", order.getAddress());
        adminNoti.put("orderDate", order.getOrderDate().toString());
        adminNoti.put("serviceOrder", serviceOrderResponse);
        adminNoti.put("productOrders", productOrderResponses);
        messagingTemplate.convertAndSend("/topic/orders/notifications", (Object) adminNoti);
        return currentUser.getUserPoint();
    }

    public byte[] generateInvoicePdf(Long orderId, Authentication authentication) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
        boolean isAdminOrStaff = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
        boolean isOrderOwner = order.getUser().getId().equals(Long.parseLong(authentication.getName()));
        if(!isAdminOrStaff && !isOrderOwner) {
            throw new UnauthorizedException("User must be authenticated to access this invoice.");
        }
        List<ProductOrders> productOrders = productOrdersRepository.findByOrders(order);
        Context context = new Context();
        context.setVariable("orderId", order.getId());
        context.setVariable("totalAmount", order.getTotalAmount());
        context.setVariable("discount", order.getDiscount());
        context.setVariable("orderDate", order.getOrderDate());
        context.setVariable("orderType", order.getOrderType().toString());
        context.setVariable("paymentOption", order.getPaymentOption().toString());
        context.setVariable("address", order.getAddress());
        context.setVariable("items", productOrders);
        String htmlContent = templateEngine.process("invoice", context);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.useFastMode();
        builder.useFont(() -> getClass().getResourceAsStream("/fonts/Roboto-Regular.ttf"), "Roboto");
        builder.withHtmlContent(htmlContent, null);
        builder.toStream(outputStream);
        try {
            builder.run();
        } catch (IOException e) {
            new InternalServerException("Lỗi xuất hoá đơn: " + e.getMessage());
            e.printStackTrace();
        }
        return outputStream.toByteArray();
    }
}
