import React, { useState } from "react";

export default function ProductGallery({ 
  activeImage, 
  setActiveImage, 
  product, 
  galleryImages, 
  pricing 
}) {
  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: "center center",
    transform: "scale(1)"
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)"
    });
  };

  return (
    <section className="detail-gallery-column">

      {/* Main Image */}
      <div 
        className="gallery-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={activeImage} 
          alt={product.name} 
          className="gallery-main-img"
          style={zoomStyle}
        />

        {/* Badges */}
        <div className="gallery-badges-overlay">
          {product.is_best_seller && (
            <span className="detail-badge-pill bestseller">Best Seller</span>
          )}
          {pricing.hasOffer && (
            <span className="detail-badge-pill offer">
              {pricing.discountText}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="gallery-thumbnails-row">
          {galleryImages.slice(0, 4).map((imgUrl, index) => {
            const isLast = index === 3 && galleryImages.length > 4;

            return (
              <button
                key={index}
                className={`thumb-button ${activeImage === imgUrl ? "active" : ""}`}
                onClick={() => setActiveImage(imgUrl)}
              >
                <img src={imgUrl} alt="" className="thumb-img" />

                {isLast && (
                  <div className="thumb-more-overlay">
                    +{galleryImages.length - 4}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}