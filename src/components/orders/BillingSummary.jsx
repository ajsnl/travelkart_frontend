import React from "react";

export default function BillingSummary({ order }) {
  const netSubtotal = parseFloat(order.subtotal || 0);
  const totalDiscount = parseFloat(order.discount || 0);
  const shippingFee = parseFloat(order.shipping_fee || 0);
  const totalPrice = parseFloat(order.total_price || 0);

  // Derive coupon and product discounts
  const couponDiscount = Math.max(0, netSubtotal + shippingFee - totalPrice);
  const productDiscount = Math.max(0, totalDiscount - couponDiscount);
  const originalPreDiscountSubtotal = netSubtotal + productDiscount;

  const tax = Math.max(0, (netSubtotal - couponDiscount) * 0.18);

  const cancelledTotal = (order.items || []).filter(item => item.is_cancelled).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const returnedTotal = (order.items || []).filter(item => item.is_returned).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );

  return (
    <div className="billing-totals-summary">
      <div className="totals-row">
        <span>Subtotal</span>
        <span>₹{originalPreDiscountSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
      
      {productDiscount > 0 && (
        <div className="totals-row discount">
          <span>Gear Discounts</span>
          <span>-₹{productDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      {couponDiscount > 0 && (
        <div className="totals-row discount">
          <span>Coupon Discount {order.coupon_code && `(${order.coupon_code})`}</span>
          <span>-₹{couponDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="totals-row">
        <span>Shipping</span>
        <span>{shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}</span>
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
        <span>₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
