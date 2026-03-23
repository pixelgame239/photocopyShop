package com.photocopy.backend.dto.response;

import java.util.List;

public record DashboardResponse(
    Long totalUsers,
    Long totalOrders,
    Long pendingOrders,
    Long revenue,
    List<LowStockProductResponse> lowStockProducts
) 
{}
