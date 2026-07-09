import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  Minus, 
  Plus,
  Loader2,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ProductCard from "../components/products/ProductCard";
import { fetchProductById, fetchProducts } from "../services/productService";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import { addVariantToCart } from "../features/cart/cartSlice";
import {
  fetchReviews,
  checkReviewEligibility,
  submitReview,
  updateReview,
  deleteReview,
  adminFetchReviews,
  adminToggleReviewStatus,
  adminDeleteReview
} from "../services/reviewService";
import "./ProductDetail.css";
import Footer from "../components/Footer";

// Subcomponents
import ProductGallery from "../components/products/ProductGallery";
import ProductAccordion from "../components/products/ProductAccordion";
import ProductReviewCard from "../components/products/ProductReviewCard";
import ReviewFormModal from "../components/products/ReviewFormModal";


export default function ProductDetail() {
  const { id } = useParams();

  // Page States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  // Selections
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibility, setEligibility] = useState({
    can_review: false,
    already_reviewed: false,
    has_purchased: false,
    existing_review: null,
  });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const reviewsSectionRef = useRef(null);

  const handleRatingsClick = () => {
    setShowAllReviews(true);
    // Use a slight timeout to ensure state update renders (if relevant) and scroll smoothly
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormComment, setReviewFormComment] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const dispatch = useDispatch();
  const { wishlistedProductIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isWishlisted = product ? wishlistedProductIds.includes(product.id) : false;

  // Accordion states
  const [openSection, setOpenSection] = useState("description"); // "description" | "specs" | "shipping"

  // Recommendations state
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);

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
          const availStock = defaultVariant.available_stock !== undefined ? defaultVariant.available_stock : defaultVariant.stock;
          setQuantity(blocked ? 0 : (availStock > 0 && defaultVariant.is_active !== false ? 1 : 0));
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

  // Fetch reviews logic
  const loadReviewsData = async () => {
    setReviewsLoading(true);
    try {
      const res = user?.role === "admin" ? await adminFetchReviews(id) : await fetchReviews(id);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadEligibilityData = async () => {
    if (isAuthenticated) {
      try {
        const res = await checkReviewEligibility(id);
        setEligibility(res.data);
        if (res.data.already_reviewed && res.data.existing_review) {
          setReviewFormRating(res.data.existing_review.rating);
          setReviewFormComment(res.data.existing_review.comment);
        }
      } catch (err) {
        console.error("Error checking review eligibility:", err);
      }
    } else {
      setEligibility({
        can_review: false,
        already_reviewed: false,
        has_purchased: false,
        existing_review: null,
      });
    }
  };

  useEffect(() => {
    if (id) {
      loadReviewsData();
      loadEligibilityData();
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (id && isAuthenticated) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("writeReview") === "true") {
        if (eligibility.can_review) {
          setEditingReviewId(null);
          setReviewFormRating(5);
          setReviewFormComment("");
          setShowReviewForm(true);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } else if (eligibility.already_reviewed && eligibility.existing_review) {
          setEditingReviewId(eligibility.existing_review.id);
          setReviewFormRating(eligibility.existing_review.rating);
          setReviewFormComment(eligibility.existing_review.comment);
          setShowReviewForm(true);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [id, isAuthenticated, eligibility.can_review, eligibility.already_reviewed, eligibility.existing_review]);

  const handleOpenAddReview = () => {
    setEditingReviewId(null);
    setReviewFormRating(5);
    setReviewFormComment("");
    setShowReviewForm(true);
  };

  const handleOpenEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewFormRating(review.rating);
    setReviewFormComment(review.comment);
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewFormComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    setReviewSubmitLoading(true);
    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, {
          rating: reviewFormRating,
          comment: reviewFormComment,
        });
        toast.success("Review updated successfully!");
      } else {
        await submitReview({
          product: id,
          rating: reviewFormRating,
          comment: reviewFormComment,
        });
        toast.success("Review submitted successfully!");
      }
      setShowReviewForm(false);
      
      // Reload product details for average ratings
      const prodRes = await fetchProductById(id);
      setProduct(prodRes.data);
      
      await loadReviewsData();
      await loadEligibilityData();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err.response?.data?.product?.[0] || err.response?.data?.comment?.[0] || err.response?.data?.rating?.[0] || err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted successfully!");
      
      // Reload product details
      const prodRes = await fetchProductById(id);
      setProduct(prodRes.data);
      
      await loadReviewsData();
      await loadEligibilityData();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review.");
    }
  };

  const handleAdminToggleStatus = async (reviewId, currentStatus) => {
    try {
      await adminToggleReviewStatus(reviewId, !currentStatus);
      toast.success(`Review ${currentStatus ? "hidden" : "activated"} successfully!`);
      
      // Reload product details
      const prodRes = await fetchProductById(id);
      setProduct(prodRes.data);
      
      await loadReviewsData();
    } catch (err) {
      console.error("Error toggling review status:", err);
      toast.error("Failed to update review status.");
    }
  };

  const handleAdminDelete = async (reviewId) => {
    if (!window.confirm("Admin: Are you sure you want to permanently delete this spam review?")) return;
    try {
      await adminDeleteReview(reviewId);
      toast.success("Review permanently deleted by admin!");
      
      // Reload product details
      const prodRes = await fetchProductById(id);
      setProduct(prodRes.data);
      
      await loadReviewsData();
      await loadEligibilityData();
    } catch (err) {
      console.error("Error deleting review as admin:", err);
      toast.error("Failed to delete review.");
    }
  };

  const renderStars = (rating, size = 14) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={`star-icon ${i <= roundedRating ? "filled" : "empty"}`}
          fill={i <= roundedRating ? "currentColor" : "none"}
          style={{ color: i <= roundedRating ? "#fbbf24" : "#cbd5e1" }}
        />
      );
    }
    return stars;
  };

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
      const availStock = match.available_stock !== undefined ? match.available_stock : match.stock;
      const maxAllowed = Math.min(10, availStock);
      if (!isAvailable || availStock <= 0) {
        setQuantity(0);
      } else if (quantity > maxAllowed) {
        setQuantity(maxAllowed > 0 ? 1 : 0);
      } else if (quantity === 0 && availStock > 0) {
        setQuantity(1);
      }
    }
  };

  // Compile all gallery images
  const getGalleryImages = () => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return [...new Set(selectedVariant.images.map(img => img.image_url))];
    }
    const list = [];
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

    const availStock = selectedVariant.available_stock !== undefined ? selectedVariant.available_stock : selectedVariant.stock;
    return {
      isOutOfStock: availStock === 0,
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
  const availableStock = selectedVariant 
    ? (selectedVariant.available_stock !== undefined ? selectedVariant.available_stock : selectedVariant.stock)
    : 0;

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
    if (!product) return;
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your wishlist.");
      return;
    }
    dispatch(toggleWishlist({ productId: product.id, productName: product.name }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if (isUnavailable || selectedVariant.is_active === false) {
      toast.error("This product/variant is currently unlisted or inactive.");
      return;
    }
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart.");
      return;
    }
    dispatch(addVariantToCart({
      variantId: selectedVariant.id,
      quantity,
      productId: product.id,
      productName: product.name
    }));
  };

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
        <ProductGallery 
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          product={product}
          galleryImages={galleryImages}
          pricing={pricing}
        />

        {/* Right Column: Pricing & Options selector */}
        <section className="detail-config-column">
          {/* Header Details */}
          <div className="detail-header-stack">
            <div 
              className="ratings-summary-row" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              onClick={handleRatingsClick}
            >
              <div className="star-icons-strip" style={{ display: 'flex', gap: '2px' }}>
                {renderStars(product.avg_rating || 0, 14)}
              </div>
              <span className="ratings-text-label" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                {product.avg_rating ? `${parseFloat(product.avg_rating).toFixed(1)} / 5.0` : "0.0"} ({product.total_ratings_count || 0} reviews)
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
                    disabled={quantity >= Math.min(10, availableStock)} 
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

          {selectedVariant && selectedVariant.is_active !== false && availableStock > 0 && availableStock <= 5 && (
            <p className="stock-urgency-warning-text">
              Only {availableStock} left in stock - order soon!
            </p>
          )}

          {selectedVariant && selectedVariant.is_active !== false && availableStock > 10 && quantity >= 10 && (
            <p className="stock-urgency-warning-text font-semibold text-orange-500" style={{ color: "#f97316" }}>
              Maximum limit of 10 items reached for this product.
            </p>
          )}

          {/* Essentials Details Accordion sections */}
          <ProductAccordion 
            product={product}
            openSection={openSection}
            setOpenSection={setOpenSection}
          />
        </section>
      </main>

      {/* Traveler Reviews section */}
      <section className="traveler-reviews-super-container font-inter" ref={reviewsSectionRef}>
        <div className="reviews-section-headline">
          <div className="reviews-section-header-row">
            <div>
              <h2 className="reviews-section-title font-plus-jakarta">Traveler Reviews</h2>
              <p className="reviews-section-sub">Real stories from the road.</p>
            </div>
            
            {/* Review Action / Eligibility Notices */}
            <div className="review-action-trigger-area">
              {isAuthenticated ? (
                eligibility.can_review ? (
                  <button 
                    onClick={handleOpenAddReview}
                    className="write-review-trigger-btn font-inter"
                  >
                    <MessageSquare size={16} />
                    Write a Review
                  </button>
                ) : eligibility.already_reviewed ? (
                  <span className="review-notice-tag success font-inter">
                    <Check size={14} />
                    You have reviewed this product
                  </span>
                ) : !eligibility.has_purchased ? (
                  <span className="review-notice-tag font-inter">
                    <AlertCircle size={14} />
                    Only verified buyers can review
                  </span>
                ) : null
              ) : (
                <Link to="/login" className="review-notice-tag font-inter" style={{ textDecoration: "underline" }}>
                  Log in to write a review
                </Link>
              )}
            </div>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="recs-loading-spinner-row">
            <Loader2 className="spinner-icon animate-spin" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-reviews-state">
            <MessageSquare size={36} className="empty-reviews-icon" />
            <p className="empty-reviews-text font-inter">No reviews yet for this product. Be the first to share your journey!</p>
          </div>
        ) : (
          <>
            <div className="reviews-horizontal-grid-layout">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map(rev => (
                <ProductReviewCard
                  key={rev.id}
                  rev={rev}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  renderStars={renderStars}
                  handleOpenEditReview={handleOpenEditReview}
                  handleReviewDelete={handleReviewDelete}
                  handleAdminToggleStatus={handleAdminToggleStatus}
                  handleAdminDelete={handleAdminDelete}
                />
              ))}
            </div>
            {reviews.length > 3 && (
              <div className="reviews-show-more-row">
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="show-more-reviews-btn font-inter"
                >
                  {showAllReviews ? "Show Less" : `Show All Reviews (${reviews.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Review Submission Form Modal */}
      <ReviewFormModal
        showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm}
        editingReviewId={editingReviewId}
        reviewFormRating={reviewFormRating}
        setReviewFormRating={setReviewFormRating}
        reviewFormComment={reviewFormComment}
        setReviewFormComment={setReviewFormComment}
        reviewSubmitLoading={reviewSubmitLoading}
        handleReviewSubmit={handleReviewSubmit}
      />

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
      <Footer/>
    </div>
  );
}
