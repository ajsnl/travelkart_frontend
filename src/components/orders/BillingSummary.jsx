import React from "react";

export default function BillingSummary({ order }) {
  return (
    <div className="billing-totals-summary">
      <div className="totals-row">
        <span>Subtotal</span>
        <span>₹{parseFloat(order.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
      {parseFloat(order.discount) > 0 && (
        <div className="totals-row discount">
          <span>Shipping Discount</span>
          <span>-₹{parseFloat(order.discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      <div className="totals-row">
        <span>Shipping</span>
        <span>{parseFloat(order.shipping_fee) === 0 ? "Free" : `₹${parseFloat(order.shipping_fee).toFixed(2)}`}</span>
      </div>
      <div className="totals-row">
        <span>Tax (18% GST)</span>
        <span>₹{(parseFloat(order.subtotal) * 0.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="totals-row grand-total">
        <span>Total Price</span>
        <span>₹{parseFloat(order.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
