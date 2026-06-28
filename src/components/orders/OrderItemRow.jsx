import React from "react";
import { XCircle, RotateCcw } from "lucide-react";

export default function OrderItemRow({ item, orderStatus, simulating, onOpenActionModal }) {
  const variant = item.variant;
  const isItemCancelable = ["processing", "shipped", "out_for_delivery"].includes(orderStatus) && !item.is_cancelled && !item.is_returned;
  const isItemReturnable = orderStatus === "delivered" && !item.is_cancelled && !item.is_returned && !item.is_return_requested;

  const statusClass = item.is_cancelled ? "cancelled" : item.is_returned ? "returned" : item.is_return_requested ? "return-requested" : "";

  return (
    <div className={`tracking-item-row ${statusClass}`}>
      <img 
        src={variant?.image_url} 
        alt={variant?.product_name || "Product image"} 
        className="tracking-item-img" 
      />
      <div className="tracking-item-details">
        <div className="tracking-item-name">
          {variant?.product_name}
          {item.is_cancelled && <span className="item-status-badge cancelled">Cancelled</span>}
          {item.is_returned && <span className="item-status-badge returned">Returned</span>}
          {item.is_return_requested && <span className="item-status-badge return-requested" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.25)" }}>Return Requested</span>}
        </div>
        {variant?.product_brand && <div className="tracking-item-brand">by {variant.product_brand}</div>}
        <div className="tracking-item-attributes">
          {variant?.sku && <span className="attr-tag">SKU: {variant.sku}</span>}
          {variant?.attributes && Object.entries(variant.attributes).map(([key, val]) => (
            <span key={key} className="attr-tag">{key}: {val}</span>
          ))}
        </div>
      </div>
      
      <div className="tracking-item-price-qty-actions">
        <div className="tracking-item-price">
          ₹{parseFloat(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        
        <div className="tracking-item-qty">
          Qty: {item.quantity}
        </div>

        {/* Individual Action Buttons */}
        {isItemCancelable && (
          <button 
            className="item-action-link cancel-link"
            onClick={() => onOpenActionModal(item, "cancel")}
            disabled={simulating}
          >
            <XCircle size={14} />
            <span>Cancel Item</span>
          </button>
        )}

        {isItemReturnable && (
          <button 
            className="item-action-link return-link"
            onClick={() => onOpenActionModal(item, "return")}
            disabled={simulating}
          >
            <RotateCcw size={14} />
            <span>Return Item</span>
          </button>
        )}
      </div>
    </div>
  );
}
