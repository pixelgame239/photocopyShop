import React, { use, useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import '../styles/adminpage.css';
import '../styles/productsPage.css';
import productApi from '../api/product.api';
import AdminModal from '../components/AdminModal';
import adminApi from '../api/admin.api';

function isImageUrl(val) {
  if (!val) return false;
  if (typeof val !== 'string') return false;
  const dataImage = val.startsWith('data:image/');
  const ext = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(val);
  const http = /^https?:\/\//.test(val);
  return dataImage || ext || http;
}

const AdminTable = ({ currentTable }) => {
  const [items, setItems] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userFilter, setUserFilter] = useState('ALL');
  const [columns, setColumns] = useState([]);
  const [title, setTitle] = useState('');
  const [showUserToggle, setShowUserToggle] = useState(false);
  const [assetVersion, setAssetVersion] = useState(Date.now()); 
  const [allUsers, setAllUsers] = useState([]);
  const tableConfig = {
    category: [
      { key: 'id', label: 'ID', type: 'value' },
      { key: 'categoryName', label: 'Tên danh mục', type: 'text' },
    ],
    product: [
      { key: 'id', label: 'ID', type: 'value' },
      { key: 'productName', label: 'Tên sản phẩm', type: 'text' },
      { key: 'price', label: 'Giá', type: 'number' },
      { key: 'imageFile', label: 'Ảnh', type: 'image' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'categoryId', label: 'Danh mục ID', type: 'select', options: [] },
      { key: 'categoryName', label: 'Tên danh mục', type: 'value' },
      { key: 'stock', label: 'Kho', type: 'number' },
    ],
    users:[
      { key: 'id', label: 'ID', type: 'value' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'fullName', label: 'Họ tên', type: 'text' },
      { key: 'role', label: 'Vai trò', type: 'value' },
      { key: 'password', label: 'Mật khẩu', type: 'text' },
      { key: 'address', label: 'Địa chỉ nhận hàng', type: 'value' },
      { key: 'phoneNumber', label: 'Số điện thoại', type: 'text' },
      { key: 'userPoint', label: 'Điểm', type: 'value' },
      { key: 'isActive', label: 'Trạng thái', type: 'value' }
    ]
  };
  useEffect(()=>{
    setColumns(tableConfig[currentTable.key] || []);
    setTitle(currentTable.label || '');
    const fetchTables = async () => {
      setAssetVersion(Date.now());
      try{
        let response;
        if(currentTable.key === 'category') {
          response = await productApi.getCategories();
        } else if(currentTable.key === 'product') {
          let category;
          category = await productApi.getCategories();
          const categoryOptions = category.data || [];
          console.log('Fetched categories for product options:', categoryOptions);
          setColumns((cols) => cols.map((c) => c.key === 'categoryId' ? { ...c, options: categoryOptions } : c));
          response = await productApi.getProducts(currentPage,10);
        }
        else if(currentTable.key === 'users') {
          response = await adminApi.getUsers(currentPage,10);
          setShowUserToggle(true);
          setAllUsers(response.data.content || response.data || []);
        }
        setItems(response.data.content || response.data || []);
        if(response.data.page && response.data.page.totalPages){
          setTotalPages(response.data.page.totalPages||1);
        }
        else{
          setTotalPages(1);
        }
        console.log(response);
      }
      catch(error){
        console.error('Error fetching categories:', error);
      }
    };

    fetchTables();

  },[currentTable, currentPage]);

  useEffect(() => {
    setItems((prevItems) => {
      if (currentTable.key !== 'users') return prevItems;
      return allUsers.filter((user) => {
        if (userFilter === 'ALL') return true;
        if (userFilter === 'STAFF') return user.role === 'STAFF' || user.role === 'ADMIN';
        if (userFilter === 'USER') return user.role === 'USER';
        return true;
      });
    });
    const total = Math.max(1, Math.ceil(items.length /10));
    if (currentPage > total) setCurrentPage(total);
  }, [userFilter]);

  function openAdd() {
    const blank = {};
    columns.forEach((f) => (blank[f.key] = f.type === 'number' ? 0 : ''));
    setFormData(blank);
    setEditingId(null);
    setFormVisible(true);
  }

  function openEdit(item) {
    setFormData(item);
    setEditingId(item.id);
    setFormVisible(true);
  }

  function handleChange(key, value) {
    setFormData((s) => ({ ...s, [key]: value }));
  }
  const handleChangeStatus = async (userId) => {
    if (!window.confirm('Thay đổi trạng thái người dùng này?')) return;
    try {
      await adminApi.updateUserStatus(userId);
      setItems((prev) => prev.map((it) => it.id === userId ? { ...it, isActive: !it.isActive } : it));
    } catch (error) {
      console.error('Error changing user status:', error);
      alert(error.response?.data?.message || 'Error changing user status');
    }
  };

  function handleFileChange(e, key) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    handleChange(key, file);
    const reader = new FileReader();
    reader.onload = () => {
      handleChange(key + 'Preview', reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    let payload;
    let isMultipart = currentTable.key === 'product';
    if (isMultipart) {
      payload = new FormData(); 
      columns.forEach((f) => {
        let value = formData[f.key];
        if (f.type === 'number') {
            value = parseFloat(value) || 0;
        }
        if (f.type === 'image') {
          if (value instanceof File) {
            payload.append(f.key, value); 
          }
        }
        else if (value !== undefined && value !== null && value !== '') {
            payload.append(f.key, value); 
        }
      });
    }
   else {
      payload = { ...formData };
      columns.forEach((f) => {
        if (f.type === 'number') payload[f.key] = parseFloat(payload[f.key]) || 0;
      });
    }
    try{
      if (editingId) {
        let response;
        if(currentTable.key === 'category') {
          response = await adminApi.updateCategory(payload);
        } else if(currentTable.key === 'product') {
          response = await adminApi.updateProduct(editingId, payload);
        }
        const updatedItem = response.data || {};
        setItems((prev) => prev.map((it) => (it.id === editingId ? updatedItem : it)));
        } else {
          let response;
          if(currentTable.key === 'category') {
            response = await adminApi.createCategory(payload);
          } else if(currentTable.key === 'product') {
            console.log('Creating product with payload:', payload);
            response = await adminApi.createProduct(payload);
          } else if(currentTable.key === 'users') {
            response = await adminApi.createStaff(payload);
          }
          const newItem = response.data || {};
          setItems((prev) => [ ...prev, newItem]);
        }
    } catch(error){
      alert(error.response?.data?.message || 'Error saving item');
    }
    setFormVisible(false);
    setEditingId(null);
    setFormData({});
    setAssetVersion(Date.now());
  }

  async function handleDelete(id) {
    if (!window.confirm('Xoá dữ liệu này?')) return;
    try{
      if(currentTable.key === 'category') {
        await adminApi.deleteCategory(id);
      } else if(currentTable.key === 'product') {
        await adminApi.deleteProduct(id);
      } else if(currentTable.key === 'users') {
        await adminApi.deleteUser(id);
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
    catch(error){
      alert(error.response?.data?.message || 'Error deleting item');
    }
  }

  return (
    <div className="crud-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>{title}</h2>
        <div>
          {showUserToggle && (
            <div style={{ display: 'inline-flex', marginRight: 12 }}>
              <button type="button" className={`btn toggle ${userFilter === 'ALL' ? 'active' : ''}`} onClick={() => setUserFilter('ALL')} style={{ marginRight: 8 }} aria-pressed={userFilter === 'ALL'}>Tất cả</button>
              <button type="button" className={`btn toggle ${userFilter === 'STAFF' ? 'active' : ''}`} onClick={() => setUserFilter('STAFF')} aria-pressed={userFilter === 'STAFF'}>Nhân viên</button>
              <button type="button" className={`btn toggle ${userFilter === 'USER' ? 'active' : ''}`} onClick={() => setUserFilter('USER')} aria-pressed={userFilter === 'USER'} style={{ marginLeft: 8 }}>Người dùng</button>
            </div>
          )}
          <button className="btn primary" onClick={openAdd}>Thêm</button>
        </div>
      </div>

      {formVisible && (
        <AdminModal title={`${editingId ? 'Edit' : 'Add'} ${title.replace(/s$/, '')}`} onClose={() => { setFormVisible(false); setEditingId(null); setFormData({}); }}>
          <form onSubmit={handleSave} className="admin-form">
            <div className="admin-form-grid">
              {columns&&columns.map((c) => {
                return c.type === 'value' ? null : (
                <div key={c.key} className="form-field">
                  <label className="form-label">{c.label}</label>
                  {c.type === 'textarea' ? (
                    <textarea value={formData[c.key] ?? ''} onChange={(e) => handleChange(c.key, e.target.value)} />
                  ) : c.type === 'select' ? (
                    <select value={formData[c.key] ?? ''} onChange={(e) => {
                      const val = c.type === 'select' ? parseInt(e.target.value, 10) : e.target.value;
                      handleChange(c.key, val);
                    }}>
                      <option value="">Chọn</option>
                      {c.options && currentTable.key==="product" && c.options.map((opt) => <option key={opt.id} value={opt.id}>{opt.categoryName}</option>)}
                    </select>
                  ) : c.type === 'image' ? (
                    <div>
                      <input className="file-input" type="file" accept="image/*" onChange={(e) => handleFileChange(e, c.key)} />
                      {formData[`${c.key}Preview`] && (
                          <div className="img-preview">
                              <img src={formData[`${c.key}Preview`]} alt="preview" style={{ width: '100px' }} />
                          </div>
                      )}
                    </div>
                  ) : (
                    <input
                      className="text-input"
                      type={c.type === 'number' ? 'number' : 'text'}
                      value={formData[c.key] ?? ''}
                      onChange={(e) => handleChange(c.key, e.target.value)}
                    />
                  )}
                </div>)
              })}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn primary">{editingId ? 'Lưu' : 'Tạo mới'}</button>
              <button type="button" className="btn" onClick={() => { setFormVisible(false); setEditingId(null); setFormData({}); }}>Huỷ</button>
            </div>
          </form>
        </AdminModal>
      )}

      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns&&columns.filter(c=> c.key !== 'categoryId' && c.key !== 'password').map((c) => <th key={c.key} style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>{c.label}</th>)}
              <th style={{ padding: 8, borderBottom: '1px solid #eee' }}></th>
            </tr>
          </thead>
          <tbody>
            {items&&items.length === 0 && (
              <tr><td colSpan={columns.length + 1} style={{ padding: 12 }}>Không có dữ liệu</td></tr>
            )}
            {items&&items.map((it) => (
              <tr key={it.id}>
                {columns&&columns.filter(c=> c.key !== 'categoryId' && c.key !== 'password').map((c) => (
                  <td key={c.key} style={{ padding: 8, borderBottom: '1px solid #f7f7f7', verticalAlign: 'middle' }}>
                    {c.key && ((c.key === 'imageFile' || (it[c.key] && isImageUrl(it[c.key]))) ? (
                      isImageUrl(it[c.key]) ? <img src={` ${it[c.key]}?v=${assetVersion}`} alt="" style={{ width: 60, height: 60, objectFit: "contain" }} /> : String(it[c.key])
                    ) : (
                      it[c.key] !== undefined ? String(it[c.key]) : '-'
                    ))}
                  </td>
                ))}
                {currentTable.key === 'users' ? (
                  <td style={{ padding: 8, borderBottom: '1px solid #f7f7f7', verticalAlign: 'middle' }}>
                    <button className="btn" onClick={async() => handleChangeStatus(it.id)}>{it.isActive ? 'Khóa' : 'Mở khóa'}</button>
                    <button className="btn danger" onClick={() => handleDelete(it.id)} style={{ marginLeft: 8 }}>Xóa</button>
                  </td>
                ) :<td style={{ padding: 8 }}>
                  <button className="btn" onClick={() => openEdit(it)}>Sửa</button>
                  <button className="btn danger" onClick={() => handleDelete(it.id)} style={{ marginLeft: 8 }}>Xóa</button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
      </div>
    </div>
  );
}
export default AdminTable;