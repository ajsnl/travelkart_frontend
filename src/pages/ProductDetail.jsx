import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Minus, 
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ProductCard from "../components/products/ProductCard";
import { fetchProductById, fetchProducts } from "../services/productService";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();

  // Page States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  
  // Image zoom state
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });

  // Selections
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Accordion states
  const [openSection, setOpenSection] = useState("description"); // "description" | "specs" | "shipping"

  // Recommendations state
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);

  // Image zoom event handlers
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)"
    });
  };

  // Fetch product details
  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductById(id);
        const data = res.data;
        setProduct(data);
        
        // Check if product or its category is unlisted/blocked
        const blocked = data.is_active === false || data.category_active === false;
        setIsUnavailable(blocked);

        // Find default variant: active variant takes priority, otherwise any available variant
        const allVariants = data.variants || [];
        const activeVariants = allVariants.filter(v => v.is_active !== false);
        const defaultVariant = activeVariants.length > 0 ? activeVariants[0] : allVariants[0];
        
        if (defaultVariant) {
          setSelectedVariant(defaultVariant);
          setSelectedAttributes(defaultVariant.attributes || {});
          
          // Set primary image
          const variantImages = defaultVariant.images || [];
          if (variantImages.length > 0) {
            setActiveImage(variantImages[0].image_url);
          } else {
            const primaryGeneral = (data.images || []).find(img => img.is_primary && !img.variant);
            const fallbackGeneral = (data.images || []).find(img => !img.variant);
            setActiveImage(primaryGeneral?.image_url || fallbackGeneral?.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80");
          }
          setQuantity(blocked ? 0 : (defaultVariant.stock > 0 && defaultVariant.is_active !== false ? 1 : 0));
        } else {
          // No variants
          setSelectedVariant(null);
          setSelectedAttributes({});
          const primaryGeneral = (data.images || []).find(img => img.is_primary && !img.variant);
          const fallbackGeneral = (data.images || []).find(img => !img.variant);
          setActiveImage(primaryGeneral?.image_url || fallbackGeneral?.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80");
          setQuantity(0);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("We couldn't load the product. It may not exist or could be inactive.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductDetails();
      // Scroll to top when loading new product details
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Fetch recommended products
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!product) return;
      setRecsLoading(true);
      try {
        // Fetch products in the same category
        let res = await fetchProducts({ category: product.category, page_size: 10 });
        let recList = (res.data.results || []).filter(p => p.id !== product.id && p.is_active);
        
        // If not enough in the same category, load featured products
        if (recList.length < 3) {
          const featuredRes = await fetchProducts({ is_featured: "true", page_size: 10 });
          const featuredList = (featuredRes.data.results || []).filter(
            p => p.id !== product.id && p.is_active && !recList.some(r => r.id === p.id)
          );
          recList = [...recList, ...featuredList];
        }

        setRecommendedProducts(recList.slice(0, 3));
      } catch (err) {
        console.error("Error loading recommendations:", err);
      } finally {
        setRecsLoading(false);
      }
    };

    if (product) {
      loadRecommendations();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="product-detail-loading-screen">
        <Navbar />
        <div className="loader-container">
          <Loader2 className="spinner-icon animate-spin" size={48} />
          <p>Unfolding travel design architecture...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error-screen">
        <Navbar />
        <div className="error-container font-inter">
          <AlertCircle className="error-icon" size={64} />
          <h2>Merchandise Out of Range</h2>
          <p>{error || "The requested item is not currently active in our catalogue system."}</p>
          <Link to="/shop" className="back-shop-btn">
            Browse Shop Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Compile all variants available
  const activeVariants = product.variants || [];

  // Compile attributes list maps
  const getAttributesMap = () => {
    const map = {};
    activeVariants.forEach(variant => {
      Object.entries(variant.attributes || {}).forEach(([key, value]) => {
        if (!map[key]) {
          map[key] = new Set();
        }
        map[key].add(value);
      });
    });
    
    // Convert sets to arrays
    const formatted = {};
    Object.keys(map).forEach(key => {
      formatted[key] = Array.from(map[key]);
    });
    return formatted;
  };

  const attributesMap = getAttributesMap();

  // Find exact matching variant based on currently selected attributes
  const findMatchingVariant = (newSelections) => {
    return activeVariants.find(v => 
      Object.keys(newSelections).every(
        k => String(v.attributes[k] || "").toLowerCase() === String(newSelections[k] || "").toLowerCase()
      )
    );
  };

  // Switch attribute values cleanly
  const handleSelectAttribute = (key, value) => {
    const newSelections = { ...selectedAttributes, [key]: value };
    
    let match = findMatchingVariant(newSelections);
    
    if (!match) {
      // Find first variant that matches the clicked key-value. Prioritize active ones.
      match = activeVariants.find(v => 
        v.is_active !== false &&
        String(v.attributes[key] || "").toLowerCase() === String(value).toLowerCase()
      ) || activeVariants.find(v => 
        String(v.attributes[key] || "").toLowerCase() === String(value).toLowerCase()
      );
    }
    
    if (match) {
      setSelectedVariant(match);
      setSelectedAttributes({ ...match.attributes });
      
      // Update image gallery to prioritize the new variant's primary image
      const varImages = match.images || [];
      if (varImages.length > 0) {
        setActiveImage(varImages[0].image_url);
      }
      
      // Keep quantity in stock boundaries (Max 10 per product)
      const isAvailable = match.is_active !== false;
      const maxAllowed = Math.min(10, match.stock);
      if (!isAvailable || match.stock <= 0) {
        setQuantity(0);
      } else if (quantity > maxAllowed) {
        setQuantity(maxAllowed > 0 ? 1 : 0);
      } else if (quantity === 0 && match.stock > 0) {
        setQuantity(1);
      }
    }
  };

  // Compile all gallery images
  const getGalleryImages = () => {
    const list = [];
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      list.push(...selectedVariant.images.map(img => img.image_url));
    }
    if (product.images && product.images.length > 0) {
      list.push(...product.images.filter(img => !img.variant).map(img => img.image_url));
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80");
    }
    return [...new Set(list)]; // Deduplicate URLs
  };

  const galleryImages = getGalleryImages();

  // Helpers for pricing
  const getPriceDisplay = () => {
    if (!selectedVariant) {
      return { isOutOfStock: true, isUnavailable: true };
    }
    
    const priceVal = parseFloat(selectedVariant.price);
    const offerVal = parseFloat(selectedVariant.offer_price);
    const hasOffer = selectedVariant.offer_type && selectedVariant.offer_type !== "none" && offerVal < priceVal;

    return {
      isOutOfStock: selectedVariant.stock === 0,
      isUnavailable: selectedVariant.is_active === false,
      hasOffer,
      price: priceVal,
      offerPrice: offerVal,
      discountText: selectedVariant.offer_type === "percentage" 
        ? `${Math.round(selectedVariant.offer_value)}% OFF`
        : `₹${Math.round(selectedVariant.offer_value)} OFF`
    };
  };

  const pricing = getPriceDisplay();

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
      navy: "#1a237e"
    };

    if (map[val]) {
      return { backgroundColor: map[val], border: val === "white" ? "1px solid #cbd5e1" : "none" };
    }
    return { backgroundColor: val, border: "1px solid #cbd5e1" }; // Fallback to string literal
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`${product.name} added to wishlist!`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    toast.success(`${product.name} (${selectedVariant.sku}) added to cart! Quantity: ${quantity}`);
  };

  // Static review models for high aesthetics
  const travelerReviews = [
    {
      id: "rev-1",
      author: "Marcus T.",
      rating: 5,
      title: "Survived 3 continents already!",
      text: "I've taken this bag from London to Tokyo and it still looks brand new. The wheels are incredibly quiet, and the interior organization is a game changer for frequent flyers."
    },
    {
      id: "rev-2",
      author: "Elena R.",
      rating: 5,
      title: "Sleek and efficient.",
      text: "The battery pack saved me during a 4-hour layover. It's a bit heavier than I expected, but the durability makes up for it. Fits perfectly in every overhead bin so far."
    },
    {
      id: "rev-3",
      author: "David S.",
      rating: 5,
      title: "Best investment this year.",
      text: "Finally a suitcase that matches its price point. The details like the leather handles and the smooth zippers feel extremely high-end. Highly recommended for business travel."
    }
  ];

  return (
    <div className="product-detail-page-wrapper">
      <Navbar />

      {/* Breadcrumbs navigation bar */}
      <nav className="detail-breadcrumbs-container font-inter">
        <Link to="/" className="breadcrumb-link">Shop</Link>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <Link to={`/shop?cat=${product.category_name?.toLowerCase()}`} className="breadcrumb-link uppercase">
          {product.category_name || "Gear"}
        </Link>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <span className="breadcrumb-current uppercase">{product.name}</span>
      </nav>

      {/* Blocked / Inactive Product Page-Level Warning Banner */}
      {isUnavailable && (
        <div className="product-unavailable-banner font-inter">
          <AlertCircle size={20} className="warning-icon" />
          <span>This product is currently unlisted or unavailable for purchase.</span>
        </div>
      )}

      {/* Main product columns container */}
      <main className="product-detail-grid-container font-inter">
        
        {/* Left Column: Media Gallery */}
        <section className="detail-gallery-column">
          <div 
            className="gallery-main-view-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={activeImage} 
              alt={product.name} 
              className="gallery-main-img" 
              style={zoomStyle}
            />
            
            {/* Overlay Badges */}
            <div className="gallery-badges-overlay">
              {product.is_best_seller && (
                <span className="detail-badge-pill bestseller">Best Seller</span>
              )}
              {pricing.hasOffer && (
                <span className="detail-badge-pill offer">{pricing.discountText}</span>
              )}
            </div>
          </div>

          {/* Thumbnail grid list */}
          {galleryImages.length > 1 && (
            <div className="gallery-thumbnails-row">
              {galleryImages.map((imgUrl, index) => (
                <button 
                  key={index} 
                  className={`thumb-button ${activeImage === imgUrl ? "active" : ""}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="thumb-img" />
                </button>
              ))}
              {galleryImages.length > 4 && (
                <div className="thumb-more-overlay">
                  <span>+{galleryImages.length - 4} Photos</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Pricing & Options selector */}
        <section className="detail-config-column">
          {/* Header Details */}
          <div className="detail-header-stack">
            <div className="ratings-summary-row">
              <div className="star-icons-strip">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className="star-icon filled" fill="currentColor" />
                ))}
              </div>
              <span className="ratings-text-label">
                ({product.total_ratings_count > 0 ? `${product.total_ratings_count} Reviews` : "128 Reviews"})
              </span>
            </div>

            <h1 className="product-main-title font-plus-jakarta">{product.name}</h1>
            
            {/* Brand Accent */}
            {product.brand && (
              <span className="product-brand-accent">By {product.brand}</span>
            )}
          </div>

          {/* Pricing Row */}
          <div className="detail-pricing-box">
            {pricing.isOutOfStock ? (
              <span className="detail-price-outofstock">Out of Stock</span>
            ) : pricing.hasOffer ? (
              <div className="detail-price-row">
                <span className="price-current-offer">₹{pricing.offerPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span className="price-original-strike">₹{pricing.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span className="limited-promo-pill">LIMITED TIME PREMIUM OFFER</span>
              </div>
            ) : (
              <div className="detail-price-row">
                <span className="price-current-regular">
                  {selectedVariant 
                    ? `₹${pricing.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "No Price Set"
                  }
                </span>
              </div>
            )}
          </div>


          {/* Variant attributes selectors */}
          {activeVariants.length > 0 && (
            <div className="detail-attribute-selectors-container">
              {Object.entries(attributesMap).map(([attrKey, attrValues]) => {
                const isColor = attrKey.toLowerCase() === "color";
                const isCapacity = attrKey.toLowerCase() === "capacity" || attrKey.toLowerCase() === "volume";

                return (
                  <div key={attrKey} className="attribute-selection-block">
                    <span className="attribute-block-label uppercase">
                      Select {attrKey}
                    </span>
                    
                    <div className="attribute-buttons-row">
                      {attrValues.map(val => {
                        const isSelected = String(selectedAttributes[attrKey]).toLowerCase() === String(val).toLowerCase();

                        if (isColor) {
                          return (
                            <button
                              key={val}
                              disabled={isUnavailable}
                              className={`attr-color-bubble-btn ${isSelected ? "selected" : ""}`}
                              style={getColorStyle(val)}
                              onClick={() => handleSelectAttribute(attrKey, val)}
                              title={val}
                            >
                              {isSelected && (
                                <Check size={12} className={val.toLowerCase() === "white" ? "text-slate-900" : "text-white"} />
                              )}
                            </button>
                          );
                        }

                        // Text selector cards (size/capacity)
                        return (
                          <button
                            key={val}
                            disabled={isUnavailable}
                            className={`attr-pill-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => handleSelectAttribute(attrKey, val)}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity and Cart Addition Row */}
          <div className="quantity-cart-actions-row">
            
            {/* Quantity Selector Panel */}
            {!pricing.isOutOfStock && selectedVariant && !isUnavailable && (
              <div className="quantity-adjustment-box">
                <span className="qty-label">Quantity</span>
                <div className="qty-selectors-row">
                  <button 
                    disabled={quantity <= 1} 
                    onClick={() => setQuantity(prev => prev - 1)}
                    className="qty-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button 
                    disabled={quantity >= Math.min(10, selectedVariant.stock)} 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="qty-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions Stack */}
            <div className="cart-wishlist-buttons-strip">
              <button
                disabled={pricing.isOutOfStock || pricing.isUnavailable || isUnavailable || !selectedVariant}
                onClick={handleAddToCart}
                className="add-to-cart-action-btn font-inter"
              >
                <ShoppingBag size={18} />
                <span>{isUnavailable || pricing.isUnavailable ? "Unavailable" : pricing.isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>

              <button 
                onClick={handleWishlistToggle} 
                className={`wishlist-toggle-action-btn ${isWishlisted ? "active" : ""}`}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Availability and Stock Indicator alerts */}
          {selectedVariant && selectedVariant.is_active === false && (
            <p className="stock-urgency-warning-text" style={{ color: "#ef4444" }}>
              This variant combination is currently unavailable in our store.
            </p>
          )}

          {selectedVariant && selectedVariant.is_active !== false && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="stock-urgency-warning-text">
              Only {selectedVariant.stock} left in stock - order soon!
            </p>
          )}

          {selectedVariant && selectedVariant.is_active !== false && selectedVariant.stock > 10 && quantity >= 10 && (
            <p className="stock-urgency-warning-text font-semibold text-orange-500" style={{ color: "#f97316" }}>
              Maximum limit of 10 items reached for this product.
            </p>
          )}

          {/* Essentials Details Accordion sections */}
          <section className="detail-description-accordion-block font-inter">
            {/* Section 1: Description */}
            <div className="accordion-item">
              <button 
                onClick={() => setOpenSection(openSection === "description" ? "" : "description")} 
                className="accordion-header"
              >
                <span>The Essentials Details</span>
                <span>{openSection === "description" ? "—" : "+"}</span>
              </button>
              {openSection === "description" && (
                <div className="accordion-content">
                  <p className="description-text-para">
                    {product.description || product.short_description || "No description loaded for this product."}
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Specifications (Global Attributes) */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="accordion-item">
                <button 
                  onClick={() => setOpenSection(openSection === "specs" ? "" : "specs")} 
                  className="accordion-header"
                >
                  <span>Specifications</span>
                  <span>{openSection === "specs" ? "—" : "+"}</span>
                </button>
                {openSection === "specs" && (
                  <div className="accordion-content">
                    <table className="specs-table-matrix">
                      <tbody>
                        {Object.entries(product.attributes).map(([key, value]) => (
                          <tr key={key}>
                            <td className="spec-key uppercase">{key}</td>
                            <td className="spec-value">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Shipping & Delivery */}
            <div className="accordion-item">
              <button 
                onClick={() => setOpenSection(openSection === "shipping" ? "" : "shipping")} 
                className="accordion-header"
              >
                <span>Shipping & Guarantee</span>
                <span>{openSection === "shipping" ? "—" : "+"}</span>
              </button>
              {openSection === "shipping" && (
                <div className="accordion-content shipping-accordion-details">
                  <div className="shipping-accent-point">
                    <Truck size={16} className="text-orange" />
                    <div>
                      <strong>Estimated Delivery:</strong>
                      <p>{product.est_delivery_time || "3 - 5 Business Days"}</p>
                    </div>
                  </div>

                  <div className="shipping-accent-point">
                    <ShieldCheck size={16} className="text-orange" />
                    <div>
                      <strong>Free & Easy Delivery:</strong>
                      <p>{product.free_delivery ? "Free shipping included on this product." : "Standard shipping costs apply."}</p>
                    </div>
                  </div>

                  <div className="shipping-accent-point">
                    <RotateCcw size={16} className="text-orange" />
                    <div>
                      <strong>Refund Guarantee:</strong>
                      <p>Return eligible within 30 days of receiving shipment order.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>

      {/* Traveler Reviews section */}
      <section className="traveler-reviews-super-container font-inter">
        <div className="reviews-section-headline">
          <h2 className="reviews-section-title font-plus-jakarta">Traveler Reviews</h2>
          <p className="reviews-section-sub">Real stories from the road.</p>
        </div>

        <div className="reviews-horizontal-grid-layout">
          {travelerReviews.map(rev => (
            <article key={rev.id} className="review-card-layout">
              <div className="review-card-header-row">
                <div className="reviewer-avatar">
                  <span>{rev.author[0]}</span>
                </div>
                <div className="reviewer-identity-column">
                  <span className="reviewer-name">{rev.author}</span>
                  <div className="reviewer-stars-rating">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} className="star-icon filled" fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="review-title-heading">"{rev.title}"</h3>
              <p className="review-body-text">{rev.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Recommended Products: Complete Your Journey */}
      <section className="recommended-products-super-container font-inter">
        <div className="recommended-headline-stack">
          <h2 className="recommended-section-title font-plus-jakarta">Complete Your Journey</h2>
        </div>

        {recsLoading ? (
          <div className="recs-loading-spinner-row">
            <Loader2 className="spinner-icon animate-spin" size={32} />
          </div>
        ) : recommendedProducts.length === 0 ? (
          <p className="no-recs-tag">No additional journey gear matches found.</p>
        ) : (
          <div className="recommended-grid-results-layout">
            {recommendedProducts.map(recProduct => (
              <ProductCard key={recProduct.id} product={recProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Corporate footer */}
      <footer className="home-corporate-footer font-inter">
        <div className="footer-top-links-grid">
          <div className="footer-brand-column">
            <span className="footer-brand-logo-text font-plus-jakarta">TravelKart</span>
            <p className="footer-brand-tagline">Engineered luxury utility travel items built for smooth global exploration routing matrices.</p>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Shop</span>
            <Link to="/shop?cat=bags" className="footer-anchor-link">All Backpacks</Link>
            <Link to="/shop?cat=luggage" className="footer-anchor-link">Hardshell Luggage</Link>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Support</span>
            <span className="footer-anchor-link">Help Center</span>
            <span className="footer-anchor-link">Returns Policy</span>
          </div>

          <div className="footer-links-column">
            <span className="footer-column-heading">Company</span>
            <span className="footer-anchor-link">Our Narrative</span>
            <span className="footer-anchor-link">Terms of Service</span>
          </div>
        </div>

        <div className="footer-bottom-copyright-strip">
          <span>© 2026 TravelKart. All Rights Reserved. Created to elevate global paths.</span>
        </div>
      </footer>
    </div>
  );
}
