package com.photocopy.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.request.ChangeOrderStatusRequest;
import com.photocopy.backend.dto.request.OrderRequest;
import com.photocopy.backend.dto.response.OrderResponse;
import com.photocopy.backend.service.FileStorageService;
import com.photocopy.backend.service.OrdersService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrdersController {
    private final OrdersService ordersService;
    private final FileStorageService fileStorageService;
    @PostMapping("/generateQRCode")
    public ResponseEntity<String> generateQRCode(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        String qrCodeData = ordersService.generateCartQRCode(orderRequest, authentication);
        return ResponseEntity.ok(qrCodeData);
    }
    @PostMapping("/createOrder")
    public ResponseEntity<Long> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        Long orderId = ordersService.createOrder(orderRequest, authentication);
        return ResponseEntity.ok(orderId);
    }
    @PostMapping(path = "/createServiceOrder", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createServiceOrder(@ModelAttribute OrderRequest orderRequest, Authentication authentication) {
        ordersService.createOrder(orderRequest, authentication);
        return ResponseEntity.ok("Đơn hàng dịch vụ đã được tạo thành công!");
    }
    @GetMapping("/exportInvoice/{orderId}")
    public ResponseEntity<byte[]> exportInvoice(@PathVariable Long orderId, Authentication authentication) {
        byte[] invoiceData = ordersService.generateInvoicePdf(orderId, authentication);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(invoiceData);
    }
    @GetMapping("/getUserOrders")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(Pageable pageable, Authentication authentication) {
        Page<OrderResponse> userOrders = ordersService.getUserOrders(authentication, pageable);
        return ResponseEntity.ok(userOrders);
    }
    @GetMapping("/getOrderFile")
    public String getOrderFile(@RequestParam String fileName, Authentication authentication) {
        return fileStorageService.generatePresignedUrl(fileName, "orders", authentication);
    }
    @PatchMapping("/changeOrderStatus")
    public ResponseEntity<?> changeOrderStatus(@RequestBody ChangeOrderStatusRequest request, Authentication authentication) {
        ordersService.changeOrderStatus(request, authentication);
        return ResponseEntity.ok("Trạng thái đơn hàng đã được cập nhật.");
    }
    @GetMapping("/getAllOrders")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(Pageable pageable, Authentication authentication) {
        Page<OrderResponse> allOrders = ordersService.getAllOrders(authentication, pageable);
        return ResponseEntity.ok(allOrders);
    }

    @GetMapping("/getOrdersStatus")
    public ResponseEntity<Boolean> getOrdersStatus(Authentication authentication) {
        boolean isExist = ordersService.existByStatus(authentication);
        return ResponseEntity.ok(isExist);
    }
}
