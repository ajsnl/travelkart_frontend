import React from "react";

export default function OrderCard({ order, onCancelOrder, onReturnOrder, onAddReview, navigate }) {
  const allItems = order.items || [];
  const activeItems = allItems.filter(item => !item.is_cancelled && !item.is_returned);
  const cancelledCount = allItems.filter(item => item.is_cancelled).reduce((sum, item) => sum + item.quantity, 0);
  const returnedCount = allItems.filter(item => item.is_returned).reduce((sum, item) => sum + item.quantity, 0);

  const items = activeItems.length > 0 ? activeItems : allItems;
  const showMoreCount = items.length > 2 ? items.length - 2 : 0;
  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const getItemSummaryText = (items) => {
    if (!items || items.length === 0) return "No items";
    return items.length === 1 ? "1 Item" : `${items.length} items`;
  };

  const getItemSubText = (items) => {
    if (!items || items.length === 0) return "";
    const names = items.slice(0, 2).map((item) => {
      let name = item.variant?.product_name || "Product";
      if (item.is_cancelled) {
        name += " (Cancelled)";
      } else if (item.is_returned) {
        name += " (Returned)";
      }
      return name;
    });
    if (items.length > 2) {
      return `${names.join(", ")}, +${items.length - 2} more`;
    }
    return names.join(", ");
  };

  return (
    <article className="order-card">
      {/* Card top details */}
      <div className="order-card-header">
        <div className="header-meta">
          <span className="order-number-label">ORDER NUMBER</span>
          <h4 className="order-number-id">{order.tracking_id}</h4>
          <p className="order-date-placed">Placed on {formattedDate}</p>
        </div>
        <div className="header-status">
          <span className={`order-status-pill ${order.status}`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Card middle item previews */}
      <div className="order-card-body">
        <div className="items-previews-container">
          <div className="thumbnails-row">
            {items.slice(0, 2).map((item, idx) => {
              const statusClass = item.is_cancelled ? "cancelled" : item.is_returned ? "returned" : "";
              return (
                <img
                  key={item.id || idx}
                  src={item.variant?.image_url}
                  alt={item.variant?.product_name || "Order Item"}
                  className={`item-thumbnail-img ${statusClass}`}
                />
              );
            })}
            {showMoreCount > 0 && (
              <div className="more-items-badge">
                +{showMoreCount}
              </div>
            )}
          </div>

          <div className="items-text-details">
            <h5 className="items-count-summary">
              {getItemSummaryText(items)}
              {activeItems.length > 0 && cancelledCount > 0 && (
                <span className="removed-items-indicator" style={{ marginLeft: "8px", color: "#EF4444", fontSize: "13px", fontWeight: "600" }}>
                  ({cancelledCount} {cancelledCount === 1 ? "item" : "items"} removed)
                </span>
              )}
              {activeItems.length > 0 && returnedCount > 0 && (
                <span className="removed-items-indicator" style={{ marginLeft: "8px", color: "#0D9488", fontSize: "13px", fontWeight: "600" }}>
                  ({returnedCount} {returnedCount === 1 ? "item" : "items"} returned)
                </span>
              )}
            </h5>
            <p className="items-names-list">
              {getItemSubText(items)}
            </p>
          </div>
        </div>

        <div className="order-totals-container">
          <span className="total-amount-label">TOTAL AMOUNT</span>
          <h4 className="total-amount-val">
            ₹{parseFloat(order.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>

      {/* Card bottom actions */}
      <div className="order-card-actions">
        <button
          className="card-btn-action dark-fill"
          onClick={() => navigate(`/order-tracking/${order.tracking_id}`)}
        >
          View Details
        </button>

        {(order.status === "shipped" || order.status === "out_for_delivery") && (
          <button
            className="card-btn-action light-blue-fill"
            onClick={() => navigate(`/order-tracking/${order.tracking_id}`)}
          >
            Track Order
          </button>
        )}

        {["processing", "shipped", "out_for_delivery"].includes(order.status) && (
          <button
            className="card-btn-action danger-pill"
            onClick={() => onCancelOrder(order.tracking_id)}
          >
            Cancel Order
          </button>
        )}

        {order.status === "delivered" && (
          <>
            <button
              className="card-btn-action border-only"
              onClick={() => onAddReview(order.tracking_id)}
            >
              Add Review
            </button>
            <button
              className="card-btn-action border-only"
              onClick={() => onReturnOrder(order.tracking_id)}
            >
              Return
            </button>
          </>
        )}
      </div>
    </article>
  );
}
