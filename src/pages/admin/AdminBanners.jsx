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
  Image as ImageIcon,
  ExternalLink,
  Layers,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  adminFetchBanners, 
  adminCreateBanner, 
  adminUpdateBanner, 
  adminDeleteBanner 
} from "../../services/bannerService";
import { toast } from "react-toastify";
import "./AdminBanners.css";
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

const AdminBanners = () => {
  const { search } = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    total_banners: 0,
    active_banners: 0,
    hero_banners: 0,
    bottom_banners: 0
  });

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showConfirm } = useCustomDialog();

  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    display_position: "hero",
    redirect_url: "",
    priority_order: "0",
    is_active: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await adminFetchBanners({
        search: search || undefined,
        page,
        status: statusFilter !== "all" ? statusFilter : undefined,
        position: positionFilter || undefined
      });
      
      if (res.data.results) {
        setBanners(res.data.results);
        setCount(res.data.count);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setBanners(res.data.results || []);
        setCount(0);
      }
    } catch (err) {
      console.error("Error loading banners:", err);
      toast.error("Failed to load banners dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, positionFilter]);

  useEffect(() => {
    loadBanners();
  }, [page, search, statusFilter, positionFilter]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentId(null);
    setFormData({
      title: "",
      subtitle: "",
      display_position: "hero",
      redirect_url: "",
      priority_order: "0",
      is_active: true
    });
    setImageFile(null);
    setImagePreview("");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setModalMode("edit");
    setCurrentId(banner.id);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      display_position: banner.display_position,
      redirect_url: banner.redirect_url || "",
      priority_order: String(banner.priority_order || 0),
      is_active: banner.is_active
    });
    setImageFile(null);
    setImagePreview(banner.image); // Displays original saved image
    setErrors({});
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Banner title is required.";
    if (!formData.display_position) tempErrors.display_position = "Display position is required.";
    
    // For creation, image file is strictly required
    if (modalMode === "create" && !imageFile) {
      tempErrors.image = "Please upload an image for the banner.";
    }

    if (formData.redirect_url) {
      try {
        new URL(formData.redirect_url);
      } catch (_) {
        tempErrors.redirect_url = "Specify a valid URL (e.g. https://google.com or relative starting with http).";
      }
    }

    if (formData.priority_order !== "" && (isNaN(formData.priority_order) || Number(formData.priority_order) < 0)) {
      tempErrors.priority_order = "Priority order must be a positive integer.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    
    const sendData = new FormData();
    sendData.append("title", formData.title.trim());
    sendData.append("subtitle", formData.subtitle.trim());
    sendData.append("display_position", formData.display_position);
    sendData.append("redirect_url", formData.redirect_url.trim());
    sendData.append("priority_order", parseInt(formData.priority_order || 0, 10));
    sendData.append("is_active", formData.is_active);
    
    if (imageFile) {
      sendData.append("image", imageFile);
    }

    try {
      if (modalMode === "create") {
        await adminCreateBanner(sendData);
        toast.success("Banner published successfully.");
      } else {
        await adminUpdateBanner(currentId, sendData);
        toast.success("Banner updated successfully.");
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      console.error("Error saving banner:", err);
      const backendErrors = err.response?.data;
      if (backendErrors && typeof backendErrors === "object") {
        setErrors(backendErrors);
      } else {
        toast.error("An error occurred while saving the banner.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    const confirmed = await showConfirm(
      "Are you sure you want to permanently delete this banner?",
      "Delete Banner",
      "danger"
    );
    if (!confirmed) return;

    try {
      await adminDeleteBanner(id);
      toast.success("Banner deleted successfully.");
      loadBanners();
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("Failed to delete the banner.");
    }
  };

  const toggleBannerStatus = async (banner) => {
    const updatedStatus = !banner.is_active;
    const sendData = new FormData();
    sendData.append("is_active", updatedStatus);

    try {
      await adminUpdateBanner(banner.id, sendData);
      toast.success(`Banner is now ${updatedStatus ? "Active" : "Inactive"}.`);
      loadBanners();
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="admin-banners-page">
      {/* HEADER SECTION */}
      <div className="banners-header-row">
        <div>
          <h2 className="banners-page-title">Banner Management</h2>
          <p className="banners-page-subtitle">Configure carousels and product ads shown on the home page</p>
        </div>
        <button className="btn-add-banner" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          <span>Publish Banner</span>
        </button>
      </div>

      {/* STATS MATRIX SUMMARY */}
      <div className="banners-stats-grid">
        <div className="banner-stat-card">
          <div className="stat-icon-wrapper blue">
            <Layers size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Banners</span>
            <h3 className="stat-value">{stats.total_banners}</h3>
          </div>
        </div>

        <div className="banner-stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Advertisements</span>
            <h3 className="stat-value">{stats.active_banners}</h3>
          </div>
        </div>

        <div className="banner-stat-card">
          <div className="stat-icon-wrapper purple">
            <ImageIcon size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Hero Slot Banners</span>
            <h3 className="stat-value">{stats.hero_banners}</h3>
          </div>
        </div>

        <div className="banner-stat-card">
          <div className="stat-icon-wrapper orange">
            <ExternalLink size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Bottom Promo Banners</span>
            <h3 className="stat-value">{stats.bottom_banners}</h3>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="banners-filter-bar">
        <div className="filter-group">
          <label htmlFor="positionFilter">Position Slot</label>
          <select 
            id="positionFilter"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">All Slots</option>
            <option value="hero">Hero Showcase (Right Side)</option>
            <option value="bottom">Marketing Campaign (Bottom)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Banners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="banners-table-card">
        {loading ? (
          <div className="banners-loading-spinner-box">
            <Loader2 className="animate-spin" size={32} />
            <span>Loading banners list...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="banners-empty-state-box">
            <ImageIcon size={48} />
            <h3>No Banners Configured</h3>
            <p>Publish a banner promo to replace static placements on the homepage.</p>
            <button className="btn-add-banner mt-4" onClick={handleOpenCreateModal}>
              <Plus size={16} />
              <span>Create New Banner</span>
            </button>
          </div>
        ) : (
          <>
            <div className="banners-table-wrapper">
              <table className="banners-list-table">
                <thead>
                  <tr>
                    <th>Ad Layout Preview</th>
                    <th>Details</th>
                    <th>Display Position</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="td-image-preview">
                        <div className="banner-thumbnail-frame">
                          <img src={banner.image} alt={banner.title} className="banner-thumbnail-img" />
                        </div>
                      </td>
                      <td className="td-details">
                        <div className="banner-table-title">{banner.title}</div>
                        <div className="banner-table-subtitle">{banner.subtitle || "No subtitle"}</div>
                        {banner.redirect_url && (
                          <a 
                            href={banner.redirect_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="banner-table-link-preview"
                          >
                            <ExternalLink size={12} />
                            <span>Redirect Link</span>
                          </a>
                        )}
                      </td>
                      <td>
                        <span className={`position-badge ${banner.display_position}`}>
                          {banner.display_position === "hero" ? "Hero Slot" : "Bottom Banner"}
                        </span>
                      </td>
                      <td className="font-semibold">{banner.priority_order}</td>
                      <td>
                        <button
                          onClick={() => toggleBannerStatus(banner)}
                          className={`status-toggle-pill ${banner.is_active ? "active" : "inactive"}`}
                          title="Click to toggle status"
                        >
                          {banner.is_active ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td>{formatDateForTable(banner.created_at)}</td>
                      <td className="td-actions">
                        <button className="btn-action edit" onClick={() => handleOpenEditModal(banner)} title="Edit Banner">
                          <Pencil size={15} />
                        </button>
                        <button className="btn-action delete" onClick={() => handleDeleteBanner(banner.id)} title="Delete Banner">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION PANEL */}
            {count > 10 && (
              <div className="banners-pagination-row">
                <span className="pagination-info-text">
                  Showing {banners.length} of {count} entries
                </span>
                <div className="pagination-buttons">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                    className="btn-pagination-nav"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="pagination-current-page">{page}</span>
                  <button 
                    disabled={page * 10 >= count} 
                    onClick={() => setPage(page + 1)}
                    className="btn-pagination-nav"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE & EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="banners-modal-overlay">
          <div className="banners-modal-card">
            <div className="modal-header-row">
              <h3>{modalMode === "create" ? "Publish New Banner" : "Edit Banner Configuration"}</h3>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="banners-modal-form">
              <div className="form-two-column">
                <div className="form-field">
                  <label htmlFor="title">Banner Header / Title *</label>
                  <input 
                    type="text" 
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Winter Wanderlust: Up to 30% Off"
                  />
                  {errors.title && <span className="field-error-msg">{errors.title}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="subtitle">Sub-header / Description</label>
                  <input 
                    type="text" 
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="e.g. Equip your adventure with seasonal elite gear"
                  />
                  {errors.subtitle && <span className="field-error-msg">{errors.subtitle}</span>}
                </div>
              </div>

              <div className="form-three-column">
                <div className="form-field">
                  <label htmlFor="display_position">Display Layout Position *</label>
                  <select 
                    id="display_position"
                    value={formData.display_position}
                    onChange={(e) => setFormData({...formData, display_position: e.target.value})}
                  >
                    <option value="hero">Hero Showcase (Right Card)</option>
                    <option value="bottom">Marketing Campaign (Bottom Block)</option>
                  </select>
                  {errors.display_position && <span className="field-error-msg">{errors.display_position}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="priority_order">Priority Sort Order</label>
                  <input 
                    type="number" 
                    id="priority_order"
                    value={formData.priority_order}
                    onChange={(e) => setFormData({...formData, priority_order: e.target.value})}
                    placeholder="e.g. 1"
                  />
                  {errors.priority_order && <span className="field-error-msg">{errors.priority_order}</span>}
                </div>

                <div className="form-field justify-center">
                  <label className="checkbox-form-label">
                    <input 
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span>Set Banner Active Immediately</span>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="redirect_url">CTA Button Redirect Target Link</label>
                <input 
                  type="text" 
                  id="redirect_url"
                  value={formData.redirect_url}
                  onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                  placeholder="e.g. /shop?promo=winter or https://travelkart.com/shop"
                />
                {errors.redirect_url && <span className="field-error-msg">{errors.redirect_url}</span>}
              </div>

              {/* IMAGE DRAG & DROP ZONE */}
              <div className="form-field">
                <label>Banner Image Asset *</label>
                <div className="banners-image-dropzone">
                  <input 
                    type="file" 
                    id="bannerImageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <label htmlFor="bannerImageInput" className="dropzone-clickable-label">
                    {imagePreview ? (
                      <div className="dropzone-preview-container">
                        <img src={imagePreview} alt="Preview" className="dropzone-preview-img" />
                        <div className="dropzone-overlay-text">Click or drag new asset to replace</div>
                      </div>
                    ) : (
                      <div className="dropzone-placeholder-content">
                        <ImageIcon size={36} className="text-gray-400" />
                        <span className="placeholder-text-main">Click here to upload banner graphic</span>
                        <span className="placeholder-text-sub">Supports PNG, JPG, WEBP formats</span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.image && <span className="field-error-msg">{errors.image}</span>}
              </div>

              <div className="modal-actions-wrapper">
                <button 
                  type="button" 
                  className="btn-modal-cancel" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-modal-submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <span>Publish Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
