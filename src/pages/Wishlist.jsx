import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, ArrowRight, Heart, Info, Loader2, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/products/ProductCard";
import { getWishlist } from "../features/wishlist/wishlistSlice";
import "./Wishlist.css";
import Footer from "../components/Footer";

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items, loading, error, count, totalPages } = useSelector((state) => state.wishlist);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("recently_added");

  // Fetch wishlist items on mount or when page/sorting changes
  useEffect(() => {
    dispatch(getWishlist({ page, ordering: sortBy }));
  }, [dispatch, page, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`wishlist-pag-num-btn ${page === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="wishlist-pagination-container font-inter">
        <button
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          className="wishlist-pag-arrow-btn"
        >
          &lt; Previous
        </button>
        <div className="wishlist-pag-numbers">
          {pages}
        </div>
        <button
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          className="wishlist-pag-arrow-btn"
        >
          Next &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="wishlist-page-viewport">
      <Navbar />

      <main className="wishlist-main-content">
        {/* Header Hero Section */}
        <header className="wishlist-header font-inter">
          <div className="wishlist-header-left">
            <h1 className="wishlist-title font-plus-jakarta">My Wishlist</h1>
            <p className="wishlist-subtitle">
              Saved gear for your next adventure. High-performance essentials curated by you.
            </p>
          </div>
          <div className="wishlist-header-right">
            <div className="wishlist-sort-wrapper">
              <span className="wishlist-sort-label">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="wishlist-sort-dropdown"
              >
                <option value="recently_added">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>
          </div>
        </header>

        {/* Notice Alert Bar */}
        <div className="wishlist-notice-bar font-inter">
          <Info size={16} className="wishlist-notice-icon" />
          <span className="wishlist-notice-text">
            Your saved items are ready when you are. Some items are low in stock.
          </span>
        </div>

        {/* Wishlisted Items Content */}
        {loading ? (
          <div className="wishlist-loading-state">
            <Loader2 className="wishlist-spinner animate-spin" size={40} />
            <p>Loading your saved gear...</p>
          </div>
        ) : error ? (
          <div className="wishlist-error-state font-inter">
            <AlertCircle size={48} className="wishlist-error-icon" />
            <h3>Failed to Load Wishlist</h3>
            <p>{typeof error === "string" ? error : "An unexpected error occurred. Please try again later."}</p>
          </div>
        ) : items.length === 0 ? (
          /* Gorgeous Empty State matching aesthetics */
          <div className="wishlist-empty-state font-inter">
            <div className="wishlist-empty-icon-wrapper">
              <Heart size={48} className="wishlist-empty-icon" />
            </div>
            <h3>Your Wishlist is Empty</h3>
            <p>
              Explore our gear catalogue to save premium items for your next adventure.
            </p>
            <Link to="/shop" className="wishlist-empty-cta-btn">
              Browse Gear Catalog
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-products-grid font-inter">
            {items.map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        )}

        {/* Pagination at the bottom */}
        {!loading && renderPagination()}

        {/* Looking for more? section */}
        <section className="wishlist-more-cta-section font-inter">
          <div className="wishlist-more-cta-box">
            <h2 className="wishlist-more-title font-plus-jakarta">Looking for more?</h2>
            <p className="wishlist-more-subtitle">Discover our full range of curated travel gear.</p>
            <Link to="/shop" className="wishlist-more-btn">
              Explore All Products
            </Link>
          </div>
        </section>
      </main>

      {/* Corporate footer matching Home page */}
      <Footer/>
    </div>
  );
}
