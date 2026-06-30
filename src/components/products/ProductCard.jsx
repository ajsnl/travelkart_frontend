import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "react-toastify";
import { toggleWishlist } from "../../features/wishlist/wishlistSlice";
import { addVariantToCart } from "../../features/cart/cartSlice";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { wishlistedProductIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isWishlisted = wishlistedProductIds.includes(product.id);

  // Pick primary variant as first active variant
  const activeVariants = (product.variants || []).filter(v => v.is_active !== false);
  const primaryVariant = activeVariants[0] || (product.variants && product.variants[0]) || null;

  // Selected variant state for this card
  const [selectedCardVariant, setSelectedCardVariant] = React.useState(primaryVariant);

  // Sync state if product/primary variant changes
  React.useEffect(() => {
    setSelectedCardVariant(primaryVariant);
  }, [product, primaryVariant]);

  // Extract unique colors among active variants
  const colorVariants = React.useMemo(() => {
    const list = [];
    const seenColors = new Set();
    activeVariants.forEach(v => {
      const color = v.attributes?.Color || v.attributes?.color;
      if (color) {
        const normalizedColor = String(color).trim().toLowerCase();
        if (!seenColors.has(normalizedColor)) {
          seenColors.add(normalizedColor);
          list.push({
            color: String(color).trim(),
            variant: v
          });
        }
      }
    });
    return list;
  }, [activeVariants]);

  // Color mapping helper for circular pills
  const getColorStyle = (value) => {
    const val = String(value).toLowerCase();
    const map = {
      blue: "#0f2d70",
      charcoal: "#2f3542",
      grey: "#8e9aaf",
      gray: "#8e9aaf",
      silver: "#d3d3d3",
      black: "#111111",
      brown: "#6d4c41",
      tan: "#d7ccc8",
      olive: "#556b2f",
      green: "#2e7d32",
      red: "#c62828",
      white: "#f8f9fa",
      navy: "#1a237e",
      pink: "#ffb6c1"
    };

    if (map[val]) {
      return { backgroundColor: map[val], border: val === "white" ? "1px solid #cbd5e1" : "none" };
    }
    return { backgroundColor: val, border: "1px solid #cbd5e1" }; // Fallback to string literal
  };

  // Helper to extract clean image url
  const getProductImage = (targetVariant) => {
    if (!product) return "";
    
    // 1. Try target variant's primary image
    if (targetVariant && targetVariant.images && targetVariant.images.length > 0) {
      const primaryVarImg = targetVariant.images.find(img => img.is_primary);
      if (primaryVarImg) return primaryVarImg.image_url;
      return targetVariant.images[0].image_url;
    }
    
    // 2. Try general primary image
    const primaryGeneral = (product.images || []).find(img => img.is_primary && !img.variant);
    if (primaryGeneral) return primaryGeneral.image_url;

    // 3. Try general fallback image
    const generalImg = (product.images || []).find(img => !img.variant);
    if (generalImg) return generalImg.image_url;

    // 4. Try any active variant images
    for (const variant of activeVariants) {
      if (variant.images && variant.images.length > 0) {
        return variant.images[0].image_url;
      }
    }
    
    // Default image if nothing found
    return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60";
  };

  // Helper to compute active variant pricing
  const getPricingInfo = (targetVariant) => {
    if (!targetVariant) {
      return { isOutOfStock: true };
    }

    const originalPrice = parseFloat(targetVariant.original_price || targetVariant.price);
    const offerPrice = parseFloat(targetVariant.offer_price);
    const hasOffer = targetVariant.offer_type && targetVariant.offer_type !== "none" && offerPrice > 0 && offerPrice < originalPrice;

    const originalPriceText = `₹${originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const offerPriceText = hasOffer ? `₹${offerPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "";

    return {
      isOutOfStock: targetVariant.stock === 0,
      hasOffer,
      originalPriceText,
      offerPriceText,
    };
  };

  const pricing = getPricingInfo(selectedCardVariant);
  const imageUrl = getProductImage(selectedCardVariant);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your wishlist.");
      return;
    }
    dispatch(toggleWishlist({ productId: product.id, productName: product.name }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_active === false) {
      toast.error("This product is currently inactive and cannot be added to cart.");
      return;
    }
    if (!selectedCardVariant || selectedCardVariant.is_active === false) {
      toast.error("No active variant available for this product.");
      return;
    }
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart.");
      return;
    }
    dispatch(addVariantToCart({
      variantId: selectedCardVariant.id,
      quantity: 1,
      productId: product.id,
      productName: product.name
    }));
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} size={14} className="star-icon filled" fill="currentColor" />);
      } else if (i - 0.5 <= rating) {
        // Half star representation (simplified with secondary styling or a partially filled star)
        stars.push(<Star key={i} size={14} className="star-icon half-filled" fill="currentColor" />);
      } else {
        stars.push(<Star key={i} size={14} className="star-icon" />);
      }
    }
    return stars;
  };

  // Compute offer tag label
  const getOfferTagLabel = () => {
    const activeVariants = (product.variants || []).filter(v => v.is_active !== false);
    const offerTags = activeVariants.map(v => {
      if (!v.offer_type || v.offer_type === "none" || parseFloat(v.offer_value) <= 0) return null;
      if (v.offer_type === "percentage") return { type: "percentage", value: parseFloat(v.offer_value) };
      if (v.offer_type === "flat") return { type: "flat", value: parseFloat(v.offer_value) };
      return null;
    }).filter(Boolean);

    if (offerTags.length === 0) return null;

    // If there are percentage offers:
    const percentages = offerTags.filter(o => o.type === "percentage").map(o => o.value);
    if (percentages.length > 0) {
      const maxPercent = Math.max(...percentages);
      const minPercent = Math.min(...percentages);
      if (minPercent === maxPercent) {
        return `${Math.round(maxPercent)}% OFF`;
      }
      return `UP TO ${Math.round(maxPercent)}% OFF`;
    }

    // If flat offers:
    const flats = offerTags.filter(o => o.type === "flat").map(o => o.value);
    if (flats.length > 0) {
      const maxFlat = Math.max(...flats);
      const minFlat = Math.min(...flats);
      if (minFlat === maxFlat) {
        return `₹${Math.round(maxFlat)} OFF`;
      }
      return `UP TO ₹${Math.round(maxFlat)} OFF`;
    }

    return null;
  };

  const offerTag = getOfferTagLabel();

  return (
    <Link to={`/product/${product.id}`} className="product-card-anchor-wrapper">
      <article className="unified-product-card font-inter">
        {/* Product Image and Badges */}
        <div className="product-card-image-wrapper">
          <div 
            className="product-card-bg-image"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          {/* Badges Overlay */}
          <div className="badges-overlay-container">
            {product.is_best_seller && (
              <span className="badge-tag best-seller-badge">BESTSELLER</span>
            )}
            {offerTag && (
              <span className="badge-tag offer-badge">{offerTag}</span>
            )}
            {product.is_featured && !product.is_best_seller && (
              <span className="badge-tag featured-badge">RECOMMENDED</span>
            )}
          </div>

          {/* Wishlist Overlay Button */}
          <button 
            onClick={handleWishlistToggle}
            className={`wishlist-overlay-button ${isWishlisted ? "active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Product Information details */}
        <div className="product-card-info-content">
          
          {/* Ratings Display */}
          <div className="product-card-rating-container">
            <Star size={11} className="star-icon filled" fill="currentColor" />
            <span className="rating-score-text">
              {parseFloat(product.avg_rating || 0).toFixed(1)}
            </span>
            <span className="rating-count-text">
              ({product.total_ratings_count > 0 ? `${product.total_ratings_count} REVIEWS` : "NO REVIEWS"})
            </span>
          </div>

          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>

          <p className="product-card-description">
            {product.short_description || "Premium travel gear engineered for ultimate durability and utility."}
          </p>

          {/* Color swatches selector */}
          {colorVariants.length > 1 && (
            <div className="product-card-swatches-row" onClick={(e) => e.preventDefault()}>
              {colorVariants.map(({ color, variant }) => {
                const isSelected = selectedCardVariant && 
                  String(selectedCardVariant.attributes?.Color || selectedCardVariant.attributes?.color).toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    className={`product-card-swatch-btn ${isSelected ? "active" : ""}`}
                    style={getColorStyle(color)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCardVariant(variant);
                    }}
                    title={color}
                  />
                );
              })}
            </div>
          )}

          {/* Footer Pricing / Actions */}
          <div className="product-card-footer-pricing">
            <div className="price-tag-stack">
              {pricing.isOutOfStock ? (
                <span className="out-of-stock-label">Out of Stock</span>
              ) : pricing.hasOffer ? (
                <div className="price-row-offer">
                  <span className="original-strike-price">{pricing.originalPriceText}</span>
                  <span className="active-offer-price">{pricing.offerPriceText}</span>
                </div>
              ) : (
                <span className="regular-price">{pricing.originalPriceText}</span>
              )}
            </div>

            <button 
              className="quick-add-cart-btn"
              onClick={handleAddToCart}
              disabled={pricing.isOutOfStock || product.is_active === false || !selectedCardVariant || selectedCardVariant.is_active === false}
              aria-label="Add to cart"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
