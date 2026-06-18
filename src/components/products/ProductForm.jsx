import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, AlertCircle, Plus, Trash2, Settings, Globe, Clock, Layers } from "lucide-react";
import { toast } from "react-toastify";

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") 
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/-+/g, "-"); 
};

const ProductForm = ({
  initialData,
  categories,
  onCancel,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    category: "",
    brand: "",
    is_active: true,
    is_featured: false,
    free_delivery: false,
    est_delivery_time: "3 Business Days",
    attributes: {},
    variants: [],
    images: [],
    offer_type: "none",
    offer_value: 0.00,
    total_sales: 0
  });

  const [options, setOptions] = useState([
    { name: "Color", values: [] },
    { name: "Capacity", values: [] }
  ]);
  const [newOptionValue, setNewOptionValue] = useState({ 0: "", 1: "" });
  const [errors, setErrors] = useState({});
  const isSlugManuallyEdited = useRef(false);

  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  // Sync parent and subcategory states whenever category in form data changes
  useEffect(() => {
    const currentCatId = formData.category;
    if (currentCatId) {
      const matchedCat = categories.find(c => c.id === parseInt(currentCatId));
      if (matchedCat) {
        if (matchedCat.parent) {
          setParentCategoryId(matchedCat.parent);
          setSubcategoryId(matchedCat.id);
        } else {
          setParentCategoryId(matchedCat.id);
          setSubcategoryId("");
        }
        return;
      }
    }
    setParentCategoryId("");
    setSubcategoryId("");
  }, [formData.category, categories]);

  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value;
    setParentCategoryId(parentId);
    setSubcategoryId("");
    
    // Default form category to parent category if set, else empty
    setFormData(prev => ({ 
      ...prev, 
      category: parentId ? parseInt(parentId) : "" 
    }));
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: "" }));
    }
  };

  const handleSubcategoryChange = (e) => {
    const subId = e.target.value;
    setSubcategoryId(subId);
    
    // Set form category to subcategory if selected, fallback to parent category
    setFormData(prev => ({ 
      ...prev, 
      category: subId ? parseInt(subId) : (parentCategoryId ? parseInt(parentCategoryId) : "") 
    }));
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        short_description: initialData.short_description || "",
        description: initialData.description || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_featured: initialData.is_featured || false,
        free_delivery: initialData.free_delivery || false,
        est_delivery_time: initialData.est_delivery_time || "3 Business Days",
        attributes: initialData.attributes || {},
        variants: initialData.variants || [],
        images: initialData.images || [],
        offer_type: initialData.offer_type || "none",
        offer_value: initialData.offer_value || 0.00,
        total_sales: initialData.total_sales || 0
      });
      isSlugManuallyEdited.current = true;
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].id, offer_type: "none", offer_value: 0.00, total_sales: 0 }));
    }
  }, [initialData, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "name" && !isSlugManuallyEdited.current) {
        updated.slug = slugify(value);
      }
      return updated;
    });

    if (name === "slug") {
      isSlugManuallyEdited.current = true;
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddOptionValue = (index) => {
    const val = newOptionValue[index]?.trim();
    if (!val) return;

    if (options[index].values.includes(val)) {
      toast.warning("Value already exists.");
      return;
    }

    const updatedOptions = [...options];
    updatedOptions[index].values.push(val);
    setOptions(updatedOptions);
    setNewOptionValue(prev => ({ ...prev, [index]: "" }));
  };

  const handleRemoveOptionValue = (optIndex, valIndex) => {
    const updatedOptions = [...options];
    updatedOptions[optIndex].values.splice(valIndex, 1);
    setOptions(updatedOptions);
  };

  const handleAddOptionField = () => {
    setOptions([...options, { name: "", values: [] }]);
  };

  const handleRemoveOptionField = (optIndex) => {
    const updatedOptions = [...options];
    updatedOptions.splice(optIndex, 1);
    setOptions(updatedOptions);
  };

  const handleOptionNameChange = (index, name) => {
    const updatedOptions = [...options];
    updatedOptions[index].name = name;
    setOptions(updatedOptions);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.slug.trim()) newErrors.slug = "System unique slug is required.";
    if (!formData.category) newErrors.category = "Category selection is required.";
    if (!formData.brand.trim()) newErrors.brand = "Brand name is required.";
    
    // Check options values if configuring new product
    if (!initialData) {
      const activeOptions = options.filter(opt => opt.name.trim() !== "" && opt.values.length > 0);
      if (activeOptions.length === 0) {
        newErrors.options = "Please configure at least one option type (e.g., Color) with values.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.options) {
        toast.error(errors.options);
      }
      return;
    }
    onSubmit(formData, options);
  };

  const getFormattedCategories = () => {
    const parents = categories.filter(c => !c.parent);
    const formatted = [];
    
    parents.forEach(parent => {
      formatted.push({ ...parent, displayName: parent.name });
      
      const children = categories.filter(c => c.parent === parent.id);
      children.forEach(child => {
        formatted.push({ ...child, displayName: `  ↳ ${child.name}` });
      });
    });
    
    // Add any subcategories whose parent is missing from current category listing
    categories.forEach(c => {
      if (c.parent && !parents.some(p => p.id === c.parent) && !formatted.some(f => f.id === c.id)) {
        formatted.push({ ...c, displayName: c.name });
      }
    });
    
    return formatted;
  };

  return (
    <div className="product-workspace-layout">
      {/* Form header */}
      <div className="workspace-form-header">
        <div className="header-left">
          <button type="button" className="back-navigation-btn" onClick={onCancel}>
            <ChevronLeft size={16} />
            <span>Back to Products</span>
          </button>
          <h2 className="workspace-form-title font-plus-jakarta">
            {initialData ? "Update Product Basic Details" : "Publish Premium Travel Product"}
          </h2>
        </div>
        <div className="header-right">
          <button type="button" className="btn-cancel font-inter" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="product-details-form" className="btn-submit font-inter" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Save Changes" : "Create Product and Generate Variants"}
          </button>
        </div>
      </div>

      <form id="product-details-form" onSubmit={handleFormSubmit} className="workspace-editor-grid">
        {/* Left Column */}
        <div className="workspace-main-panel">
          {/* Basic Information card */}
          <div className="form-section-card">
            <h4 className="section-card-title">Basic Information</h4>
            <div className="form-input-group">
              <label htmlFor="prod-name" className="form-field-label">
                Product Name <span className="required-star">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Nomad Executive Travel Trunk"
                className={`form-field-input ${errors.name ? "input-field-error" : ""}`}
              />
              {errors.name && <span className="field-error-message"><AlertCircle size={12}/>{errors.name}</span>}
            </div>

            <div className="form-input-group">
              <label htmlFor="prod-slug" className="form-field-label">
                System Slug <span className="required-star">*</span>
              </label>
              <input
                id="prod-slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., nomad-executive-travel-trunk"
                className={`form-field-input ${errors.slug ? "input-field-error" : ""}`}
              />
              {errors.slug && <span className="field-error-message"><AlertCircle size={12}/>{errors.slug}</span>}
            </div>

            <div className="form-input-group mt-4">
              <label htmlFor="prod-short-desc" className="form-field-label">Short Description</label>
              <input
                id="prod-short-desc"
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                placeholder="Brief summary for catalog previews..."
                className="form-field-input"
              />
            </div>

            <div className="form-input-group mt-4">
              <label htmlFor="prod-desc" className="form-field-label">Full Description</label>
              <textarea
                id="prod-desc"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Elaborate on product specifications, materials, and benefits..."
                className="form-field-textarea"
                rows={5}
              />
            </div>
          </div>

          {/* Pricing and Variant Configuration (Only shown when creating a new product) */}
          {!initialData && (
            <div className="form-section-card">
              <div className="option-header-row">
                <h4 className="section-card-title m-0">Configure Option Attributes</h4>
                <button 
                  type="button" 
                  className="btn-secondary-action"
                  onClick={handleAddOptionField}
                >
                  <Plus size={14}/> Add Option Type
                </button>
              </div>

              {options.map((option, optIdx) => (
                <div key={optIdx} className="option-config-card">
                  <div className="option-input-row">
                    <input 
                      type="text" 
                      value={option.name} 
                      onChange={(e) => handleOptionNameChange(optIdx, e.target.value)}
                      placeholder="Option Name (e.g., Color, Size, Capacity)"
                      className="form-field-input option-name-input"
                    />
                    {options.length > 1 && (
                      <button 
                        type="button" 
                        className="option-delete-btn"
                        onClick={() => handleRemoveOptionField(optIdx)}
                        title="Delete Option Type"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>

                  {/* Values pills row */}
                  <div className="option-values-container">
                    {option.values.map((val, valIdx) => (
                      <span key={valIdx} className="badge-option-value">
                        {val}
                        <button 
                          type="button" 
                          className="option-value-delete-cross"
                          onClick={() => handleRemoveOptionValue(optIdx, valIdx)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <div className="option-value-add-box">
                      <input 
                        type="text"
                        value={newOptionValue[optIdx] || ""}
                        onChange={(e) => setNewOptionValue(prev => ({ ...prev, [optIdx]: e.target.value }))}
                        placeholder="Add value..."
                        className="form-field-input option-value-input"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOptionValue(optIdx))}
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddOptionValue(optIdx)}
                        className="option-value-add-btn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="form-field-helper-alert">
                <Layers size={14} className="helper-alert-icon" />
                <span>Generating the variant combinations will automatically map options together to build product combination entries. You will edit the price and stock for each variant individually in the next step.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="workspace-side-panel">
          {/* Category selection card */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><Settings size={14}/> Category Assignment</h4>
            
            <div className="form-input-group">
              <label htmlFor="prod-category" className="form-field-label">Category</label>
              <select
                id="prod-category"
                name="category"
                value={parentCategoryId}
                onChange={handleParentCategoryChange}
                className={`form-field-input w-full bg-slate-950 text-slate-300 ${errors.category ? "input-field-error" : ""}`}
              >
                <option value="">Select main category...</option>
                {categories
                  .filter(c => !c.parent)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                }
              </select>
              {errors.category && <span className="field-error-message"><AlertCircle size={12}/>{errors.category}</span>}
            </div>

            {(() => {
              const availableSubcategories = parentCategoryId
                ? categories.filter(c => c.parent === parseInt(parentCategoryId))
                : [];
                
              if (parentCategoryId && availableSubcategories.length > 0) {
                return (
                  <div className="form-input-group mt-4">
                    <label htmlFor="prod-subcategory" className="form-field-label">Subcategory (Optional)</label>
                    <select
                      id="prod-subcategory"
                      name="subcategory"
                      value={subcategoryId}
                      onChange={handleSubcategoryChange}
                      className="form-field-input w-full bg-slate-950 text-slate-300"
                    >
                      <option value="">None (Keep in parent category)</option>
                      {availableSubcategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            <div className="form-input-group mt-4">
              <label htmlFor="prod-brand" className="form-field-label">
                Brand <span className="required-star">*</span>
              </label>
              <input
                id="prod-brand"
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g. TravelKart Elite"
                className={`form-field-input ${errors.brand ? "input-field-error" : ""}`}
              />
              {errors.brand && (
                <span className="field-error-message">
                  <AlertCircle size={12} />
                  {errors.brand}
                </span>
              )}
            </div>
          </div>

          {/* Promotion Settings Card */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2">
              <Settings size={14}/> Promotion Settings
            </h4>
            
            <div className="form-input-group">
              <label htmlFor="prod-total-sales" className="form-field-label">
                Simulated Sales Count (for Best Seller badge)
              </label>
              <input
                id="prod-total-sales"
                type="number"
                name="total_sales"
                min="0"
                value={formData.total_sales}
                onChange={handleInputChange}
                placeholder="e.g., 150"
                className="form-field-input"
              />
            </div>
          </div>

          {/* Visibility and Status Card */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><Globe size={14}/> Visibility and Status</h4>

            {/* Active Toggle */}
            <div className="toggle-setting-row">
              <div className="toggle-text-container">
                <span className="toggle-setting-title">Active Status</span>
                <span className="toggle-setting-desc">Show this product in the store catalog</span>
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

            {/* Featured Toggle */}
            <div className="toggle-setting-row">
              <div className="toggle-text-container">
                <span className="toggle-setting-title">Featured Product</span>
                <span className="toggle-setting-desc">Highlight this product on the home landing page</span>
              </div>
              <label className="switch-toggle-node">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                <span className="switch-toggle-slider" />
              </label>
            </div>

            {/* Free Delivery Toggle */}
            <div className="toggle-setting-row">
              <div className="toggle-text-container">
                <span className="toggle-setting-title">Free Shipping</span>
                <span className="toggle-setting-desc">Offer free delivery globally</span>
              </div>
              <label className="switch-toggle-node">
                <input
                  type="checkbox"
                  name="free_delivery"
                  checked={formData.free_delivery}
                  onChange={handleInputChange}
                />
                <span className="switch-toggle-slider" />
              </label>
            </div>

            <div className="form-input-group">
              <label htmlFor="prod-delivery-time" className="form-field-label flex items-center gap-1"><Clock size={12}/> Estimated Delivery Time</label>
              <input
                id="prod-delivery-time"
                type="text"
                name="est_delivery_time"
                value={formData.est_delivery_time}
                onChange={handleInputChange}
                placeholder="e.g., 3 Business Days"
                className="form-field-input"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
