import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrderPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={i}
        className={`page-num-btn ${currentPage === i ? "active" : ""}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="orders-pagination">
      <button 
        className="page-nav-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>
      <div className="page-nums">{pages}</div>
      <button 
        className="page-nav-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
