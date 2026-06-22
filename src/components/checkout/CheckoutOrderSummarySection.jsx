import React from "react";
import { Truck, Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function CheckoutOrderSummarySection({
  items,
  totalItems,
  originalSubtotal,
  discountTotal,
  shippingFee,
  taxAmount,
  isGold,
  finalTotal,
  isCheckoutRestricted,
  processing,
  selectedAddress,
  handlePlaceOrder
}) {
  return (
    <div className="checkout-summary-column">
      <div className="checkout-section-card" style={{ marginBottom: "0" }}>
        <h2 className="checkout-section-title" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "12px", marginBottom: "16px" }}>
          Order Summary
        </h2>

        {/* Product Overview list */}
        <div className="checkout-product-list">
          {items.map((item) => {
            const variant = item.variant;
            const priceToUse = variant?.offer_price ? parseFloat(variant.offer_price) : parseFloat(variant?.price || 0);
            const itemTotal = priceToUse * item.quantity;

            return (
              <div key={item.id} className="checkout-product-item">
                <div className="checkout-prod-img-wrapper">
                  <img
                    src={variant?.image_url}
                    alt={variant?.product_name || "Gear Product"}
                    className="checkout-prod-img"
                  />
                </div>

                <div className="checkout-prod-details">
                  <div>
                    <div className="checkout-prod-name">{variant?.product_name}</div>
                    <div className="checkout-prod-meta">
                      {variant?.product_brand && <span>by {variant.product_brand}</span>}
                      {variant?.attributes && Object.entries(variant.attributes).map(([k, v]) => (
                        <span key={k} style={{ marginLeft: "6px" }}>• {k}: {v}</span>
                      ))}
                    </div>
                  </div>

                  <div className="checkout-prod-qty-price">
                    <span className="checkout-prod-qty">Qty: {item.quantity}</span>
                    <span className="checkout-prod-price">
                      ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="checkout-divider" />

        {/* Calculations details */}
        <div className="checkout-breakdown-details">
          <div className="checkout-breakdown-row">
            <span>Subtotal ({totalItems} items)</span>
            <span>₹{originalSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {discountTotal > 0 && (
            <div className="checkout-breakdown-row discount">
              <span>Gear Discounts</span>
              <span>-₹{discountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="checkout-breakdown-row">
            <span>Shipping Fee</span>
            {shippingFee === 0 ? (
              <span style={{ color: "#10B981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <Truck size={14} /> FREE
              </span>
            ) : (
              <span>₹{shippingFee.toFixed(2)}</span>
            )}
          </div>

          <div className="checkout-breakdown-row taxes">
            <span>GST (18% Included)</span>
            <span>₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {isGold && (
            <div className="checkout-breakdown-row" style={{ color: "#B45309", fontSize: "12px", fontWeight: "600" }}>
              <span>✪ Gold Member shipping waiver applied</span>
            </div>
          )}

          <hr className="checkout-divider" style={{ margin: "8px 0" }} />

          <div className="checkout-breakdown-row total">
            <span>Total Amount</span>
            <span>₹{finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button
            disabled={
              isCheckoutRestricted ||
              items.length === 0 ||
              !selectedAddress ||
              processing
            }
            onClick={handlePlaceOrder}
            className="checkout-place-order-btn"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Confirming Cargo...</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Place Order</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="checkout-security-guarantee">
            <ShieldCheck size={14} style={{ color: "#10B981" }} />
            <span>Secure SSL Encryption. All transactions are protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
