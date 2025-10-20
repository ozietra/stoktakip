import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
        {' '}- Toplam <span className="font-medium">{totalItems}</span> kayıt
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronLeft />
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-2 text-sm btn btn-secondary">
              1
            </button>
            {startPage > 2 && <span className="px-2 py-2">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm btn ${
              page === currentPage
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 py-2">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-2 text-sm btn btn-secondary">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 text-sm btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

