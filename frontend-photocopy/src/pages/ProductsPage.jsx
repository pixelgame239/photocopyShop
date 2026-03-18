import React, { useMemo, useState, useContext, useEffect } from 'react';
import CardItem from '../components/CardItem';
import Pagination from '../components/Pagination';
import '../styles/productsPage.css';
import { TabContext } from '../context/TabContext';
import productApi from '../api/product.api';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState({ id: null, categoryName: 'All' });
  const { setCurrentTab } = useContext(TabContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: null, categoryName: 'All' }]);
  const [totalPages, setTotalPages] = useState(1);
  const [matchedProducts, setMatchedProducts] = useState(0);

  useEffect(() => {
    setCurrentTab('products');
    const initProducts = async () => {
      try {
        const response = await productApi.getProducts(1,12);
        const categoriesRes = await productApi.getCategories();
        setProducts(response.data.content || []);
        console.log('Fetched products:', response);
        setCategories([{ id: null, categoryName: 'All' }, ...categoriesRes.data]);
        setTotalPages(response.data.page.totalPages || 1);
        setMatchedProducts(response.data.page.totalElements || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    initProducts();
  },[]);
  
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const response = await productApi.getProducts(currentPage, 12, searchTerm, selectedCategory.id);
        setProducts(response.data.content || []);
        setTotalPages(response.data.page.totalPages || 1);
        setMatchedProducts(response.data.page.totalElements || 0);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      }
    };

    fetchFilteredProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchTerm(searchInput);
  };

useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = (product, qty = 1) => {
    alert(`${product.productName} added to cart (qty: ${qty})`);
  };

  const handleBuy = (product, qty = 1) => {
    // placeholder: open checkout flow
    alert(`Buy: ${product.productName} (qty: ${qty})`);
  };

  return (
    <div className="products-page">
      <div className="search-bar">
        <form className="search-form" role="search" onSubmit={handleSearchSubmit}>
          <input
            aria-label="Tìm kiếm sản phẩm"
            placeholder="Tìm kiếm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Submit search">Tìm kiếm</button>
        </form>
      </div>
      <div className="content">
        <aside className="filters">
          <h3>Tổng cộng</h3>
          <div className="count">{matchedProducts} sản phẩm</div>
          <div className="filter-group">
            <h4>Danh mục</h4>
            <ul className="filter-list">
              {categories && categories.map((cat) => (
                <li
                  key={cat.id}
                  className={`filter-item ${selectedCategory.categoryName === cat.categoryName ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.categoryName}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="products-grid">
          {products.map((p) => (
            <CardItem key={p.id} product={p} onAddToCart={handleAddToCart} onBuy={handleBuy} />
          ))}
        </main>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ProductsPage;