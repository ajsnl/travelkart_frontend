import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FolderTree, 
  Check, 
  AlertCircle,
  Calendar,
  Hash
} from "lucide-react";
import { 
  adminFetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../services/categoryService";
import { toast } from "react-toastify";
import "./AdminCategory.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Collapse consecutive hyphens
};

const AdminCategory = () => {
  const { search } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: false,
  });
  const [errors, setErrors] = useState({});
  const isSlugManuallyEdited = useRef(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminFetchCategories({
        search,
        page,
      });
      setCategories(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, [search, page]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      
      // Auto-generate slug if name is edited and slug hasn't been manually edited
      if (name === "name" && !isSlugManuallyEdited.current) {
        updated.slug = slugify(value);
      }
      return updated;
    });

    if (name === "slug") {
      isSlugManuallyEdited.current = true;
    }

    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Open Modal
  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setErrors({});
    if (mode === "edit" && category) {
      setCurrentId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        is_active: category.is_active,
      });
      isSlugManuallyEdited.current = true;
    } else {
      setCurrentId(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        is_active: true,
      });
      isSlugManuallyEdited.current = false;
    }
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      slug: "",
      description: "",
      is_active: false,
    });
    setErrors({});
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Modal Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (modalMode === "create") {
        await createCategory(formData);
        toast.success("Category created successfully!");
      } else {
        await updateCategory(currentId, formData);
        toast.success("Category updated successfully!");
      }
      closeModal();
      loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      if (err.response && err.response.data) {
        // Backend validation errors (e.g. duplicate name or slug)
        setErrors(err.response.data);
        const errorMsg = Object.values(err.response.data).flat().join(" ");
        toast.error(errorMsg || "Failed to save category.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success("Category soft-deleted successfully.");
        // If current page empty after deletion, move back if possible
        if (categories.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadCategories();
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        toast.error("Failed to delete category.");
      }
    }
  };

  // Toggle Active Status Directly from table row
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateCategory(id, { is_active: !currentStatus });
      toast.success("Status updated successfully.");
      loadCategories();
    } catch (err) {
      console.error("Error toggling active status:", err);
      toast.error("Failed to update status.");
    }
  };

  // Pagination bounds calculation
  const startItemRange = (page - 1) * 5 + 1;
  const endItemRange = Math.min(page * 5, count);

  return (
    <div className="admin-container">
      {/* Workspace Structural Section Title Header */}
      <div className="workspace-header-row category-header-flex">
        <div>
          <h1 className="workspace-title font-plus-jakarta">Category Management</h1>
        </div>
        <button className="primary-action-btn font-inter" onClick={() => openModal("create")}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* METRIC CARD SCOREBOARD */}
      <div className="category-stats-bar">
        <div className="category-stat-mini-card">
          <div className="mini-card-icon-frame">
            <FolderTree size={18} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Total Categories</span>
            <span className="mini-card-val">{count}</span>
          </div>
        </div>
      </div>

      {/* CORE DATA TABLE MODULE WRAPPER */}
      <div className="table-card-frame">
        <table className="figma-dark-table font-inter">
          <thead>
            <tr>
              <th className="uppercase">Category Details</th>
              <th className="uppercase">Slug Field</th>
              <th className="uppercase">Description</th>
              <th className="uppercase">Created Date</th>
              <th className="uppercase">Status</th>
              <th className="uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-empty-row text-center">
                  Loading categories from registry system...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-row text-center">
                  No matching categories found.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  {/* Category Name details column */}
                  <td>
                    <div className="category-title-cell">
                      <span className="category-cell-name">{c.name}</span>
                    </div>
                  </td>

                  {/* Slug column */}
                  <td>
                    <span className="category-cell-slug code-text">{c.slug}</span>
                  </td>

                  {/* Description column */}
                  <td>
                    <span className="category-cell-desc" title={c.description}>
                      {c.description ? (
                        c.description.length > 50 ? `${c.description.substring(0, 50)}...` : c.description
                      ) : (
                        <span className="italic text-slate-700">No description provided</span>
                      )}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="table-row-timestamp-text">
                    {formatDate(c.created_at)}
                  </td>

                  {/* Status Toggle Badge */}
                  <td>
                    <div 
                      className="status-toggle-wrapper" 
                      onClick={() => handleToggleActive(c.id, c.is_active)}
                      title="Click to toggle active status"
                    >
                      <span className={`status-dot-indicator ${c.is_active ? "dot-active" : "dot-suspended"}`} />
                      <span className={`status-label-node-text ${c.is_active ? "text-active" : "text-suspended"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td>
                    <div className="actions-cell-alignment-box category-actions-gap">
                      <button
                        onClick={() => openModal("edit", c)}
                        className="table-icon-action-btn edit-btn-style"
                        title="Edit Category Attributes"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="table-icon-action-btn delete-btn-style"
                        title="Soft-Delete Category"
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

        {/* METRIC ADVANCEMENT PAGINATION CORE CONSOLE */}
        <footer className="table-pagination-footer-console font-inter">
          <div className="pagination-range-counter-info">
            Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> categories
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
              {page * 5 < count && (
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
              disabled={page * 5 >= count || loading}
              onClick={() => setPage(page + 1)}
              className="console-pagination-step-btn"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      {/* FOOTER ANCHOR */}
      <footer className="admin-footer-branding font-inter">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>

      {/* DYNAMIC CRUD MODAL OVERLAY PORTAL */}
      {isModalOpen && (
        <div className="modal-portal-overlay">
          <div className="modal-dialog-frame font-inter">
            <div className="modal-dialog-header">
              <div className="modal-header-title-wrapper">
                <FolderTree className="modal-header-icon" size={18} />
                <h3 className="modal-header-text">
                  {modalMode === "create" ? "Add Category Cluster" : "Edit Category Registry"}
                </h3>
              </div>
              <button className="modal-close-trigger" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-dialog-form">
              <div className="form-fields-container">
                {/* Name Field */}
                <div className="form-input-group">
                  <label htmlFor="category-name" className="form-field-label">
                    Category Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name (e.g. Hiking Gear)"
                    className={`form-field-input ${errors.name ? "input-field-error" : ""}`}
                    autoFocus
                  />
                  {errors.name && (
                    <span className="field-error-message">
                      <AlertCircle size={12} />
                      <span>{errors.name}</span>
                    </span>
                  )}
                </div>

                {/* Slug Field */}
                <div className="form-input-group">
                  <label htmlFor="category-slug" className="form-field-label">
                    System Unique Slug <span className="required-star">*</span>
                  </label>
                  <div className="slug-input-wrapper">
                    <input
                      id="category-slug"
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g. hiking-gear"
                      className={`form-field-input ${errors.slug ? "input-field-error" : ""}`}
                    />
                  </div>
                  {errors.slug && (
                    <span className="field-error-message">
                      <AlertCircle size={12} />
                      <span>{errors.slug}</span>
                    </span>
                  )}
                  <span className="field-helper-info">
                    Automated URL routing code generated from Name. Custom slugs are permitted.
                  </span>
                </div>

                {/* Description Field */}
                <div className="form-input-group">
                  <label htmlFor="category-desc" className="form-field-label">Description</label>
                  <textarea
                    id="category-desc"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of items in this category..."
                    className="form-field-textarea"
                    rows={4}
                  />
                </div>

                {/* Status Toggle */}
                <div className="form-toggle-group">
                  <div className="toggle-label-column">
                    <span className="toggle-label-title">Status Control</span>
                    <span className="toggle-label-desc">Allow products to be added to this category</span>
                  </div>
                  <label className="switch-toggle-node">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="switch-toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="modal-dialog-footer">
                <button type="button" className="btn-cancel font-inter" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit font-inter">
                  {modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategory;