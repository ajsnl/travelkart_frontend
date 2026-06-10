import React, { useState, useRef, useEffect } from "react";
import { Trash2, Save, UploadCloud, Check, Image as ImageIcon, Crop } from "lucide-react";
import { uploadProductMedia } from "../../services/productService";
import { toast } from "react-toastify";
import ImageCropperModal from "./ImageCropperModal";

const VariantCard = ({
  variant,
  index,
  onSave,
  onDelete
}) => {
  const [sku, setSku] = useState(variant.sku || "");
  const [price, setPrice] = useState(variant.price || "0.00");
  const [stock, setStock] = useState(variant.stock !== undefined ? variant.stock : 10);
  const [images, setImages] = useState(variant.images || []);
  const [isActive, setIsActive] = useState(variant.is_active !== undefined ? variant.is_active : false);
  const [offerType, setOfferType] = useState(variant.offer_type || "none");
  const [offerValue, setOfferValue] = useState(variant.offer_value || "0.00");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSku(variant.sku || "");
    setPrice(variant.price || "0.00");
    setStock(variant.stock !== undefined ? variant.stock : 10);
    setImages(variant.images || []);
    setIsActive(variant.is_active !== undefined ? variant.is_active : false);
    setOfferType(variant.offer_type || "none");
    setOfferValue(variant.offer_value || "0.00");
  }, [variant]);

  // Image Cropper States
  const [cropQueue, setCropQueue] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(-1);
  const [croppedFilesState, setCroppedFilesState] = useState([]);

  const handleFileChange = (e) => {
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

  const handleEditVariantImage = (img, idx) => {
    setCropQueue([{
      src: img.image_url,
      isEdit: true,
      index: idx
    }]);
    setActiveCropIndex(0);
  };

  const uploadCroppedVariantFiles = async (filesList) => {
    setUploading(true);
    const uploadedImages = [];

    for (const file of filesList) {
      try {
        const res = await uploadProductMedia(file);
        uploadedImages.push({
          image_url: res.data.image_url,
          is_primary: images.length === 0 && uploadedImages.length === 0
        });
      } catch (err) {
        console.error("Variant image upload failed", err);
        toast.error(`Failed to upload cropped file.`);
      }
    }

    setImages(prev => [...prev, ...uploadedImages]);
    setUploading(false);
  };

  const handleCropComplete = async (croppedFile) => {
    const activeItem = cropQueue[activeCropIndex];

    if (activeItem.isEdit) {
      // It is an edit: upload and replace in local images array
      setUploading(true);
      try {
        const res = await uploadProductMedia(croppedFile);
        const updated = [...images];
        updated[activeItem.index] = {
          ...updated[activeItem.index],
          image_url: res.data.image_url
        };
        setImages(updated);
        setUploading(false);
        setActiveCropIndex(-1);
        setCropQueue([]);
        toast.success("Variant image updated.");
      } catch (err) {
        console.error("Variant image upload failed", err);
        toast.error("Failed to upload cropped image.");
        setUploading(false);
        setActiveCropIndex(-1);
        setCropQueue([]);
      }
    } else {
      // It is a new upload: collect cropped files
      const newCropped = [...croppedFilesState, croppedFile];

      if (activeCropIndex + 1 < cropQueue.length) {
        setCroppedFilesState(newCropped);
        setActiveCropIndex(activeCropIndex + 1);
      } else {
        // Finished all cropping! Upload now
        setCroppedFilesState([]);
        setActiveCropIndex(-1);
        setCropQueue([]);
        await uploadCroppedVariantFiles(newCropped);
      }
    }
  };

  const handleRemoveImage = (imgIdx) => {
    const updated = [...images];
    const removed = updated.splice(imgIdx, 1)[0];

    // Reassign primary if we deleted the primary image
    if (removed.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    setImages(updated);
    if (updated.length < 3 && isActive) {
      setIsActive(false);
      toast.info("Variant status set to inactive because it has less than 3 images.");
    }
  };

  const handleSetPrimaryImage = (imgIdx) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === imgIdx
    }));
    setImages(updated);
  };

  const handleLocalSave = () => {
    if (!sku.trim()) {
      toast.error("SKU is required.");
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      toast.error("Price must be a valid positive number.");
      return;
    }
    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      toast.error("Stock must be a non-negative integer.");
      return;
    }

    onSave({
      ...variant,
      sku: sku.trim(),
      price: parseFloat(price).toFixed(2),
      stock: parseInt(stock),
      is_active: isActive,
      images,
      offer_type: offerType,
      offer_value: parseFloat(offerValue) || 0.00
    });
  };

  return (
    <div className="variant-editor-card font-inter">
      {/* Card Header: Title details */}
      <div className="variant-card-header">
        <div className="variant-card-title-stack">
          <span className="variant-attr-title">
            {Object.values(variant.attributes).join(" / ")}
          </span>
          <span className="variant-attr-subtitle">
            {Object.entries(variant.attributes).map(([k, val]) => `${k}: ${val}`).join(", ")}
          </span>
        </div>
        
        <div className="variant-card-actions">
          <button 
            type="button" 
            onClick={handleLocalSave} 
            className="variant-action-btn-save"
            title="Save changes for this variant"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(variant.id, index)} 
            className="variant-action-btn-delete"
            title="Delete this variant"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Card Body: Form Fields & Media */}
      <div className="variant-card-body">
        
        {/* Fields row */}
        <div className="variant-fields-row">
          <div className="form-input-group">
            <label className="form-field-label">SKU Code</label>
            <input 
              type="text" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              className="form-field-input"
              placeholder="e.g. SKU-COLOR-SIZE"
            />
          </div>

          <div className="form-input-group">
            <label className="form-field-label">Price (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="form-field-input"
              placeholder="0.00"
            />
          </div>

          <div className="form-input-group">
            <label className="form-field-label">Stock Units</label>
            <input 
              type="number" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="form-field-input"
              placeholder="10"
            />
          </div>

          <div className="form-input-group">
            <label className="form-field-label">Active Status</label>
            <div className="variant-toggle-container">
              <label className="switch-toggle-node" style={{ margin: 0, display: 'inline-block' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    if (e.target.checked && images.length < 3) {
                      toast.warning("A variant must have at least 3 images to be active.");
                      return;
                    }
                    setIsActive(e.target.checked);
                  }}
                />
                <span className="switch-toggle-slider" />
              </label>
              <span className={`variant-toggle-label-text ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Variant Level Offer Settings */}
        <div className="variant-fields-row" style={{ marginTop: '16px' }}>
          <div className="form-input-group">
            <label className="form-field-label">Offer Type</label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="form-field-input w-full bg-slate-950 text-slate-300"
              style={{ height: '38px', padding: '0 12px' }}
            >
              <option value="none">No Offer</option>
              <option value="percentage">Percentage Discount (%)</option>
              <option value="flat">Flat Discount (Money)</option>
            </select>
          </div>

          {offerType !== "none" && (
            <div className="form-input-group">
              <label className="form-field-label">
                {offerType === "percentage" ? "Discount Percentage (%)" : "Discount Flat Value (₹)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={offerValue}
                onChange={(e) => setOfferValue(e.target.value)}
                className="form-field-input"
                placeholder={offerType === "percentage" ? "e.g. 15" : "e.g. 500"}
              />
            </div>
          )}
        </div>

        {/* Media row */}
        <div className="variant-media-section mt-4">
          <label className="form-field-label block mb-2">Variant Images</label>
          
          <div className="variant-images-grid">
            {images.map((img, imgIdx) => (
              <div key={imgIdx} className="variant-media-item-wrapper">
                <img src={img.image_url} alt="variant thumbnail" className="variant-media-img" />
                
                {img.is_primary && (
                  <span className="variant-media-primary-badge">
                    Primary
                  </span>
                )}

                <div className="variant-media-actions-overlay">
                  {!img.is_primary && (
                    <button 
                      type="button" 
                      onClick={() => handleSetPrimaryImage(imgIdx)} 
                      className="variant-media-action-btn primary-btn"
                      title="Set Primary"
                    >
                      <Check size={12}/>
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => handleEditVariantImage(img, imgIdx)} 
                    className="variant-media-action-btn edit-btn"
                    title="Crop/Edit Image"
                    style={{ color: "var(--figma-gold-elite)" }}
                  >
                    <Crop size={12}/>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(imgIdx)} 
                    className="variant-media-action-btn delete-btn"
                    title="Remove"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Media trigger slot inside the grid */}
            <div 
              className="variant-media-add-slot"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={16} className={uploading ? "animate-pulse" : ""} />
              <span className="variant-media-add-label">{uploading ? "UPLOADING..." : "ADD IMAGE"}</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

      </div>

      {/* Image Cropper Modal Overlay */}
      {activeCropIndex >= 0 && cropQueue[activeCropIndex] && (
        <ImageCropperModal
          imageSrc={cropQueue[activeCropIndex].src}
          aspectRatio={1} // Variant cards look best in 1:1 aspect ratio
          onCrop={handleCropComplete}
          onClose={() => {
            setActiveCropIndex(-1);
            setCropQueue([]);
            setCroppedFilesState([]);
          }}
          title={cropQueue[activeCropIndex].isEdit ? "Recrop Variant Image" : `Crop Variant Image (${activeCropIndex + 1}/${cropQueue.length})`}
        />
      )}
    </div>
  );
};

export default VariantCard;
