import React from "react";
import { Plus, Pencil, Trash2, Box, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

const getProductThumbnail = (product) => {
  // 1. Try general images
  const primaryGen = product.images?.find(i => i.is_primary);
  if (primaryGen) return primaryGen.image_url;
  if (product.images?.length > 0) return product.images[0].image_url;

  // 2. Try variant images
  for (const v of product.variants || []) {
    const primaryVar = v.images?.find(i => i.is_primary);
    if (primaryVar) return primaryVar.image_url;
    if (v.images?.length > 0) return v.images[0].image_url;
  }
  return null;
};

const getTotalStock = (product) => {
  return (product.variants || []).reduce((acc, curr) => acc + (curr.stock || 0), 0);
};

const getPriceRange = (product) => {
  const prices = (product.variants || []).map(v => parseFloat(v.price)).filter(p => !isNaN(p));
  if (prices.length === 0) return "N/A";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `₹${min.toLocaleString()}`;
  return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
};

const ProductList = ({
  products,
  count,
  page,
  setPage,
  loading,
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  onAddProduct,
  onEditProduct,
  onManageVariants,
  onDeleteProduct,
  onToggleActive,
}) => {
  const startItemRange = (page - 1) * 10 + 1;
  const endItemRange = Math.min(page * 10, count);

  return (
    <>
      {/* Structural Title Header */}
      <div className="workspace-header-row product-header-flex">
        <div>
          <h1 className="workspace-title font-plus-jakarta">Product Management</h1>
        </div>
        <button className="primary-action-btn font-inter" onClick={onAddProduct}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* METRIC SCOREBOARD */}
      <div className="product-stats-bar">
        <div className="product-stat-mini-card">
          <div className="mini-card-icon-frame">
            <Box size={18} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Total Products</span>
            <span className="mini-card-val">{count}</span>
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="product-filters-row font-inter" style={{
        display: 'flex',
        gap: '16px',
        backgroundColor: '#0A0F1D',
        border: '1px solid var(--admin-border-gray)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label className="form-field-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Filter</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-field-input"
            style={{ width: '100%', height: '38px', padding: '0 12px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label className="form-field-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brand Filter</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="form-field-input"
            style={{ width: '100%', height: '38px', padding: '0 12px' }}
          >
            <option value="">All Brands</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {(selectedCategory || selectedBrand) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setSelectedBrand("");
            }}
            className="btn-cancel font-inter"
            style={{
              height: '38px',
              alignSelf: 'flex-end',
              padding: '0 16px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px dashed #ef4444',
              color: '#ef4444',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* CORE DATA TABLE MODULE */}
      <div className="table-card-frame">
        <table className="figma-dark-table font-inter">
          <thead>
            <tr>
              <th className="uppercase">Thumbnail</th>
              <th className="uppercase">Product Details</th>
              <th className="uppercase">Category / Brand</th>
              <th className="uppercase">Price Range</th>
              <th className="uppercase">Total Stock</th>
              <th className="uppercase">Status</th>
              <th className="uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-empty-row text-center">
                  Loading catalog inventory system...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-row text-center">
                  No matching products found in database registry.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  {/* Thumbnail Image */}
                  <td>
                    <div className="product-table-thumb-frame" onClick={() => onManageVariants(p)} style={{ cursor: "pointer" }}>
                      {getProductThumbnail(p) ? (
                        <img src={getProductThumbnail(p)} alt={p.name} className="product-table-thumb-img" />
                      ) : (
                        <div className="product-table-thumb-placeholder">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name and slug details */}
                  <td>
                    <div className="product-title-cell" onClick={() => onManageVariants(p)} style={{ cursor: "pointer" }}>
                      <span className="product-cell-name hover-text-blue">{p.name}</span>
                      <span className="product-cell-slug">{p.slug}</span>
                      {p.short_description && <span className="product-cell-desc">{p.short_description}</span>}
                    </div>
                  </td>

                  {/* Category / Brand */}
                  <td>
                    <div className="product-category-brand-stack">
                      <span className="badge-category">{p.category_name || "Uncategorized"}</span>
                      {p.brand && <span className="text-brand-tag">{p.brand}</span>}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="table-row-timestamp-text price-cell">
                    {getPriceRange(p)}
                  </td>

                  {/* Stock */}
                  <td className="table-row-timestamp-text">
                    <span className={`stock-level-indicator ${getTotalStock(p) === 0 ? 'out-of-stock' : getTotalStock(p) < 15 ? 'low-stock' : 'in-stock'}`}>
                      {getTotalStock(p).toLocaleString()} units
                    </span>
                  </td>

                  {/* Active Status Direct Toggle */}
                  <td>
                    <div 
                      className="status-toggle-wrapper" 
                      onClick={() => onToggleActive(p.id, p.is_active)}
                      title="Click to toggle active status"
                    >
                      <span className={`status-dot-indicator ${p.is_active ? "dot-active" : "dot-suspended"}`} />
                      <span className={`status-label-node-text ${p.is_active ? "text-active" : "text-suspended"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td>
                    <div className="actions-cell-alignment-box product-actions-gap">
                      <button
                        onClick={() => onManageVariants(p)}
                        className="table-icon-action-btn edit-btn-style"
                        title="Manage Product Variants"
                        style={{ color: "#3b82f6" }}
                      >
                        <Box size={14} />
                      </button>
                      <button
                        onClick={() => onEditProduct(p)}
                        className="table-icon-action-btn edit-btn-style"
                        title="Edit Product Info"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id, p.name)}
                        className="table-icon-action-btn delete-btn-style"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION FOOTER */}
        <footer className="table-pagination-footer-console font-inter">
          <div className="pagination-range-counter-info">
            Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> products
          </div>

          <div className="pagination-action-controls-button-group">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="console-pagination-step-btn"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="pagination-page-numeric-cluster">
              <button className="numeric-page-btn numeric-active-btn">
                {page}
              </button>
              {page * 10 < count && (
                <button 
                  onClick={() => setPage(page + 1)} 
                  disabled={loading}
                  className="numeric-page-btn"
                >
                  {page + 1}
                </button>
              )}
            </div>

            <button
              disabled={page * 10 >= count || loading}
              onClick={() => setPage(page + 1)}
              className="console-pagination-step-btn"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ProductList;
