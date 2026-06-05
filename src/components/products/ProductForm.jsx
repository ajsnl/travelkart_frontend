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
    images: []
  });

  const [options, setOptions] = useState([
    { name: "Color", values: [] },
    { name: "Capacity", values: [] }
  ]);
  const [newOptionValue, setNewOptionValue] = useState({ 0: "", 1: "" });
  const [errors, setErrors] = useState({});
  const isSlugManuallyEdited = useRef(false);

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
        images: initialData.images || []
      });
      isSlugManuallyEdited.current = true;
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].id }));
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
    
    // Check options values if configuring new product
    if (!initialData) {
      const activeOptions = options.filter(opt => opt.name.trim() !== "" && opt.values.length > 0);
      if (activeOptions.length === 0) {
        newErrors.options = "Please generate at least one option type (e.g. Color) with values.";
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
            {initialData ? "Update Product Basic Details" : "Publish Premium Logistics Product"}
          </h2>
        </div>
        <div className="header-right">
          <button type="button" className="btn-cancel font-inter" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="product-details-form" className="btn-submit font-inter" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Save Changes" : "Create Product & Generate Variants"}
          </button>
        </div>
      </div>

      <form id="product-details-form" onSubmit={handleFormSubmit} className="workspace-editor-grid">
        {/* Left Column */}
        <div className="workspace-main-panel">
          {/* Basic Information card */}
          <div className="form-section-card">
            <h4 className="section-card-title">Basic Information</h4>
            <div className="form-fields-grid-2">
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
                  placeholder="e.g. Nomad Executive Travel Trunk"
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
                  placeholder="e.g. nomad-executive-travel-trunk"
                  className={`form-field-input ${errors.slug ? "input-field-error" : ""}`}
                />
                {errors.slug && <span className="field-error-message"><AlertCircle size={12}/>{errors.slug}</span>}
              </div>
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

          {/* Pricing & Variant Configuration (Only show when creating a new product) */}
          {!initialData && (
            <div className="form-section-card">
              <div className="flex justify-between items-center mb-4">
                <h4 className="section-card-title m-0">Setup Variant Options</h4>
                <button 
                  type="button" 
                  className="btn-secondary-action flex items-center gap-1 font-semibold text-xs py-1 px-3 border border-slate-700 rounded text-slate-300 hover:text-white"
                  onClick={handleAddOptionField}
                >
                  <Plus size={12}/> Add Option Type
                </button>
              </div>

              {options.map((option, optIdx) => (
                <div key={optIdx} className="option-config-row mb-4 p-4 rounded bg-slate-950 border border-slate-900">
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <div className="flex-grow">
                      <input 
                        type="text" 
                        value={option.name} 
                        onChange={(e) => handleOptionNameChange(optIdx, e.target.value)}
                        placeholder="Option Name (e.g. Color, Size, Capacity)"
                        className="form-field-input w-full h-9 bg-slate-900 border-slate-800"
                      />
                    </div>
                    {options.length > 1 && (
                      <button 
                        type="button" 
                        className="text-red-500 hover:text-red-400 p-1"
                        onClick={() => handleRemoveOptionField(optIdx)}
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>

                  {/* Values pills row */}
                  <div className="flex flex-wrap gap-2 items-center mt-3">
                    {option.values.map((val, valIdx) => (
                      <span key={valIdx} className="badge-option-value flex items-center gap-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-white">
                        {val}
                        <button 
                          type="button" 
                          className="text-slate-400 hover:text-white ml-1 font-bold"
                          onClick={() => handleRemoveOptionValue(optIdx, valIdx)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newOptionValue[optIdx] || ""}
                        onChange={(e) => setNewOptionValue(prev => ({ ...prev, [optIdx]: e.target.value }))}
                        placeholder="Add value..."
                        className="form-field-input h-8 w-28 bg-slate-900 border-slate-800 text-xs px-2"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOptionValue(optIdx))}
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddOptionValue(optIdx)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-xs text-white rounded hover:bg-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="field-helper-info mt-2 text-slate-500">
                <Layers size={12} className="inline mr-1"/> Generating variants list will automatically map options together to build products combination entries. You will edit price/stock for each variants individually in the next step.
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="workspace-side-panel">
          {/* Category selection card */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><Settings size={14}/> Category Details</h4>
            
            <div className="form-input-group mt-2">
              <label htmlFor="prod-category" className="form-field-label">Category</label>
              <select
                id="prod-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`form-field-input w-full bg-slate-950 text-slate-300 ${errors.category ? "input-field-error" : ""}`}
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error-message"><AlertCircle size={12}/>{errors.category}</span>}
            </div>

            <div className="form-input-group mt-4">
              <label htmlFor="prod-brand" className="form-field-label">Brand</label>
              <input
                id="prod-brand"
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g. TravelKart Elite"
                className="form-field-input"
              />
            </div>
          </div>

          {/* Visibility & Status Card */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><Globe size={14}/> Visibility & Status</h4>

            {/* Active Toggle */}
            <div className="form-toggle-group-inline flex justify-between items-center py-2 border-b border-slate-900">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Active Status</span>
                <span className="text-[10px] text-slate-500 block">Live in storefront catalog</span>
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
            <div className="form-toggle-group-inline flex justify-between items-center py-3 border-b border-slate-900">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Featured Product</span>
                <span className="text-[10px] text-slate-500 block">Highlight on home landing page</span>
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
            <div className="form-toggle-group-inline flex justify-between items-center py-3 border-b border-slate-900">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Free Shipping</span>
                <span className="text-[10px] text-slate-500 block">Deliver free globally</span>
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

            <div className="form-input-group mt-4">
              <label htmlFor="prod-delivery-time" className="form-field-label flex items-center gap-1"><Clock size={12}/> Est. Delivery Time</label>
              <input
                id="prod-delivery-time"
                type="text"
                name="est_delivery_time"
                value={formData.est_delivery_time}
                onChange={handleInputChange}
                placeholder="e.g. 3 Business Days"
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
