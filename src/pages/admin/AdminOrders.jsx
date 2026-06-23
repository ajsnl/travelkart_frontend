import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  X,
  CreditCard,
  MapPin,
  Calendar,
  User,
  Phone,
  Package
} from "lucide-react";
import { fetchAdminOrders, updateAdminOrderStatus } from "../../services/adminService";
import { toast } from "react-toastify";
import "./AdminOrders.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatPrice = (value) => {
  const price = parseFloat(value || 0);
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const statusColors = {
  processing: "status-processing",
  shipped: "status-shipped",
  out_for_delivery: "status-out-for-delivery",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
  return_requested: "status-return-requested",
  returned: "status-returned",
};

const paymentStatusColors = {
  pending: "pay-pending",
  paid: "pay-paid",
  failed: "pay-failed",
};

const returnReasonLabels = {
  defective: "Defective/Damaged product",
  wrong_size: "Wrong size or color",
  not_matching: "Item not as described",
  no_longer_needed: "No longer needed",
  other: "Other reason",
};

const cancelReasonLabels = {
  changed_mind: "Changed my mind",
  wrong_item: "Ordered wrong item",
  delivery_delayed: "Delivery is taking too long",
  found_better_price: "Found a better price elsewhere",
  other: "Other reason",
};

const AdminOrders = () => {
  const { search } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    total_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
  });

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editDeliveryEstimate, setEditDeliveryEstimate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCancelledItemId, setExpandedCancelledItemId] = useState(null);

  const loadOrders = async (silent = false) => {
    try {
      const res = await fetchAdminOrders({
        search,
        page,
        status: statusFilter,
        payment_status: paymentFilter,
      });
      setOrders(res.data.results);
      setCount(res.data.count);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error loading administration orders:", err);
      if (!silent) {
        toast.error("Failed to load orders.");
      }
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentFilter]);

  useEffect(() => {
    loadOrders();

    // Poll every 4 seconds to sync status changes / user cancellations in real-time
    const interval = setInterval(() => {
      loadOrders(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [search, page, statusFilter, paymentFilter]);

  // Sync details modal with real-time updates from background polling
  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find(o => o.tracking_id === selectedOrder.tracking_id);
      if (updatedOrder) {
        if (
          updatedOrder.status !== selectedOrder.status ||
          updatedOrder.payment_status !== selectedOrder.payment_status ||
          updatedOrder.delivery_estimate !== selectedOrder.delivery_estimate ||
          JSON.stringify(updatedOrder.items) !== JSON.stringify(selectedOrder.items)
        ) {
          setSelectedOrder(updatedOrder);
          setEditStatus(updatedOrder.status);
          setEditPaymentStatus(updatedOrder.payment_status);
          setEditDeliveryEstimate(updatedOrder.delivery_estimate || "");
        }
      }
    }
  }, [orders, selectedOrder]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.payment_status);
    setEditDeliveryEstimate(order.delivery_estimate || "");
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
    setExpandedCancelledItemId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    try {
      const res = await updateAdminOrderStatus(selectedOrder.tracking_id, {
        status: editStatus,
        payment_status: editPaymentStatus,
        delivery_estimate: editDeliveryEstimate,
      });
      
      toast.success(`Order ${selectedOrder.tracking_id} updated successfully.`);
      
      // Reload order list and statistics
      await loadOrders();
      
      // Update selected order in view to reflect changes in modal
      setSelectedOrder(res.data);
      
      closeOrderDetails();
    } catch (err) {
      console.error("Error updating order:", err);
      const errMsg = err.response?.data?.error || "Failed to update order.";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const startItemRange = (page - 1) * 10 + 1;
  const endItemRange = Math.min(page * 10, count);

  return (
    <div className="admin-container">
      
      {/* Header */}
      <div className="workspace-header-row">
        <h1 className="workspace-title font-plus-jakarta">Order Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        
        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper total-icon-bg">
              <ShoppingBag size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Total Orders</span>
          <span className="stat-value font-plus-jakarta">{stats.total_orders.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper active-icon-bg">
              <Clock size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Pending Orders</span>
          <span className="stat-value font-plus-jakarta">{stats.processing_orders.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper gold-icon-bg">
              <CheckCircle size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Completed Orders</span>
          <span className="stat-value font-plus-jakarta">{stats.completed_orders.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper unverified-icon-bg">
              <XCircle size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Cancelled Orders</span>
          <span className="stat-value font-plus-jakarta">{stats.cancelled_orders.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div className="stat-icon-wrapper revenue-icon-bg">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="stat-label uppercase font-inter">Total Revenue</span>
          <span className="stat-value font-plus-jakarta">{formatPrice(stats.total_revenue)}</span>
        </div>

      </div>

      {/* Filters Bar */}
      <div className="controls-bar-row">
        <div className="filter-select-wrapper">
          <SlidersHorizontal size={14} className="filter-leading-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-filter-dropdown font-inter"
          >
            <option value="">All Order Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div className="filter-select-wrapper">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="custom-filter-dropdown font-inter"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-card-frame">
        <table className="figma-dark-table font-inter">
          <thead>
            <tr>
              <th className="uppercase">Order ID</th>
              <th className="uppercase">Customer Details</th>
              <th className="uppercase">Order Date</th>
              <th className="uppercase">Total Amount</th>
              <th className="uppercase">Payment Status</th>
              <th className="uppercase">Order Status</th>
              <th className="uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-row text-center font-inter">
                  No orders found matching filters or search query.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  {/* Order ID */}
                  <td className="font-plus-jakarta font-semibold text-white">
                    {order.tracking_id}
                  </td>
                  
                  {/* Customer Info */}
                  <td>
                    <div className="profile-meta-stack">
                      <span className="profile-row-fullname font-inter">{order.full_name}</span>
                      <span className="profile-row-email-anchor">{order.user_email}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="table-row-timestamp-text">
                    {formatDate(order.created_at)}
                  </td>

                  {/* Total price */}
                  <td className="font-semibold text-white">
                    {formatPrice(order.total_price)}
                  </td>

                  {/* Payment Status badge */}
                  <td>
                    <span className={`pay-status-badge ${paymentStatusColors[order.payment_status] || "pay-pending"}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </td>

                  {/* Order Status badge */}
                  <td>
                    <span className={`order-status-badge ${statusColors[order.status] || "status-processing"}`}>
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell-alignment-box">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="table-action-details-btn"
                        title="View / Edit Order Details"
                      >
                        <Eye size={14} style={{ marginRight: "6px" }} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <footer className="table-pagination-footer-console font-inter">
          <div className="pagination-range-counter-info">
            Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> orders
          </div>

          <div className="pagination-action-controls-button-group">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="console-pagination-step-btn"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="pagination-page-numeric-cluster">
              <button className="numeric-page-btn numeric-active-btn">
                {page}
              </button>
              {page * 10 < count && (
                <button onClick={() => setPage(page + 1)} className="numeric-page-btn">
                  {page + 1}
                </button>
              )}
            </div>

            <button
              disabled={page * 10 >= count}
              onClick={() => setPage(page + 1)}
              className="console-pagination-step-btn"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      {/* Details & Edit Modal */}
      {isModalOpen && selectedOrder && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-container font-inter animate-modal-slide">
            
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title font-plus-jakarta">Order Details</h2>
                <p className="admin-modal-subtitle">Tracking ID: {selectedOrder.tracking_id}</p>
              </div>
              <button className="admin-modal-close-btn" onClick={closeOrderDetails}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="admin-modal-content">
              
              <div className="admin-modal-layout-grid">
                
                {/* Left Panel: Items & Summary */}
                <div className="modal-grid-left">
                  <div className="modal-section-card">
                    <h3 className="section-card-title"><Package size={16} /> Ordered Items</h3>
                    <div className="order-items-list-container">
                      {selectedOrder.items?.map((item) => {
                        const isCancelled = item.is_cancelled;
                        return (
                          <div key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                            <div 
                              className={`order-item-detail-row ${isCancelled ? 'cancelled-item-row' : ''}`}
                              onClick={() => isCancelled && setExpandedCancelledItemId(expandedCancelledItemId === item.id ? null : item.id)}
                              style={isCancelled ? { cursor: "pointer", opacity: 0.8 } : {}}
                              title={isCancelled ? "Click to view cancellation details" : ""}
                            >
                              <div className="item-details-left">
                                <span 
                                  className="item-name text-white" 
                                  style={isCancelled ? { textDecoration: "line-through", color: "#94A3B8" } : {}}
                                >
                                  {item.variant?.product_name || "Product SKU"}
                                </span>
                                <span className="item-sku font-mono">
                                  {item.variant?.sku || "SKU N/A"}
                                  {isCancelled && (
                                    <span style={{ 
                                      marginLeft: "8px", 
                                      backgroundColor: "rgba(239, 68, 68, 0.15)", 
                                      color: "#ef4444", 
                                      padding: "2px 6px", 
                                      borderRadius: "4px",
                                      fontSize: "10px",
                                      fontWeight: "700" 
                                    }}>
                                      CANCELLED
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="item-details-right">
                                <span className="item-qty-price">{item.quantity} x {formatPrice(item.price)}</span>
                                <span 
                                  className="item-total-price font-semibold text-white"
                                  style={isCancelled ? { textDecoration: "line-through", color: "#94A3B8" } : {}}
                                >
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Cancellation Details Panel */}
                            {isCancelled && expandedCancelledItemId === item.id && (
                              <div style={{
                                margin: "2px 0 12px 12px",
                                padding: "12px 16px",
                                backgroundColor: "rgba(30, 41, 59, 0.6)",
                                borderLeft: "3px solid #ef4444",
                                borderRadius: "4px",
                                fontSize: "12px",
                                color: "#94A3B8"
                              }}>
                                <div><strong>Cancel Reason:</strong> {cancelReasonLabels[item.cancel_reason] || item.cancel_reason || "Not specified"}</div>
                                {item.cancel_comments && (
                                  <div style={{ marginTop: "4px" }}><strong>Comments:</strong> {item.cancel_comments}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="order-summary-totals-card">
                      <div className="totals-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="totals-row">
                        <span>Shipping Fee</span>
                        <span>{parseFloat(selectedOrder.shipping_fee) === 0 ? "Free" : formatPrice(selectedOrder.shipping_fee)}</span>
                      </div>
                      <div className="totals-row text-green-accent">
                        <span>Discount</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                      <div className="totals-row final-total-row text-white font-bold">
                        <span>Grand Total</span>
                        <span>{formatPrice(selectedOrder.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Address & Update Form */}
                <div className="modal-grid-right">
                  
                  {/* Address Summary Card */}
                  <div className="modal-section-card">
                    <h3 className="section-card-title"><MapPin size={16} /> Shipping Details</h3>
                    <div className="shipping-address-summary text-dim">
                      <p className="address-line-item"><User size={14} /> <strong className="text-white">{selectedOrder.full_name}</strong></p>
                      <p className="address-line-item"><Phone size={14} /> {selectedOrder.phone}</p>
                      <div className="address-text-block">
                        <p>{selectedOrder.address_line}</p>
                        <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                        <p>{selectedOrder.country}</p>
                      </div>
                      <div className="payment-method-row">
                        <CreditCard size={14} />
                        <span>Payment Method: <strong className="text-white">{selectedOrder.payment_method}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Actions Form */}
                  <div className="modal-section-card mt-16">
                    <h3 className="section-card-title"><SlidersHorizontal size={16} /> Order Management Action Panel</h3>
                    
                    {selectedOrder.status === "cancelled" && (selectedOrder.cancel_reason || selectedOrder.cancel_comments) && (
                      <div className="cancel-reason-alert-panel" style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px"
                      }}>
                        <span style={{ color: "#EF4444", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                          ❌ Order Cancelled Details
                        </span>
                        <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                          <div><strong>Reason:</strong> {cancelReasonLabels[selectedOrder.cancel_reason] || selectedOrder.cancel_reason || "Not specified"}</div>
                          {selectedOrder.cancel_comments && (
                            <div style={{ marginTop: "4px" }}><strong>Comments:</strong> {selectedOrder.cancel_comments}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === "return_requested" && (
                      <div className="return-request-alert-panel" style={{
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px"
                      }}>
                        <span style={{ color: "#F59E0B", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                          ⚠️ Return Request Pending
                        </span>
                        <p style={{ fontSize: "13px", color: "#94A3B8", margin: "0 0 12px 0" }}>
                          The user has requested to return this entire order. Please accept or reject this request.
                        </p>
                        <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "12px", borderTop: "1px solid rgba(245, 158, 11, 0.2)", paddingTop: "8px" }}>
                          <div><strong>Reason:</strong> {returnReasonLabels[selectedOrder.return_reason] || selectedOrder.return_reason || "Not specified"}</div>
                          {selectedOrder.return_comments && (
                            <div style={{ marginTop: "4px" }}><strong>Comments:</strong> {selectedOrder.return_comments}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsSaving(true);
                              try {
                                const res = await updateAdminOrderStatus(selectedOrder.tracking_id, {
                                  status: "returned",
                                });
                                toast.success("Return request accepted. Stock restored.");
                                await loadOrders();
                                setSelectedOrder(res.data);
                                closeOrderDetails();
                              } catch (err) {
                                console.error(err);
                                toast.error(err.response?.data?.error || "Failed to accept return.");
                              } finally {
                                setIsSaving(false);
                              }
                            }}
                            className="btn-modal-save"
                            style={{ backgroundColor: "#10B981", borderColor: "#10B981", height: "34px", fontSize: "13px", padding: "0 16px" }}
                            disabled={isSaving}
                          >
                            Accept Return
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsSaving(true);
                              try {
                                const res = await updateAdminOrderStatus(selectedOrder.tracking_id, {
                                  status: "delivered",
                                });
                                toast.success("Return request rejected.");
                                await loadOrders();
                                setSelectedOrder(res.data);
                                closeOrderDetails();
                              } catch (err) {
                                console.error(err);
                                toast.error(err.response?.data?.error || "Failed to reject return.");
                              } finally {
                                setIsSaving(false);
                              }
                            }}
                            className="btn-modal-cancel"
                            style={{ height: "34px", fontSize: "13px", padding: "0 16px" }}
                            disabled={isSaving}
                          >
                            Reject Return
                          </button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleUpdate} className="modal-action-form">
                      <div className="form-group-item">
                        <label className="form-label text-white">Order Status</label>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="modal-select-field"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="return_requested">Return Requested</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>

                      <div className="form-group-item">
                        <label className="form-label text-white">Payment Status</label>
                        <select 
                          value={editPaymentStatus} 
                          onChange={(e) => setEditPaymentStatus(e.target.value)}
                          className="modal-select-field"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div className="form-group-item">
                        <label className="form-label text-white"><Calendar size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Delivery Estimate</label>
                        <input 
                          type="text" 
                          value={editDeliveryEstimate} 
                          onChange={(e) => setEditDeliveryEstimate(e.target.value)}
                          placeholder="e.g. Friday, 26 June 2026"
                          className="modal-input-field"
                        />
                      </div>

                      <div className="modal-action-buttons-wrapper">
                        <button 
                          type="button" 
                          onClick={closeOrderDetails} 
                          className="btn-modal-cancel"
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-modal-save"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="admin-footer-branding font-inter">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>

    </div>
  );
};

export default AdminOrders;
