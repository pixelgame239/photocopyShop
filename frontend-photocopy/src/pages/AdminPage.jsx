import React, { useState, useEffect, useContext, use } from 'react';
import '../styles/adminpage.css';
import '../styles/productsPage.css';
import AdminTable from '../components/AdminTable';
import { TabContext } from '../context/TabContext';
import adminApi from '../api/admin.api';

const AdminPage = () => {
  const { setCurrentTab } = useContext(TabContext);
  const [dashboardStats, setDashboardStats] = useState(null);
    useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminApi.getDashboardStats();
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);
  useEffect(() => {
    setCurrentTab('admin');
  }, [setCurrentTab]);
  const nav = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'category', label: 'Danh mục' },
    { key: 'product', label: 'Sản phẩm' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'users', label: 'Người dùng' },
  ];
  const [selected, setSelected] = useState(nav[0]);
  const formatCurrency = (v) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h3>Admin</h3>
        </div>
        <nav>
          <ul className="admin-nav">
            {nav.map((n) => (
              <li key={n.key}>
                <button
                  onClick={() => setSelected(n)}
                  className={`nav-btn ${selected.key === n.key ? 'active' : ''}`}
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        {selected.key === 'dashboard' ? (
          <div>
            <div className="dashboard-header">
              <h2>Bảng điều khiển</h2>
              <p className="dashboard-sub">Tổng quan nhanh về hoạt động cửa hàng</p>
            </div>

            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon">💰</div>
                <div>
                  <div className="count">{formatCurrency(dashboardStats?.revenue || 0)}</div>
                  <div className="label">Doanh thu</div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🛒</div>
                <div>
                  <div className="count">{dashboardStats?.totalOrders || 0}</div>
                  <div className="label">Số đơn hàng mới trong vòng 24h</div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <div>
                  <div className="count">{dashboardStats?.totalUsers || 0}</div>
                  <div className="label">Số người dùng</div>
                </div>
              </div>
            </div>

            <div className="dashboard-widgets">
              <div className="widget card">
                <h3 className="widget-title">Số đơn hàng chờ xử lý</h3>
                <div className="widget-body hint">{dashboardStats?.pendingOrders || 0} đơn hàng</div>
              </div>

              <div className="widget card">
                <h3 className="widget-title">Sản phẩm sắp hết hàng</h3>
                <div className="widget-body">
                  {dashboardStats?.lowStockProducts?.length === 0 ? (
                    <div className="hint">Không có sản phẩm nào sắp hết hàng</div>
                  ) : (
                    <div className="lowstock-list">
                      {dashboardStats?.lowStockProducts?.map((p) => (
                        <div key={p.productId} className="lowstock-item card">
                          <img
                            src={p.imageUrl}
                            alt={p.productName}
                            className="lowstock-thumb"
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }}
                          />
                          <div className="lowstock-info">
                            <div className="lowstock-name">{p.productName}</div>
                            <div className="lowstock-qty">Còn: {p.stock}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AdminTable currentTable={selected} />
        )}
      </main>
    </div>
  );
};

export default AdminPage;
