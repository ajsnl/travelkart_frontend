import React from "react";
import { CheckCircle2, Truck } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-toastify";

export default function CheckoutSuccessView({
  placedOrderDetails,
  userEmail,
  navigate
}) {
  return (
    <div className="checkout-success-viewport">
      <Navbar />
      <main className="checkout-success-content font-inter">
        
        {/* Confirmed Icon & Title Header */}
        <div className="conf-header">
          <div className="conf-icon-wrapper">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="conf-title">Order Confirmed</h1>
          <p className="conf-subtitle">
            Thank you for your purchase.
          </p>
        </div>

        {/* Two Columns Grid */}
        <div className="conf-main-grid">
          
          {/* Left Column: Order details & items summary */}
          <div className="conf-left-column">
            <div className="conf-card">
              <div className="conf-order-meta-row">
                <div className="conf-meta-block">
                  <span className="conf-meta-label">Order Number</span>
                  <span className="conf-meta-value">{placedOrderDetails.trackingId}</span>
                </div>
                <div className="conf-meta-block" style={{ textAlign: "right" }}>
                  <span className="conf-meta-label">Estimated Delivery</span>
                  <span className="conf-meta-value">{placedOrderDetails.deliveryEstimate}</span>
                </div>
              </div>

              <h3 className="conf-section-heading">ORDER SUMMARY</h3>
              
              <div className="conf-items-list">
                {placedOrderDetails.items.map((item) => {
                  const variant = item.variant;
                  const price = variant?.offer_price ? parseFloat(variant.offer_price) : parseFloat(variant?.price || 0);
                  const itemTotal = price * item.quantity;
                  return (
                    <div key={item.id} className="conf-item-row">
                      <img 
                        src={variant?.image_url} 
                        alt={variant?.product_name || "Variant"} 
                        className="conf-item-img" 
                      />
                      <div className="conf-item-details">
                        <div className="conf-item-name">{variant?.product_name}</div>
                        <div className="conf-item-attributes">
                          {variant?.product_brand && <span>by {variant.product_brand} • </span>}
                          {variant?.attributes && Object.entries(variant.attributes).map(([k, v]) => (
                            <span key={k}>{k}: {v} • </span>
                          ))}
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="conf-item-price" style={{ color: "#00236F", fontWeight: "700" }}>
                          ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Shipping Info & Grand Totals */}
          <div className="conf-right-column">
            
            {/* Shipping Address Box */}
            <div className="conf-info-card">
              <h3 className="conf-info-card-title">
                <Truck size={15} style={{ color: "#00236F" }} />
                <span>SHIPPING ADDRESS</span>
              </h3>
              <p className="conf-info-card-text">
                <strong style={{ display: "block", marginBottom: "4px" }}>{placedOrderDetails.address.full_name}</strong>
                {placedOrderDetails.address.address_line}<br />
                {placedOrderDetails.address.city}, {placedOrderDetails.address.state} - {placedOrderDetails.address.pincode}<br />
                {placedOrderDetails.address.country}
              </p>
            </div>

            {/* Order Total Box */}
            <div className="conf-total-card">
              <span className="conf-total-card-label">ORDER TOTAL</span>
              <div className="conf-total-rows">
                <div className="conf-total-row">
                  <span>Subtotal</span>
                  <span>₹{(placedOrderDetails.subtotal + placedOrderDetails.discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                
                {placedOrderDetails.discount > 0 && (
                  <div className="conf-total-row text-discount">
                    <span>Shipping Discount</span>
                    <span>-₹{placedOrderDetails.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="conf-total-row">
                  <span>Shipping</span>
                  <span>{placedOrderDetails.shipping === 0 ? "Free" : `₹${placedOrderDetails.shipping.toFixed(2)}`}</span>
                </div>

                <div className="conf-total-row">
                  <span>Estimated Tax</span>
                  <span>₹{(placedOrderDetails.subtotal * 0.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <hr className="conf-total-divider" />

              <div className="conf-total-row grand-total-row">
                <span>Grand Total</span>
                <span className="conf-grand-total">
                  ₹{placedOrderDetails.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Action Buttons */}
        <div className="conf-actions-stack">
          <button 
            className="conf-btn-primary" 
            onClick={() => navigate(`/order-tracking/${placedOrderDetails.trackingId}`)}
          >
            Track Order
          </button>
          <button 
            className="conf-btn-secondary" 
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </button>
        </div>

        {/* Concierge Assistance */}
        <div className="conf-assistance-box">
          <p className="conf-assistance-text">Need assistance ?</p>
          <p className="conf-assistance-subtext">Our concierge team is available 24/7 to help you.</p>
          <div className="conf-assistance-links">
            <a href="mailto:support@travelkart.com" className="conf-assistance-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>📧 Email Support</span>
            </a>
            <span style={{ color: "#CBD5E1" }}>|</span>
            <button 
              onClick={() => toast.info("Redirecting to concierge help desk...")} 
              className="conf-assistance-link-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>📖 Help Center</span>
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
