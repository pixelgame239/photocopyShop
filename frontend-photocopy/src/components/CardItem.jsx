import React, { useContext, useState } from 'react';
import '../styles/carditem.css';
import { UserContext } from '../context/UserContext';

const CardItem = ({ product, onAddToCart, onBuy }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useContext(UserContext);
  const canInteract = !!(user && (user.role === 'USER' || user.role === 'GUEST'));
  const minQty = 1;
  const maxQty = (product && product.maxQuantity) ? product.maxQuantity : 999;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart && onAddToCart(product);
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    onBuy && onBuy(product);
  };

  const setQtySafe = (val) => {
    if (val === '' || val === null || val === undefined) {
      setQuantity('');
      return;
    }
    const num = Number(val);
    if (Number.isNaN(num)) return;
    const clamped = Math.max(minQty, Math.min(maxQty, Math.floor(num)));
    setQuantity(clamped);
  };

  const increment = (e) => {
    e.stopPropagation();
    setQuantity((q) => {
      const cur = Number(q) || minQty;
      return Math.min(maxQty, cur + 1);
    });
  };

  const decrement = (e) => {
    e.stopPropagation();
    setQuantity((q) => {
      const cur = Number(q) || minQty;
      return Math.max(minQty, cur - 1);
    });
  };

  return (
    <>
      <div className="card-item" onClick={() => setOpen(true)}>
        <div className="card-image">
          <img
            src={product.imageFile}
            alt={product.productName}
            style={{objectFit:"contain"}}
          />
        </div>
        <div className="card-body">
          <h4 className="card-name">{product.productName}</h4>
          <div className="card-price">{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          {canInteract && (
            <div className="card-actions">
              <button className="btn btn-buy" onClick={handleBuy}>Mua</button>
              <button className="btn btn-cart" onClick={handleAddToCart}>Thêm vào giỏ</button>
            </div>
          )}
      </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-corner btn-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <div className="modal-left">
              <img
                src={product.imageFile}
                alt={product.productName}
              />
            </div>
            <div className="modal-right">
              <div className="modal-header">
                <h2>{product.productName}</h2>
                <p className="modal-price">{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              </div>

              {canInteract && (
                <>
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={decrement} aria-label="Decrease quantity">−</button>
                    <input
                      type="number"
                      min={minQty}
                      max={maxQty}
                      className="qty-input"
                      value={quantity}
                      onChange={(e) => setQtySafe(e.target.value)}
                      onBlur={() => { if (quantity === '' || Number(quantity) < minQty) setQuantity(minQty); }}
                    />
                    <button className="qty-btn" onClick={increment} aria-label="Increase quantity">+</button>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn btn-buy"
                      onClick={() => onBuy && onBuy(product, Number(quantity) || minQty)}
                    >
                      Mua
                    </button>
                    <button
                      className="btn btn-cart"
                      onClick={() => onAddToCart && onAddToCart(product, Number(quantity) || minQty)}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </>
              )}

              <div className="modal-body">
                <p className="modal-desc">{product.description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardItem;
