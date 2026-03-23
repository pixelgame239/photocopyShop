import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import cartApi from '../api/cart.api';
import '../styles/cartpage.css';
import { TabContext } from '../context/TabContext';

const CartPage = () => {
  const { user, setCartItemCount } = useContext(UserContext);
  const { setCurrentTab } = useContext(TabContext);
  const [cart, setCart] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (user && user.role && user.role !== 'USER') {
      nav('/login');
    }
  }, [user]);

  useEffect(() => {
    setCurrentTab('cart');
    const fetchCartItems = async () => {
        try{
            const response = await cartApi.getCart();
            setCart(response.data || []);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    };
    fetchCartItems();
  }, []);

  const formatVnd = (num) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handleConfirm = () => {
    nav('/checkout', { state: { cart } });
  };

  const handleRemove = async(cartId) => {
    try {
      await cartApi.removeCartItem(cartId);
      const countResponse = await cartApi.getCartItemCount();
      setCartItemCount(countResponse.data || 0);
      const next = cart.filter((i) => i.cartId !== cartId);
      setCart(next);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleChangeQty = async (cartId, qty) => {
    try {
      await cartApi.updateCartItem(cartId, qty);
      const next = cart.map((i) => (i.cartId === cartId ? { ...i, quantity: Number(qty) } : i));
      setCart(next);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const total = cart.reduce((s, i) => s + (Number(i.productPrice) || 0) * Number(i.quantity || 0), 0);

  return (
    <div className="cart-container">
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <div className="cart-empty">
          <p className="empty-cart">Giỏ hàng trống.</p>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <colgroup>
              <col className="col-product" />
              <col className="col-qty" />
              <col className="col-price" />
              <col className="col-total" />
              <col className="col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th className="col-product">Sản phẩm</th>
                <th className="col-qty">Số lượng</th>
                <th className="col-price">Giá</th>
                <th className="col-total">Tổng</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.cartId}>
                  <td className="col-product">
                    <div className="product-cell">
                      <img
                        src={item.productUrl || 'https://via.placeholder.com/80?text=No+Image'}
                        alt={item.productName}
                        className="cart-item-image"
                      />
                      <div className="product-info">
                        <div className="product-name">{item.productName}</div>
                        {item.sku && <div className="product-sku">{item.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="col-qty">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleChangeQty(item.cartId, e.target.value)}
                      style={{ width: 60 }}
                    />
                  </td>
                  <td className="col-price">{formatVnd(Number(item.productPrice) || 0)}</td>
                  <td className="col-total">{formatVnd((Number(item.productPrice) || 0) * Number(item.quantity || 0))}</td>
                  <td className="col-actions">
                    <button className="btn btn-danger" onClick={() => handleRemove(item.cartId)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="total-label">Tổng cộng</td>
                <td className="total-amount">{formatVnd(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>

          <div className="cart-actions">
            <button className="btn btn-ghost" onClick={() => nav("/products")}>Tiếp tục mua sắm</button>
            <button className="btn btn-primary" onClick={handleConfirm}>Xác nhận</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
