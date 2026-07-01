import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AlertCircle, RotateCcw, ShoppingBag, Lightbulb } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./PaymentError.css";

export default function PaymentError() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  // Fallback if accessed directly without order data
  if (!orderData) {
    return (
      <div className="payment-error-viewport">
        <Navbar />
        <main className="payment-error-main font-inter text-center py-20 px-4">
          <div className="error-icon-circle mx-auto mb-6 bg-red-100 text-red-500 flex items-center justify-center" style={{ width: "64px", height: "64px" }}>
            <AlertCircle size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">No Order Information Found</h1>
          <p className="text-slate-500 mb-8">
            You might have accessed this page directly. Please head back to shop.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link to="/shop" className="go-shop-btn inline-flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>Go To Shop</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const items = orderData.items || [];
  const netSubtotal = parseFloat(orderData.subtotal || 0);
  const discount = parseFloat(orderData.discount || 0);
  const originalSubtotal = netSubtotal + discount;
  const shippingFee = parseFloat(orderData.shipping_fee || 0);
  const taxAmount = netSubtotal * 0.18; // 18% GST (Included)
  const total = parseFloat(orderData.total_price || 0);

  const handleRetry = () => {
    // Navigate back to checkout
    navigate("/checkout");
  };

  return (
    <div className="payment-error-viewport">
      <Navbar />

      <main className="payment-error-main font-inter">
        {/* Header Hero Alert */}
        <header className="payment-error-header text-center">
          <div className="error-icon-circle">
            <AlertCircle size={32} />
          </div>
          <h1 className="payment-error-title">Something went wrong with your payment</h1>
          <p className="payment-error-subtitle">
            Your order could not be processed. Please check your payment details and try again.
          </p>
        </header>

        {/* Two Column Grid */}
        <div className="payment-error-grid">
          
          {/* Left Column: Items list */}
          <section className="payment-error-items-column">
            <div className="items-header-row">
              <h2 className="section-title-text">Review Your Items</h2>
              <span className="items-count-badge">
                {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            <div className="items-list-stack">
              {items.map((item) => {
                const variant = item.variant || {};
                const name = variant.product_name || "Premium Gear";
                const img = variant.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80";
                
                // Format attributes (e.g. Color • Size)
                const attrs = variant.attributes 
                  ? Object.entries(variant.attributes)
                      .map(([k, v]) => `${v}`)
                      .join(" • ")
                  : "";

                const price = parseFloat(item.price || variant.price || 0);

                return (
                  <div key={item.id} className="error-item-card">
                    <div className="item-card-left">
                      <div className="item-image-wrapper">
                        <img src={img} alt={name} className="item-thumbnail" />
                      </div>
                      <div className="item-details-block">
                        <h3 className="item-title-text" title={name}>{name}</h3>
                        {attrs && <p className="item-attributes-text">{attrs}</p>}
                        <span className="item-price-tag">
                          ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="item-card-right">
                      <div className="qty-label">QTY</div>
                      <div className="qty-value">{String(item.quantity).padStart(2, "0")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Totals & Common Fixes */}
          <aside className="payment-error-sidebar-column">
            
            {/* Payment Summary */}
            <div className="summary-card">
              <h2 className="summary-card-title">Payment Summary</h2>
              
              <div className="summary-rows-stack">
                <div className="summary-row">
                  <span className="row-label">Subtotal</span>
                  <span className="row-value">
                    ₹{originalSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span className="row-label">Discount</span>
                    <span className="row-value" style={{ color: "#16a34a" }}>
                      -₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span className="row-label">Shipping</span>
                  <span className="row-value shipping-free">
                    {shippingFee === 0 ? "Free" : `₹${shippingFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span className="row-label">Estimated Tax (18% GST)</span>
                  <span className="row-value">
                    ₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <hr className="summary-divider" />
                
                <div className="summary-row total-row">
                  <span className="total-label">Total</span>
                  <span className="total-value">
                    ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="summary-actions-stack">
                <button onClick={handleRetry} className="back-checkout-btn">
                  <RotateCcw size={18} />
                  <span>Back To Checkout</span>
                </button>
                <Link to="/shop" className="go-shop-btn">
                  <ShoppingBag size={18} />
                  <span>Go To Shop</span>
                </Link>
              </div>
            </div>

            {/* Common Fixes */}
            <div className="fixes-card">
              <h3 className="fixes-card-title">
                <Lightbulb size={18} />
                <span>Common Fixes</span>
              </h3>
              <ul className="fixes-list">
                <li>Verify credit card expiration date</li>
                <li>Check for sufficient funds</li>
                <li>Confirm billing address matches</li>
              </ul>
            </div>

          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
