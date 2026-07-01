import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Ticket, 
  Calendar,
  Percent
} from "lucide-react";
import { 
  adminFetchCoupons, 
  adminCreateCoupon, 
  adminUpdateCoupon, 
  adminDeleteCoupon 
} from "../../services/couponService";
import { toast } from "react-toastify";
import "./AdminCoupons.css";
import { useCustomDialog } from "../../components/CustomDialog";

const formatDateForTable = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateToLocalString = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
};

const AdminCoupons = () => {
  const { search } = useOutletContext();
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    total_active: 0,
    redemptions: 0,
    revenue_saved: 0,
    expiring_soon: 0
  });

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useCustomDialog();

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "PERCENT",
    discount_value: "",
    min_order_amount: "0",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_to: "",
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminFetchCoupons({
        search: search || undefined,
        page,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter || undefined
      });
      
      if (res.data.results) {
        setCoupons(res.data.results);
        setCount(res.data.count);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setCoupons(res.data.results || []);
        setCount(0);
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
      toast.error("Failed to load coupons dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadCoupons();
  }, [page, search, statusFilter, typeFilter]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentId(null);
    setFormData({
      code: "",
      discount_type: "PERCENT",
      discount_value: "",
      min_order_amount: "0",
      max_discount: "",
      usage_limit: "",
      valid_from: new Date().toISOString().slice(0, 16),
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      is_active: true
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setModalMode("edit");
    setCurrentId(coupon.id);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount),
      max_discount: coupon.max_discount ? String(coupon.max_discount) : "",
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      valid_from: dateToLocalString(coupon.valid_from),
      valid_to: dateToLocalString(coupon.valid_to),
      is_active: coupon.is_active
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.code.trim()) tempErrors.code = "Coupon code is required.";
    if (!formData.discount_value || isNaN(formData.discount_value) || Number(formData.discount_value) <= 0) {
      tempErrors.discount_value = "Specify a valid positive discount value.";
    }
    
    if (formData.discount_type === "PERCENT" && Number(formData.discount_value) > 100) {
      tempErrors.discount_value = "Percentage discount cannot exceed 100%.";
    }

    if (!formData.min_order_amount || isNaN(formData.min_order_amount) || Number(formData.min_order_amount) < 0) {
      tempErrors.min_order_amount = "Specify a valid order threshold (min 0).";
    }

    if (formData.max_discount && (isNaN(formData.max_discount) || Number(formData.max_discount) < 0)) {
      tempErrors.max_discount = "Must be a positive number.";
    }

    if (formData.usage_limit && (isNaN(formData.usage_limit) || Number(formData.usage_limit) <= 0)) {
      tempErrors.usage_limit = "Must be a valid positive limit count.";
    }

    if (!formData.valid_from) tempErrors.valid_from = "Start activation date is required.";
    if (!formData.valid_to) tempErrors.valid_to = "Expiration date is required.";

    if (formData.valid_from && formData.valid_to && new Date(formData.valid_from) >= new Date(formData.valid_to)) {
      tempErrors.valid_to = "Expiration date must be after start activation date.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      ...formData,
      discount_value: parseInt(formData.discount_value, 10),
      min_order_amount: parseInt(formData.min_order_amount, 10),
      max_discount: formData.max_discount ? parseInt(formData.max_discount, 10) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit, 10) : null,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_to: new Date(formData.valid_to).toISOString(),
    };

    try {
      if (modalMode === "create") {
        await adminCreateCoupon(payload);
        toast.success(`Coupon ${payload.code} created successfully.`);
      } else {
        await adminUpdateCoupon(currentId, payload);
        toast.success(`Coupon ${payload.code} updated successfully.`);
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      console.error("Error saving coupon:", err);
      const backendError = err.response?.data;
      if (backendError && typeof backendError === "object") {
        setErrors(backendError);
        toast.error("Validation failed. Please correct form fields.");
      } else {
        toast.error("Failed to save coupon details.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete coupon "${code}"?`,
      "Delete Coupon",
      "error"
    );
    if (!confirmed) return;

    try {
      await adminDeleteCoupon(id);
      toast.success(`Coupon "${code}" deleted.`);
      loadCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
      toast.error("Failed to delete coupon.");
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("");
  };

  const totalPages = Math.ceil(count / 10);

  const startItemRange = (page - 1) * 10 + 1;
  const endItemRange = Math.min(page * 10, count);

  return (
    <div className="admin-container">
      {/* Workspace Structural Section Title Header */}
      <div className="workspace-header-row category-header-flex">
        <div>
          <h1 className="workspace-title font-plus-jakarta">Coupons</h1>
          <p className="subtitle-text-node font-inter font-medium" style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--admin-text-dimmed)" }}>
            Create and manage discount offers
          </p>
        </div>
        <button className="primary-action-btn font-inter" onClick={handleOpenCreateModal}>
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* METRIC SCOREBOARD */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper active-icon-bg">
              <Ticket size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Total Active</span>
          <span className="stat-value font-plus-jakarta">{stats.total_active}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper total-icon-bg">
              <Percent size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Redemptions</span>
          <span className="stat-value font-plus-jakarta">{stats.redemptions.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper gold-icon-bg">
              <span style={{ fontWeight: "700", fontSize: "16px" }}>₹</span>
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Revenue Saved</span>
          <span className="stat-value font-plus-jakarta">
            ₹{stats.revenue_saved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper unverified-icon-bg">
              <Calendar size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Expiring Soon</span>
          <span className="stat-value font-plus-jakarta">{stats.expiring_soon}</span>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="coupons-filters-bar">
        <div className="filters-left-group">
          <div className="filter-select-wrapper font-inter">
            <label className="form-field-label">Status Filter</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-select-wrapper font-inter">
            <label className="form-field-label">Type Filter</label>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">Type: All</option>
              <option value="percent">Percentage</option>
              <option value="flat">Fixed / Flat</option>
            </select>
          </div>
        </div>

        {(statusFilter !== "all" || typeFilter !== "") && (
          <button className="btn-clear-filters font-inter" onClick={handleClearFilters}>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* CORE DATA TABLE MODULE WRAPPER */}
      <div className="table-card-frame">
        <table className="figma-dark-table font-inter">
          <thead>
            <tr>
              <th className="uppercase">Code</th>
              <th className="uppercase">Type</th>
              <th className="uppercase">Value</th>
              <th className="uppercase">Min Purchase</th>
              <th className="uppercase">Expiry Date</th>
              <th className="uppercase">Usage Limit</th>
              <th className="uppercase">Status</th>
              <th className="uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-empty-row text-center">
                  Loading coupons from database...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-row text-center">
                  No matching coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const isExpired = new Date(coupon.valid_to) < new Date();
                const statusClass = !coupon.is_active 
                  ? "status-inactive" 
                  : isExpired 
                    ? "status-expired" 
                    : "status-active";
                
                const statusLabel = !coupon.is_active 
                  ? "Inactive" 
                  : isExpired 
                    ? "Expired" 
                    : "Active";

                return (
                  <tr key={coupon.id}>
                    <td>
                      <span 
                        className="coupon-code-badge"
                        onClick={() => handleOpenEditModal(coupon)}
                        title="Click to edit coupon settings"
                      >
                        {coupon.code}
                      </span>
                    </td>
                    <td>
                      {coupon.discount_type === "PERCENT" ? "Percentage" : "Fixed Amount"}
                    </td>
                    <td>
                      {coupon.discount_type === "PERCENT" ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontWeight: "600" }}>
                          {coupon.discount_value}<Percent size={13} />
                        </span>
                      ) : (
                        <span style={{ fontWeight: "600" }}>₹{coupon.discount_value}</span>
                      )}
                    </td>
                    <td className="table-row-timestamp-text">₹{coupon.min_order_amount.toFixed(2)}</td>
                    <td className="table-row-timestamp-text">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={13} style={{ color: "#64748B" }} />
                        {formatDateForTable(coupon.valid_to)}
                      </span>
                    </td>
                    <td className="table-row-timestamp-text">
                      {coupon.usage_limit ? (
                        <span>{coupon.used_count} / {coupon.usage_limit}</span>
                      ) : (
                        <span style={{ color: "#64748B" }}>Unlimited</span>
                      )}
                    </td>
                    <td>
                      <span className={`coupon-status-badge ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell-alignment-box coupon-actions-gap">
                        <button 
                          className="table-icon-action-btn edit-btn-style" 
                          onClick={() => handleOpenEditModal(coupon)}
                          title="Edit Coupon Settings"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="table-icon-action-btn delete-btn-style" 
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* METRIC ADVANCEMENT PAGINATION CORE CONSOLE */}
        {totalPages > 1 && (
          <footer className="table-pagination-footer-console font-inter">
            <div className="pagination-range-counter-info">
              Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> coupons
            </div>

            <div className="pagination-action-controls-button-group">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="console-pagination-step-btn"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="pagination-page-numeric-cluster">
                <button className="numeric-page-btn numeric-active-btn">
                  {page}
                </button>
                {page < totalPages && (
                  <button 
                    onClick={() => setPage(page + 1)}
                    className="numeric-page-btn"
                  >
                    {page + 1}
                  </button>
                )}
              </div>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="console-pagination-step-btn"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </div>

      <footer className="admin-footer-branding font-inter">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>

      {/* DYNAMIC CRUD MODAL OVERLAY PORTAL */}
      {isModalOpen && (
        <div className="modal-portal-overlay">
          <div className="modal-dialog-frame font-inter">
            <div className="modal-dialog-header">
              <div className="modal-header-title-wrapper">
                <Ticket className="modal-header-icon" size={18} />
                <h3 className="modal-header-text">
                  {modalMode === "create" ? "Create Coupon Cluster" : "Edit Coupon Registry"}
                </h3>
              </div>
              <button className="modal-close-trigger" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCoupon} className="modal-dialog-form">
              <div className="form-fields-container">
                {/* Coupon Code */}
                <div className="form-input-group">
                  <label className="form-field-label">Coupon Code <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VOYAGE10"
                    className={`form-field-input ${errors.code ? "input-field-error" : ""}`}
                    disabled={modalMode === "edit"}
                    required
                  />
                  {errors.code && (
                    <span className="field-error-message">
                      <AlertCircle size={12} />
                      <span>{errors.code}</span>
                    </span>
                  )}
                </div>

                <div className="form-row-double">
                  {/* Discount Type */}
                  <div className="form-input-group">
                    <label className="form-field-label">Discount Type</label>
                    <select 
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="form-field-input"
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FLAT">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  
                  {/* Discount Value */}
                  <div className="form-input-group">
                    <label className="form-field-label">Discount Value <span className="required-star">*</span></label>
                    <input 
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      placeholder={formData.discount_type === "PERCENT" ? "10" : "150"}
                      className={`form-field-input ${errors.discount_value ? "input-field-error" : ""}`}
                      required
                    />
                    {errors.discount_value && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.discount_value}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row-double">
                  {/* Min Purchase Requirement */}
                  <div className="form-input-group">
                    <label className="form-field-label">Min. Purchase Requirement (₹)</label>
                    <input 
                      type="number" 
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                      placeholder="0"
                      className={`form-field-input ${errors.min_order_amount ? "input-field-error" : ""}`}
                    />
                    {errors.min_order_amount && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.min_order_amount}</span>
                      </span>
                    )}
                  </div>

                  {/* Max Discount Cap */}
                  <div className="form-input-group">
                    <label className="form-field-label">Max Discount Cap (₹)</label>
                    <input 
                      type="number" 
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      placeholder="Unlimited"
                      className={`form-field-input ${errors.max_discount ? "input-field-error" : ""}`}
                      disabled={formData.discount_type === "FLAT"}
                    />
                    {errors.max_discount && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.max_discount}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row-double">
                  {/* Valid From */}
                  <div className="form-input-group">
                    <label className="form-field-label">Valid From <span className="required-star">*</span></label>
                    <input 
                      type="datetime-local" 
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className={`form-field-input ${errors.valid_from ? "input-field-error" : ""}`}
                      required
                    />
                    {errors.valid_from && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.valid_from}</span>
                      </span>
                    )}
                  </div>

                  {/* Valid To */}
                  <div className="form-input-group">
                    <label className="form-field-label">Valid To <span className="required-star">*</span></label>
                    <input 
                      type="datetime-local" 
                      value={formData.valid_to}
                      onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                      className={`form-field-input ${errors.valid_to ? "input-field-error" : ""}`}
                      required
                    />
                    {errors.valid_to && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.valid_to}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row-double" style={{ alignItems: "center" }}>
                  {/* Usage Limit */}
                  <div className="form-input-group">
                    <label className="form-field-label">Total Usage Limit (Optional)</label>
                    <input 
                      type="number" 
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      placeholder="Unlimited"
                      className={`form-field-input ${errors.usage_limit ? "input-field-error" : ""}`}
                    />
                    {errors.usage_limit && (
                      <span className="field-error-message">
                        <AlertCircle size={12} />
                        <span>{errors.usage_limit}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Toggle control */}
                  <div className="form-toggle-group" style={{ alignSelf: "flex-end", height: "44px", width: "100%", boxSizing: "border-box", padding: "0 16px" }}>
                    <div className="toggle-label-column">
                      <span className="toggle-label-title" style={{ fontSize: "13px" }}>Status Control</span>
                    </div>
                    <label className="switch-toggle-node">
                      <input 
                        type="checkbox" 
                        name="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <span className="switch-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="modal-dialog-footer">
                <button 
                  type="button" 
                  className="btn-cancel font-inter" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit font-inter" 
                  disabled={saving}
                >
                  {saving ? "Saving..." : modalMode === "create" ? "Create Coupon" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
