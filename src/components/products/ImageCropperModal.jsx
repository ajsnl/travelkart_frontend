import React, { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";
import "./ImageCropperModal.css";

const ImageCropperModal = ({
  imageSrc,
  aspectRatio = 1, // width / height
  onCrop,
  onClose,
  title = "Crop Image"
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state on image source change
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [imageSrc]);

  // Handle dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleSaveCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = new Image();
    if (imageSrc && (imageSrc.startsWith("http") || imageSrc.startsWith("//"))) {
      img.crossOrigin = "anonymous"; // Avoid tainted canvas with Cloudinary URLs
    }
    img.src = imageSrc;
    img.onload = () => {
      const container = containerRef.current;
      const cWidth = container.clientWidth;
      const cHeight = container.clientHeight;

      // Define target output size (higher resolution for quality)
      const targetWidth = aspectRatio >= 1 ? 800 : 600;
      const targetHeight = targetWidth / aspectRatio;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      // Compute base dimensions matching object-fit cover
      const containerAspect = cWidth / cHeight;
      const imageAspect = img.naturalWidth / img.naturalHeight;

      let baseWidth, baseHeight;
      if (imageAspect > containerAspect) {
        baseHeight = cHeight;
        baseWidth = cHeight * imageAspect;
      } else {
        baseWidth = cWidth;
        baseHeight = cWidth / imageAspect;
      }

      // Scaling factor from DOM display size to canvas output size
      const scaleFactor = targetWidth / cWidth;

      // Translate context to center, apply offset, zoom and draw
      ctx.translate(
        targetWidth / 2 + offset.x * scaleFactor,
        targetHeight / 2 + offset.y * scaleFactor
      );
      ctx.scale(zoom, zoom);

      ctx.drawImage(
        img,
        -(baseWidth * scaleFactor) / 2 / scaleFactor,
        -(baseHeight * scaleFactor) / 2 / scaleFactor,
        baseWidth,
        baseHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          // Convert blob back to a File object
          const filename = `cropped_image_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });
          onCrop(file);
        }
      }, "image/jpeg", 0.95);
    };
  };

  // Calculate container aspect styles
  const containerStyle = {
    aspectRatio: `${aspectRatio}`,
    width: "100%",
    maxWidth: aspectRatio >= 1 ? "420px" : "320px"
  };

  return (
    <div className="modal-portal-overlay">
      <div className="modal-dialog-frame font-inter" style={{ maxWidth: "480px" }}>
        <div className="modal-dialog-header">
          <div className="modal-header-title-wrapper">
            <h3 className="modal-header-text">{title}</h3>
          </div>
          <button type="button" className="modal-close-trigger" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-crop-body">
          <p className="crop-instructions text-slate-400">
            Drag the image to adjust position and use the slider to zoom.
          </p>

          <div className="crop-workspace-container">
            <div
              ref={containerRef}
              className="crop-mask-container"
              style={containerStyle}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="crop-preview-image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  opacity: imageLoaded ? 1 : 0
                }}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="crop-loading-indicator">
                  <span>Loading source...</span>
                </div>
              )}
            </div>
          </div>

          <div className="crop-controls-wrapper">
            <div className="zoom-slider-row">
              <ZoomOut size={16} className="text-slate-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-slider-range"
              />
              <ZoomIn size={16} className="text-slate-400" />
            </div>
          </div>
        </div>

        <div className="modal-dialog-footer" style={{ padding: "16px 24px", background: "#080D1A" }}>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-submit flex items-center gap-1.5" onClick={handleSaveCrop}>
            <Check size={16} />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
