import React from "react";

const formatPrice = (value) => {
  const price = parseFloat(value || 0);
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export default function ActionModal({
  activeActionItem,
  actionType,
  modalQty,
  setModalQty,
  modalReason,
  setModalReason,
  modalComments,
  setModalComments,
  simulating,
  onConfirm,
  onClose
}) {
  if (!activeActionItem) return null;

  const isEntireOrder = actionType === "cancel_entire_order" || actionType === "return_entire_order";
  const isCancel = actionType === "cancel" || actionType === "cancel_entire_order";

  return (
    <div className="action-modal-overlay">
      <div className="action-modal-container font-inter">
        {/* Modal Header */}
        <div className="action-modal-header">
          <h2>{isCancel ? (isEntireOrder ? "Cancel Entire Order" : "Cancel Item") : (isEntireOrder ? "Return Entire Order" : "Return Item")}</h2>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Item/Order Summary Card */}
        <div className="modal-item-summary-card">
          {!isEntireOrder && activeActionItem.variant?.image_url ? (
            <img 
              src={activeActionItem.variant?.image_url} 
              alt={activeActionItem.variant?.product_name} 
              className="modal-item-img"
            />
          ) : (
            <div className="modal-item-img-placeholder" style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
              fontWeight: "bold",
              fontSize: "18px"
            }}>
              TK
            </div>
          )}
          <div className="modal-item-info">
            <h4>{isEntireOrder ? `Order #${activeActionItem.tracking_id}` : activeActionItem.variant?.product_name}</h4>
            <p style={{ margin: "4px 0 0 0" }}>
              {isEntireOrder 
                ? `${activeActionItem.items?.length || 0} items • Total: ${formatPrice(activeActionItem.total_price)}` 
                : `Qty Ordered: ${activeActionItem.quantity}`
              }
            </p>
          </div>
        </div>

        {/* Quantity Selector */}
        {!isEntireOrder && (
          <div className="modal-form-group">
            <label className="modal-form-label">
              {actionType === "cancel" ? "Quantity to Cancel" : "Quantity to Return"}
            </label>
            <div className="modal-qty-selector">
              <button 
                className="modal-qty-btn"
                onClick={() => setModalQty(prev => Math.max(1, prev - 1))}
                disabled={modalQty <= 1}
              >
                -
              </button>
              <span className="modal-qty-val">{modalQty}</span>
              <button 
                className="modal-qty-btn"
                onClick={() => setModalQty(prev => Math.min(activeActionItem.quantity, prev + 1))}
                disabled={modalQty >= activeActionItem.quantity}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Reason Dropdown */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            {isCancel ? "Reason for Cancellation" : "Reason for Return"}
          </label>
          <select 
            className="modal-select-input"
            value={modalReason}
            onChange={(e) => setModalReason(e.target.value)}
          >
            <option value="">Select a reason</option>
            {isCancel ? (
              <>
                <option value="changed_mind">Changed my mind</option>
                <option value="wrong_item">Ordered wrong item</option>
                <option value="delivery_delayed">Delivery is taking too long</option>
                <option value="found_better_price">Found a better price elsewhere</option>
                <option value="other">Other reason</option>
              </>
            ) : (
              <>
                <option value="defective">Defective/Damaged product</option>
                <option value="wrong_size">Wrong size or color</option>
                <option value="not_matching">Item not as described</option>
                <option value="no_longer_needed">No longer needed</option>
                <option value="other">Other reason</option>
              </>
            )}
          </select>
        </div>

        {/* Optional Comments */}
        <div className="modal-form-group">
          <label className="modal-form-label">Tell us more (optional)</label>
          <textarea 
            className="modal-textarea-input"
            placeholder={isCancel ? "Provide any additional details about your cancellation..." : "Provide any additional details about your return..."}
            value={modalComments}
            onChange={(e) => setModalComments(e.target.value)}
            rows={3}
          />
        </div>

        {/* Confirm button */}
        <button 
          className="modal-primary-btn"
          disabled={simulating || !modalReason}
          onClick={onConfirm}
        >
          {isCancel ? "Confirm Cancellation" : "Confirm Return"}
        </button>

        {/* Cancel button */}
        <button className="modal-secondary-btn" onClick={onClose}>
          {isEntireOrder ? "Keep Order" : "Keep Item"}
        </button>

        {/* Footer Text */}
        <p className="modal-footer-policy-text">
          {isCancel 
            ? "Your cancellation will be processed immediately. Once confirmed, a refund will be issued to your payment method."
            : "Your return will be processed according to our Return Policy. Once confirmed, you'll receive a prepaid shipping label via email."
          }
        </p>
      </div>
    </div>
  );
}
