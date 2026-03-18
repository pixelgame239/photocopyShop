import React, { useMemo } from 'react';
import '../styles/productsPage.css';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {}, maxVisible = 3 }) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 1) pages.push(1, 2, 3);
      else if (currentPage >= totalPages) pages.push(totalPages - 2, totalPages - 1, totalPages);
      else pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    return pages.filter((p) => p >= 1 && p <= totalPages);
  }, [totalPages, currentPage, maxVisible]);

  const goTo = (p) => {
    const page = Math.min(Math.max(1, p), totalPages);
    if (page !== currentPage) onPageChange(page);
  };

  return (
    <div className="pagination-wrap">
      <div className="pagination">
        <button className="page-btn" onClick={() => goTo(1)} disabled={currentPage === 1} aria-label="First page">«</button>
        <button className="page-btn" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            className={`page-num ${n === currentPage ? 'active' : ''}`}
            onClick={() => goTo(n)}
            aria-current={n === currentPage ? 'page' : undefined}
          >
            {n}
          </button>
        ))}

        <button className="page-btn" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
        <button className="page-btn" onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">»</button>
      </div>
    </div>
  );
};

export default Pagination;
