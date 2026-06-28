import React from "react";
import { MapPin, CreditCard, Package, Calendar } from "lucide-react";
import { toast } from "react-toastify";

export default function OrderDetailsSidebar({ order }) {
  return (
    <div className="delivery-details-column">
      
      {/* Card 1: Delivery Address */}
      <div className="details-card-block">
        <h3 className="section-title">
          <MapPin size={18} className="title-icon" />
          <span>Delivery Address</span>
        </h3>
        <p className="address-text">
          <strong className="address-name">{order.full_name}</strong>
          <br />
          {order.address_line}
          <br />
          {order.city}, {order.state} - {order.pincode}
          <br />
          {order.country}
        </p>
        {order.phone && (
          <span className="phone-text">Phone: {order.phone}</span>
        )}
      </div>

      {/* Expected Delivery Date */}
      {order.delivery_estimate && (
        <div className="details-card-block">
          <h3 className="section-title">
            <Calendar size={18} className="title-icon" />
            <span>Expected Delivery</span>
          </h3>
          <p className="delivery-estimate-text" style={{ fontSize: "15px", fontWeight: "600", color: "#1E293B", marginTop: "8px" }}>
            {order.delivery_estimate}
          </p>
        </div>
      )}

      {/* Card 2: Payment Method */}
      <div className="details-card-block">
        <h3 className="section-title">
          <CreditCard size={18} className="title-icon" />
          <span>Payment Method</span>
        </h3>
        <div className="payment-method-row">
          <div className="payment-card-icon-wrapper">
            <CreditCard size={20} style={{ color: "#2563EB" }} />
          </div>
          <div className="payment-method-details">
            <span className="payment-method-name">
              {order.payment_method === "COD" ? "Cash on Delivery" : `${order.payment_method} ending in 8291`}
            </span>
            <span className="payment-method-sub">
              {order.payment_status === "paid" 
                ? `Paid on ${new Date(order.updated_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}` 
                : order.payment_status === "refunded"
                  ? "Refunded"
                  : "Payment Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Assistance Support Card */}
      {/* <div className="details-card-block assistance-card">
        <div className="assistance-icon-wrapper">
          <Package size={20} style={{ color: "#0D9488" }} />
        </div>
        <h4 className="assistance-title font-plus-jakarta">Need Assistance?</h4>
        <p className="assistance-desc">
          Our concierge team is available 24/7 to help with your booking.
        </p>
        <button className="chat-support-btn" onClick={() => toast.info("Support chat is coming soon!")}>
          Chat with Support
        </button>
      </div> */}

    </div>
  );
}
