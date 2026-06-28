import React from "react";

export default function BillingSummary({ order }) {
  const originalSubtotal = (order.items || []).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const discount = parseFloat(order.discount || 0);
  const originalPreDiscountSubtotal = originalSubtotal + discount;
  const tax = originalSubtotal * 0.18;
  const cancelledTotal = (order.items || []).filter(item => item.is_cancelled).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const returnedTotal = (order.items || []).filter(item => item.is_returned).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );

  const grandTotal = Math.max(
    0,
    originalPreDiscountSubtotal - discount + parseFloat(order.shipping_fee || 0) - cancelledTotal - returnedTotal
  );

  return (
    <div className="billing-totals-summary">
      <div className="totals-row">
        <span>Subtotal</span>
        <span>₹{originalPreDiscountSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
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
        <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
      {cancelledTotal > 0 && (
        <div className="totals-row" style={{ color: "#EF4444", fontWeight: "600" }}>
          <span>Cancelled Items</span>
          <span>-₹{cancelledTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      {returnedTotal > 0 && (
        <div className="totals-row" style={{ color: "#0D9488", fontWeight: "600" }}>
          <span>Returned Items</span>
          <span>-₹{returnedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      <div className="totals-row grand-total">
        <span>Total Price</span>
        <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
