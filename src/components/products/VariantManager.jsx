import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Pencil, Settings, Globe, Clock, Image as ImageIcon, UploadCloud, Check, Trash2, Plus, AlertCircle, Crop, Search } from "lucide-react";
import VariantCard from "./VariantCard";
import { updateProduct, uploadProductMedia } from "../../services/productService";
import { toast } from "react-toastify";
import ImageCropperModal from "./ImageCropperModal";

const getPriceRange = (product) => {
  const prices = (product.variants || []).map(v => parseFloat(v.price)).filter(p => !isNaN(p));
  if (prices.length === 0) return "N/A";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `₹${min.toLocaleString()}`;
  return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
};

const parseBackendError = (errorData) => {
  if (typeof errorData === "string") return errorData;
  if (Array.isArray(errorData)) {
    return errorData.map(item => parseBackendError(item)).join(" ");
  }
  if (typeof errorData === "object" && errorData !== null) {
    return Object.values(errorData).map(item => parseBackendError(item)).join(" ");
  }
  return "";
};

const VariantManager = ({
  product,
  categories,
  onBack,
  onEditProduct,
  onRefresh
}) => {
  const [generalImages, setGeneralImages] = useState(product.images || []);
  const [variants, setVariants] = useState(product.variants || []);
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [addingVariant, setAddingVariant] = useState(false);
  const [newVariantAttrs, setNewVariantAttrs] = useState({});
  const [newVariantPrice, setNewVariantPrice] = useState("0.00");
  const [newVariantStock, setNewVariantStock] = useState(10);
  const [newVariantSku, setNewVariantSku] = useState("");
  const [newVariantActive, setNewVariantActive] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");

  const filteredVariants = React.useMemo(() => {
    if (!variantSearch.trim()) return variants;
    const query = variantSearch.toLowerCase().trim();
    return variants.filter(v => {
      const skuMatch = v.sku?.toLowerCase().includes(query);
      const attrMatch = Object.values(v.attributes || {}).some(val => 
        val?.toString().toLowerCase().includes(query)
      );
      return skuMatch || attrMatch;
    });
  }, [variants, variantSearch]);
  const generalFileInputRef = useRef(null);

  // Image Cropper States
  const [cropQueue, setCropQueue] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(-1);
  const [croppedFiles, setCroppedFiles] = useState([]);

  // Extract option names from current variants attributes
  const optionNames = React.useMemo(() => {
    const names = new Set();
    variants.forEach(v => {
      Object.keys(v.attributes || {}).forEach(name => names.add(name));
    });
    return Array.from(names);
  }, [variants]);

  useEffect(() => {
    setGeneralImages(product.images || []);
    setVariants(product.variants || []);
  }, [product]);

  const handleGeneralImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const queue = files.map(file => ({
      file,
      src: URL.createObjectURL(file),
      isEdit: false
    }));

    setCropQueue(queue);
    setActiveCropIndex(0);
    e.target.value = ""; 
  };

  const handleEditGeneralImage = (img, idx) => {
    setCropQueue([{
      src: img.image_url,
      isEdit: true,
      index: idx
    }]);
    setActiveCropIndex(0);
  };

  const uploadCroppedGeneralFiles = async (filesList) => {
    setUploadingGeneral(true);
    const uploadedImages = [];

    for (const file of filesList) {
      try {
        const res = await uploadProductMedia(file);
        uploadedImages.push({
          image_url: res.data.image_url,
          is_primary: generalImages.length === 0 && uploadedImages.length === 0
        });
      } catch (err) {
        console.error("General upload error", err);
        toast.error(`Failed to upload cropped file.`);
      }
    }

    const updatedImages = [...generalImages, ...uploadedImages];
    setGeneralImages(updatedImages);
    setUploadingGeneral(false);

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        images: updatedImages
      };
      await updateProduct(product.id, payload);
      toast.success("General media gallery updated!");
      onRefresh();
    } catch (err) {
      console.error("Failed to sync general images", err);
      toast.error("Failed to save updated general media to database.");
    }
  };

  const handleCropComplete = async (croppedFile) => {
    const activeItem = cropQueue[activeCropIndex];

    if (activeItem.isEdit) {
      setUploadingGeneral(true);
      try {
        const res = await uploadProductMedia(croppedFile);
        const updatedImages = [...generalImages];
        updatedImages[activeItem.index] = {
          ...updatedImages[activeItem.index],
          image_url: res.data.image_url
        };

        setGeneralImages(updatedImages);
        setUploadingGeneral(false);
        setActiveCropIndex(-1);
        setCropQueue([]);

        const payload = {
          name: product.name,
          slug: product.slug,
          category: product.category,
          images: updatedImages
        };
        await updateProduct(product.id, payload);
        toast.success("Image updated and saved to database.");
        onRefresh();
      } catch (err) {
        console.error("Failed to save edited image", err);
        toast.error("Failed to save updated image to database.");
        setUploadingGeneral(false);
        setActiveCropIndex(-1);
        setCropQueue([]);
      }
    } else {
      // It is a new upload: collect cropped files
      const newCropped = [...croppedFiles, croppedFile];

      if (activeCropIndex + 1 < cropQueue.length) {
        setCroppedFiles(newCropped);
        setActiveCropIndex(activeCropIndex + 1);
      } else {
        // Finished all cropping! Upload now
        setCroppedFiles([]);
        setActiveCropIndex(-1);
        setCropQueue([]);
        await uploadCroppedGeneralFiles(newCropped);
      }
    }
  };

  const handleRemoveGeneralImage = async (imgIdx) => {
    const updated = [...generalImages];
    const removed = updated.splice(imgIdx, 1)[0];

    if (removed.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    setGeneralImages(updated);

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        images: updated
      };
      await updateProduct(product.id, payload);
      toast.success("Media removed successfully.");
      onRefresh();
    } catch (err) {
      console.error("Failed to sync media removal", err);
      toast.error("Failed to update media registry in backend.");
    }
  };

  const handleSetPrimaryGeneralImage = async (imgIdx) => {
    const updated = generalImages.map((img, idx) => ({
      ...img,
      is_primary: idx === imgIdx
    }));

    setGeneralImages(updated);

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        images: updated
      };
      await updateProduct(product.id, payload);
      toast.success("Primary image updated.");
      onRefresh();
    } catch (err) {
      console.error("Failed to sync primary image update", err);
      toast.error("Failed to save primary media change.");
    }
  };

  // Save/Update a single variant
  const handleSaveVariant = async (updatedVariant) => {
    const updatedVariants = variants.map(v => {
      // Match by ID if exists, otherwise fallback to SKU
      if (v.id && updatedVariant.id) {
        return v.id === updatedVariant.id ? updatedVariant : v;
      }
      return v.sku === updatedVariant.sku ? updatedVariant : v;
    });

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        variants: updatedVariants
      };
      await updateProduct(product.id, payload);
      toast.success(`Variant ${updatedVariant.sku} updated successfully!`);
      onRefresh();
    } catch (err) {
      console.error("Failed to update variant", err);
      if (err.response && err.response.data) {
        const errorMsg = parseBackendError(err.response.data);
        toast.error(errorMsg || "Failed to save variant changes to database.");
      } else {
        toast.error("Failed to save variant changes to database.");
      }
    }
  };

  // Delete a single variant
  const handleDeleteVariant = async (variantId, index) => {
    if (!window.confirm("Are you sure you want to delete this variant combination?")) {
      return;
    }

    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        variants: updatedVariants
      };
      await updateProduct(product.id, payload);
      toast.success("Variant combination deleted!");
      onRefresh();
    } catch (err) {
      console.error("Failed to delete variant", err);
      toast.error("Failed to delete variant from database.");
    }
  };

  // Add a new custom variant combination
  const handleAddCustomVariant = async () => {
    // Validate attributes filled
    const missing = optionNames.filter(name => !newVariantAttrs[name]?.trim());
    if (missing.length > 0) {
      toast.error(`Please select or specify value for options: ${missing.join(", ")}`);
      return;
    }

    if (!newVariantSku.trim()) {
      toast.error("Please enter a valid unique SKU.");
      return;
    }

    // Check duplicate SKU
    if (variants.some(v => v.sku.toLowerCase() === newVariantSku.trim().toLowerCase())) {
      toast.error("Variant SKU already exists in this product registry.");
      return;
    }

    const newVar = {
      sku: newVariantSku.trim(),
      price: parseFloat(newVariantPrice).toFixed(2),
      stock: parseInt(newVariantStock),
      attributes: newVariantAttrs,
      is_active: newVariantActive,
      images: []
    };

    const updatedVariants = [...variants, newVar];

    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        category: product.category,
        variants: updatedVariants
      };
      await updateProduct(product.id, payload);
      toast.success("New variant added successfully!");
      setAddingVariant(false);
      setNewVariantSku("");
      setNewVariantAttrs({});
      setNewVariantActive(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to add variant", err);
      toast.error("Failed to create new variant record in backend.");
    }
  };

  const getSelectedCategoryName = () => {
    const cat = categories.find(c => c.id === product.category);
    return cat ? cat.name : "Uncategorized";
  };

  return (
    <div className="product-workspace-layout">
      {/* Top Header Navigation */}
      <div className="workspace-form-header">
        <div className="header-left">
          <button type="button" className="back-navigation-btn" onClick={onBack}>
            <ChevronLeft size={16} />
            <span>Back to Products</span>
          </button>
          <h2 className="workspace-form-title font-plus-jakarta">
            Manage Variants: {product.name}
          </h2>
        </div>
        <div className="header-right">
          <button type="button" className="btn-cancel font-inter flex items-center gap-1" onClick={onEditProduct}>
            <Pencil size={14} />
            <span>Edit Product details</span>
          </button>
        </div>
      </div>

      <div className="workspace-editor-grid">
        
        {/* Left Column: Product Details & General Media */}
        <div className="workspace-side-panel">
          
          {/* Live Storefront Mockup Preview */}
          <div className="form-section-card live-preview-container">
            <h4 className="section-card-title flex items-center gap-2"><Globe size={14}/> Live Storefront Preview</h4>
            <div className="live-preview-card font-inter">
              <div className="preview-image-frame">
                {generalImages.find(i => i.is_primary)?.image_url || generalImages[0]?.image_url ? (
                  <img 
                    src={generalImages.find(i => i.is_primary)?.image_url || generalImages[0]?.image_url} 
                    alt="preview" 
                    className="preview-img" 
                  />
                ) : (
                  <div className="preview-placeholder">
                    <ImageIcon size={32} className="text-slate-700" />
                    <span className="text-[10px] text-slate-500 mt-2">NO COVER MEDIA</span>
                  </div>
                )}
                <span className="preview-badge-featured">{product.is_featured ? "Featured" : "Standard"}</span>
              </div>

              <div className="preview-card-details">
                <div className="preview-card-meta">
                  <span className="preview-category">{getSelectedCategoryName()}</span>
                  {product.brand && <span className="preview-brand">{product.brand}</span>}
                </div>
                <h3 className="preview-title">{product.name}</h3>
                <div className="preview-price-row">
                  <span className="preview-price">{getPriceRange(product)}</span>
                  {product.free_delivery && <span className="preview-shipping-tag">Free Shipping</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Product General Info Details Summary */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><Settings size={14}/> Product Summary</h4>
            <div className="product-summary-list">
              <div className="summary-item">
                <span className="summary-label">Unique System Slug</span>
                <span className="summary-value code-text">{product.slug}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Short Description</span>
                <span className="summary-value description-text">{product.short_description || "N/A"}</span>
              </div>
              <div className="summary-row-2col">
                <div className="summary-item">
                  <span className="summary-label">Visibility Status</span>
                  <span className={`summary-status-badge ${product.is_active ? "active" : "inactive"}`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Delivery Time</span>
                  <span className="summary-value">{product.est_delivery_time || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Media Gallery Upload */}
          <div className="form-section-card">
            <h4 className="section-card-title flex items-center gap-2"><ImageIcon size={14}/> General Product Media</h4>
            
            <div className="general-media-strip">
              {generalImages.map((img, idx) => (
                <div key={idx} className="general-media-thumb-wrapper">
                  <img src={img.image_url} alt="product asset" className="general-media-thumb-img" />
                  {img.is_primary && (
                    <span className="general-media-primary-badge">
                      Primary
                    </span>
                  )}
                  <div className="general-media-actions-overlay">
                    {!img.is_primary && (
                      <button 
                        type="button" 
                        onClick={() => handleSetPrimaryGeneralImage(idx)} 
                        className="variant-media-action-btn primary-btn"
                        title="Set Primary"
                      >
                        <Check size={12}/>
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => handleEditGeneralImage(img, idx)} 
                      className="variant-media-action-btn edit-btn"
                      title="Crop/Edit Image"
                      style={{ color: "var(--figma-gold-elite)" }}
                    >
                      <Crop size={12}/>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveGeneralImage(idx)} 
                      className="variant-media-action-btn delete-btn"
                      title="Remove"
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              ))}
              
              <div 
                className="general-media-add-slot"
                onClick={() => generalFileInputRef.current?.click()}
              >
                <UploadCloud size={18} className={uploadingGeneral ? "animate-pulse" : ""} />
                <span className="general-media-add-label">{uploadingGeneral ? "SAVING..." : "ADD MEDIA"}</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={generalFileInputRef} 
              onChange={handleGeneralImageUpload} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
          </div>

        </div>

        {/* Right Column: Variants Management List */}
        <div className="workspace-main-panel">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 className="section-card-title flex items-center gap-2 m-0" style={{ border: "none", padding: 0 }}>
              Variant Registry List ({variants.length})
            </h4>
            
            <button 
              type="button" 
              className="primary-action-btn font-inter py-1.5 px-3 text-xs"
              onClick={() => setAddingVariant(prev => !prev)}
            >
              <Plus size={14} />
              <span>Add Custom Variant</span>
            </button>
          </div>

          {/* Variant search bar */}
          <div style={{ position: 'relative', marginTop: '12px', marginBottom: '4px' }}>
            <input
              type="text"
              placeholder="Search variants by SKU or attribute values (e.g. Black, XL)..."
              value={variantSearch}
              onChange={(e) => setVariantSearch(e.target.value)}
              className="form-field-input"
              style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          </div>

          {/* New Variant Custom Form */}
          {addingVariant && (
            <div className="form-section-card" style={{ borderColor: "var(--figma-standard-blue)" }}>
              <h5 className="section-card-title" style={{ fontSize: "12px" }}>Configure Custom Variant Combination</h5>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Dynamically parsed option inputs */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, optionNames.length)}, 1fr)`, gap: "16px" }}>
                  {optionNames.map(name => (
                    <div key={name} className="form-input-group">
                      <label className="form-field-label">{name} Value</label>
                      <input 
                        type="text"
                        placeholder={`e.g. Red, XL...`}
                        value={newVariantAttrs[name] || ""}
                        onChange={(e) => setNewVariantAttrs(prev => ({ ...prev, [name]: e.target.value }))}
                        className="form-field-input"
                      />
                    </div>
                  ))}
                </div>

                <div className="variant-fields-row">
                  <div className="form-input-group">
                    <label className="form-field-label">Variant SKU Code</label>
                    <input 
                      type="text" 
                      value={newVariantSku} 
                      placeholder="e.g. Unique sku..."
                      onChange={(e) => setNewVariantSku(e.target.value)} 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-input-group">
                    <label className="form-field-label">Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newVariantPrice} 
                      onChange={(e) => setNewVariantPrice(e.target.value)} 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-input-group">
                    <label className="form-field-label">Stock Units</label>
                    <input 
                      type="number" 
                      value={newVariantStock} 
                      onChange={(e) => setNewVariantStock(e.target.value)} 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-input-group">
                    <label className="form-field-label">Active Status</label>
                    <div className="variant-toggle-container">
                      <label className="switch-toggle-node" style={{ margin: 0, display: 'inline-block' }}>
                        <input
                          type="checkbox"
                          checked={newVariantActive}
                          onChange={(e) => {
                            if (e.target.checked) {
                              toast.warning("A new variant cannot be activated until it has at least 3 images uploaded.");
                              return;
                            }
                            setNewVariantActive(e.target.checked);
                          }}
                        />
                        <span className="switch-toggle-slider" />
                      </label>
                      <span className={`variant-toggle-label-text ${newVariantActive ? 'active' : 'inactive'}`}>
                        {newVariantActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #1E293B", paddingTop: "12px" }}>
                  <button type="button" className="btn-cancel font-inter h-9 px-4 text-xs" onClick={() => setAddingVariant(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-submit font-inter h-9 px-4 text-xs" onClick={handleAddCustomVariant}>
                    Create Variant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of Individual Variant Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {variants.length === 0 ? (
              <div className="form-section-card text-center py-8 text-slate-500">
                <AlertCircle className="mx-auto mb-2 text-slate-600" size={24} />
                No variant combinations configured for this product. Click "Add Custom Variant" to setup.
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className="form-section-card text-center py-8 text-slate-500">
                <AlertCircle className="mx-auto mb-2 text-slate-600" size={24} />
                No matching variant combinations found for "{variantSearch}".
              </div>
            ) : (
              filteredVariants.map((v) => {
                const originalIndex = variants.findIndex(orig => orig.id ? orig.id === v.id : orig.sku === v.sku);
                return (
                  <VariantCard 
                    key={v.id || v.sku || originalIndex} 
                    variant={v}
                    index={originalIndex}
                    onSave={handleSaveVariant}
                    onDelete={handleDeleteVariant}
                  />
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Image Cropper Modal Overlay */}
      {activeCropIndex >= 0 && cropQueue[activeCropIndex] && (
        <ImageCropperModal
          imageSrc={cropQueue[activeCropIndex].src}
          aspectRatio={4 / 3} // Products look best in 4:3 aspect ratio
          onCrop={handleCropComplete}
          onClose={() => {
            setActiveCropIndex(-1);
            setCropQueue([]);
            setCroppedFiles([]);
          }}
          title={cropQueue[activeCropIndex].isEdit ? "Recrop Product Image" : `Crop Product Image (${activeCropIndex + 1}/${cropQueue.length})`}
        />
      )}
    </div>
  );
};

export default VariantManager;
