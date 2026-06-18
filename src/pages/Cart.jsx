import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  AlertCircle, 
  Info, 
  Loader2, 
  ArrowRight, 
  Lock 
} from "lucide-react";
import Navbar from "../components/Navbar";
import { 
  getCart, 
  updateItemQuantity, 
  removeVariantFromCart, 
  clearUserCart 
} from "../features/cart/cartSlice";
import "./Cart.css";
import Footer from "../components/Footer";
import { useCustomDialog } from "../components/CustomDialog";

export default function Cart() {
  const dispatch = useDispatch();
  const { cart, loading, updatingItems, error } = useSelector((state) => state.cart);
  const { showConfirm } = useCustomDialog();
  
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleUpdateQuantity = (item, newQty) => {
    const variantId = item.variant?.id;
    const maxLimit = 10;

    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }

    if (newQty > maxLimit) {
      return;
    }

    dispatch(updateItemQuantity({
      variantId,
      quantity: newQty,
      productName: item.variant?.product_name
    }));
  };

  const handleRemoveItem = (item) => {
    dispatch(removeVariantFromCart({
      variantId: item.variant?.id,
      productName: item.variant?.product_name
    }));
  };

  const handleClearCart = async () => {
    const confirmed = await showConfirm("Are you sure you want to clear your cart?", "Clear Cart", "warning");
    if (confirmed) {
      dispatch(clearUserCart());
    }
  };

  // Helper to check if an item is invalid (inactive product, category, variant, or out of stock)
  const isItemInvalid = (item) => {
    const v = item.variant;
    if (!v) return true;
    const avail = v.available_stock !== undefined ? v.available_stock : v.stock;
    return !v.is_active || !v.is_product_active || !v.is_category_active || avail === 0;
  };

  const isItemQuantityExceeded = (item) => {
    const v = item.variant;
    if (!v) return false;
    const avail = v.available_stock !== undefined ? v.available_stock : v.stock;
    return item.quantity > avail;
  };

  if (loading && !cart) {
    return (
      <div className="cart-page-viewport">
        <Navbar />
        <div className="cart-loading-state">
          <Loader2 className="cart-spinner animate-spin" size={40} />
          <p>Analyzing travel gear quantities...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalItems = cart?.total_items || 0;
  const totalPrice = cart?.total_price || 0;
  const discountTotal = cart?.discount_total || 0;
  const isCheckoutRestricted = cart?.is_checkout_restricted || false;

  return (
    <div className="cart-page-viewport">
      <Navbar />

      <main className="cart-main-content">
        {/* Header Hero Section */}
        <header className="cart-header font-inter">
          <div className="cart-header-left">
            <h1 className="cart-title font-plus-jakarta">My Cart</h1>
            <p className="cart-subtitle">
              Configure your cargo space. Add premium essentials for optimized travel logistics.
            </p>
          </div>
          {items.length > 0 && (
            <div className="cart-header-right">
              <button onClick={handleClearCart} className="cart-clear-btn">
                Clear Cart
              </button>
            </div>
          )}
        </header>

        {/* Notice Info Bar */}
        <div className="cart-notice-bar font-inter">
          <Info size={16} className="cart-notice-icon" />
          <span className="cart-notice-text">
            Saved products are automatically moved to your cargo cart. Check item quantities before checking out.
          </span>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="cart-empty-state font-inter">
            <div className="cart-empty-icon-wrapper">
              <ShoppingBag size={48} className="cart-empty-icon" />
            </div>
            <h3>Your Cart is Empty</h3>
            <p>
              Explore our gear catalogue to select premium design essentials for your journey.
            </p>
            <Link to="/shop" className="cart-empty-cta-btn">
              Browse Gear Catalog
            </Link>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="cart-grid-layout font-inter">
            {/* Left Side: Items list */}
            <div className="cart-items-column">
              {items.map((item) => {
                const isInvalid = isItemInvalid(item);
                const isQtyExceeded = isItemQuantityExceeded(item);
                const isUpdating = updatingItems[item.variant?.id];
                const variant = item.variant;

                return (
                  <div key={item.id} className={`cart-item-card ${isInvalid ? "invalid" : ""}`}>
                    {/* Item Details Layout */}
                    <div className="cart-item-body">
                      {/* Product Thumbnail */}
                      <Link to={`/product/${variant?.product_id}`} className="cart-item-img-wrapper">
                        <img 
                          src={variant?.image_url} 
                          alt={variant?.product_name || "Variant"} 
                          className="cart-item-img"
                        />
                        {isInvalid && (
                          <div className="cart-item-invalid-overlay">
                            <span>UNAVAILABLE</span>
                          </div>
                        )}
                      </Link>

                      {/* Product Metadata */}
                      <div className="cart-item-details-wrapper">
                        <div className="cart-item-header">
                          <Link to={`/product/${variant?.product_id}`} className="cart-item-title font-plus-jakarta">
                            {variant?.product_name}
                          </Link>
                          {variant?.product_brand && (
                            <span className="cart-item-brand">by {variant.product_brand}</span>
                          )}
                        </div>

                        {/* SKU and variant attributes */}
                        <div className="cart-item-attributes">
                          <span className="attr-sku">SKU: {variant?.sku}</span>
                          {variant?.attributes && Object.entries(variant.attributes).map(([key, val]) => (
                            <span key={key} className="attr-badge">
                              {key}: {val}
                            </span>
                          ))}
                        </div>

                        {/* Status Messages */}
                        {isInvalid ? (
                          <div className="item-alert-banner error font-semibold">
                            <AlertCircle size={14} />
                            <span>
                              {(variant?.available_stock !== undefined ? variant.available_stock : variant?.stock) === 0 
                                ? "Out of stock" 
                                : "Unlisted, inactive or category unavailable"}
                            </span>
                          </div>
                        ) : isQtyExceeded ? (
                          <div className="item-alert-banner warning">
                            <AlertCircle size={14} />
                            <span>Requested quantity exceeds available stock ({variant?.available_stock !== undefined ? variant.available_stock : variant?.stock} units left).</span>
                          </div>
                        ) : (variant?.available_stock !== undefined ? variant.available_stock : variant?.stock) <= 5 ? (
                          <div className="item-alert-banner info">
                            <Info size={14} />
                            <span>Low stock: only {variant?.available_stock !== undefined ? variant.available_stock : variant?.stock} left.</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Quantity Controls & Pricing Stack */}
                      <div className="cart-item-controls-price-stack">
                        {/* Unit Pricing */}
                        <div className="cart-item-price-info">
                          {variant?.offer_price ? (
                            <>
                              <span className="price-offer">₹{parseFloat(variant.offer_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              <span className="price-original">₹{parseFloat(variant.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </>
                          ) : (
                            <span className="price-regular">
                              ₹{parseFloat(variant?.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="cart-qty-selectors">
                          <button 
                            disabled={isUpdating || item.quantity <= 1} 
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className="qty-adjust-btn"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          
                          <span className="qty-val">
                            {isUpdating ? (
                              <Loader2 className="qty-spinner animate-spin" size={12} />
                            ) : (
                              item.quantity
                            )}
                          </span>

                          <button 
                            disabled={
                              isUpdating || 
                              isInvalid || 
                              item.quantity >= 10
                            } 
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className="qty-adjust-btn"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Subtotal of line */}
                        <div className="cart-item-subtotal">
                          <span>₹{parseFloat(item.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>

                        {/* Trash Button */}
                        <button 
                          disabled={isUpdating}
                          onClick={() => handleRemoveItem(item)}
                          className="cart-item-delete-btn"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side: Order summary & checkout constraints */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h2 className="summary-title font-plus-jakarta">Order Summary</h2>

                <div className="summary-details font-inter">
                  <div className="summary-row">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{(totalPrice + discountTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="summary-row discount">
                      <span>Gear Discount</span>
                      <span>-₹{discountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className="shipping-free">FREE</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-row total">
                    <span>Estimated Total</span>
                    <span>₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Checkout Restrictions Warning Alerts */}
                {isCheckoutRestricted && (
                  <div className="checkout-restriction-box font-inter">
                    <AlertCircle className="restriction-icon" size={16} />
                    <div>
                      <strong className="block text-sm">Checkout Restricted</strong>
                      <span className="text-xs">
                        Remove out-of-stock, inactive, unlisted or stock-exceeded items before proceeding.
                      </span>
                    </div>
                  </div>
                )}

                {/* Proceed Button */}
                <button 
                  disabled={isCheckoutRestricted || items.length === 0}
                  className="cart-checkout-btn font-inter"
                >
                  <Lock size={16} />
                  <span>Secure Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <p className="checkout-badge-guarantee font-inter">
                  Secure SSL Encryption. All transactions processed securely.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* footer */}
        <Footer/>
    </div>
  );
}
