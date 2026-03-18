import React, { useState, useEffect, useContext } from 'react';
import '../styles/adminpage.css';
import '../styles/productsPage.css';
import AdminTable from './AdminTable';
import { TabContext } from '../context/TabContext';

const AdminPage = () => {
  const { setCurrentTab } = useContext(TabContext);
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

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20 }}>
      <aside style={{ width: 220, borderRight: '1px solid #eee', paddingRight: 12 }}>
        <h3 style={{ marginTop: 0 }}>Admin</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {nav.map((n) => (
              <li key={n.key} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setSelected(n)}
                  className={`nav-btn ${selected === n ? 'active' : ''}`}
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1 }}>
        {selected.key === 'dashboard' ? (
          <div>
            <h2>Dashboard</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="count">{}</div>
                <div className="label">Categories</div>
              </div>
              <div className="dashboard-card">
                <div className="count">{}</div>
                <div className="label">Products</div>
              </div>
              <div className="dashboard-card">
                <div className="count">{}</div>
                <div className="label">Orders</div>
              </div>
              <div className="dashboard-card">
                <div className="count">{}</div>
                <div className="label">Users</div>
              </div>
            </div>
          </div>
        ) : (
          <AdminTable currentTable = {selected} />
        )}
      </main>
    </div>
  );
};

export default AdminPage;
