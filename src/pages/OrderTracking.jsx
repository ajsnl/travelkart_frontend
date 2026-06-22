import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Sliders } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useCustomDialog } from "../components/CustomDialog";

import { fetchOrderDetail, simulateOrderAdvance, cancelOrderItem, returnOrderItem } from "../services/orderService";

import OrderTrackingBanner from "../components/orders/OrderTrackingBanner";
import OrderTrackingTimeline from "../components/orders/OrderTrackingTimeline";
import OrderItemRow from "../components/orders/OrderItemRow";
import BillingSummary from "../components/orders/BillingSummary";
import OrderDetailsSidebar from "../components/orders/OrderDetailsSidebar";
import ActionModal from "../components/orders/ActionModal";

import "./OrderTracking.css";

export default function OrderTracking() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();

  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  
  // Modal states for cancel/return item
  const [activeActionItem, setActiveActionItem] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalReason, setModalReason] = useState("");
  const [modalComments, setModalComments] = useState("");

  // Fetch Order Details
  const getOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrderDetail(trackingId);
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.response?.data?.error || "Unable to retrieve order details. Please verify the URL or ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderData();
  }, [trackingId]);

  // Simulate Status Update
  const handleSimulateStatus = async (newStatus) => {
    if (!order) return;
    try {
      setSimulating(true);
      const res = await simulateOrderAdvance(order.tracking_id, newStatus);
      setOrder(res.data);
      toast.success(`Shipment status advanced to: ${newStatus.replace(/_/g, ' ')}! 🚚`);
    } catch (err) {
      console.error("Simulation error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to simulate status advancement.";
      toast.error(errMsg);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="tracking-viewport">
        <Navbar />
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
          <Loader2 className="animate-spin" size={48} style={{ color: "#00236F", marginBottom: "16px" }} />
          <p style={{ color: "#64748B", fontWeight: "600" }}>Retrieving order logistics payload...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-viewport">
        <Navbar />
        <main className="tracking-content">
          <div className="tracking-header">
            <button className="btn-back-link" onClick={() => navigate("/profile")}>
              <ArrowLeft size={18} />
            </button>
            <div className="tracking-title-block">
              <h1>Logistics Registry Error</h1>
            </div>
          </div>
          <div className="tracking-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", textAlign: "center" }}>
            <AlertCircle size={48} style={{ color: "#EF4444", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#1E293B" }}>Could Not Find Order File</h3>
            <p style={{ color: "#64748B", maxWidth: "450px", marginBottom: "24px", lineHeight: "1.6" }}>{error}</p>
            <button className="conf-btn-primary" onClick={() => navigate("/shop")}>
              Return to Catalog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isReturned = order.status === "returned";

  // Format dates
  const createdDateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const deliveredDate = new Date(order.updated_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const handleCancelEntireOrder = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to cancel the entire order? This action cannot be undone.",
      "Cancel Entire Order",
      "error"
    );
    if (!confirmed) return;
    try {
      setSimulating(true);
      const res = await simulateOrderAdvance(order.tracking_id, "cancelled");
      setOrder(res.data);
      toast.success("Entire order cancelled successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to cancel order.");
    } finally {
      setSimulating(false);
    }
  };

  const handleReturnEntireOrder = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to return the entire order?",
      "Return Entire Order",
      "warning"
    );
    if (!confirmed) return;
    try {
      setSimulating(true);
      const res = await simulateOrderAdvance(order.tracking_id, "returned");
      setOrder(res.data);
      toast.success("Return process initiated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to initiate return.");
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenActionModal = (item, type) => {
    setActiveActionItem(item);
    setActionType(type);
    setModalQty(1);
    setModalReason("");
    setModalComments("");
  };

  const handleConfirmModalAction = async () => {
    if (!activeActionItem || !modalReason) return;
    try {
      setSimulating(true);
      const res = actionType === "cancel"
        ? await cancelOrderItem(activeActionItem.id, modalQty)
        : await returnOrderItem(activeActionItem.id, modalQty);
      
      setOrder(res.data);
      toast.success(actionType === "cancel" ? "Item cancelled successfully!" : "Return initiated successfully!");
      setActiveActionItem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to ${actionType} item.`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="tracking-viewport">
      <Navbar />
      <main className="tracking-content font-inter">
        {/* Header Breadcrumbs */}
        <header className="tracking-header">
          <button className="btn-back-link" onClick={() => navigate(-1)} title="Back to Previous View">
            <ArrowLeft size={18} />
          </button>
          <div className="tracking-title-block">
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", color: "#64748B" }}>
              Orders / #{order.tracking_id}
            </span>
            <div style={{ display: "flex", alignItems: "center", marginTop: "2px" }}>
              <h1>Order Details – #{order.tracking_id}</h1>
            </div>
          </div>
        </header>

        {/* DEVELOPER SIMULATION INTERFACE PANEL */}
        <section className="simulation-panel">
          <div className="sim-header">
            <Sliders size={18} />
            <h3 className="sim-title">Shipment Lifecycle Simulator</h3>
          </div>
          <p className="sim-description">
            Advance the order status below to simulate how the tracking timeline responds to status changes in the database.
          </p>
          <div className="sim-buttons">
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("processing")} 
              className={`btn-sim ${order.status === "processing" ? "active-sim" : ""}`}
            >
              Set to Processing
            </button>
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("shipped")} 
              className={`btn-sim ${order.status === "shipped" ? "active-sim" : ""}`}
            >
              Set to Shipped
            </button>
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("out_for_delivery")} 
              className={`btn-sim ${order.status === "out_for_delivery" ? "active-sim" : ""}`}
            >
              Set to Out for Delivery
            </button>
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("delivered")} 
              className={`btn-sim ${order.status === "delivered" ? "active-sim" : ""}`}
            >
              Set to Delivered
            </button>
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("cancelled")} 
              className={`btn-sim sim-danger ${order.status === "cancelled" ? "active-sim" : ""}`}
            >
              Cancel Order
            </button>
            <button 
              disabled={simulating}
              onClick={() => handleSimulateStatus("returned")} 
              className={`btn-sim sim-teal ${order.status === "returned" ? "active-sim" : ""}`}
            >
              Return Order
            </button>
          </div>
        </section>

        {/* Status Tracker Bar Card */}
        <div className="tracking-main-card">
          
          {/* TOP STATUS DESCRIPTION BANNER */}
          <OrderTrackingBanner 
            order={order}
            deliveredDate={deliveredDate}
            simulating={simulating}
            onCancelEntireOrder={handleCancelEntireOrder}
            onReturnEntireOrder={handleReturnEntireOrder}
          />

          {/* Timeline Progress Tracker */}
          <OrderTrackingTimeline 
            order={order}
            createdDateStr={createdDateStr}
            deliveredDate={deliveredDate}
          />

          <hr className="section-divider" />

          {/* Details split grid: Left (Items), Right (Address, Payment, Support) */}
          <div className="tracking-details-grid">
            
            {/* Left Column: Order Items */}
            <div className="order-summary-column">
              <h3 className="section-title font-plus-jakarta">Order Items</h3>
              
              <div className="tracking-items-list">
                {order.items?.map((item) => (
                  <OrderItemRow 
                    key={item.id}
                    item={item}
                    orderStatus={order.status}
                    simulating={simulating}
                    onOpenActionModal={handleOpenActionModal}
                  />
                ))}
              </div>

              {/* Billing total summary details 
              */}
              <BillingSummary order={order} />
            </div>
            
            {/* Right Column: Address, Payment, Support Cards */}
            <OrderDetailsSidebar order={order} />

          </div>

          <hr className="section-divider" />

          {/* Action Button */}
          <div className="tracking-footer-actions">
            <button 
              className="btn-go-orders font-inter" 
              onClick={() => navigate("/profile")}
            >
              Go to My Orders
            </button>
          </div>

        </div>
      </main>
      <Footer />
      
      {/* Cancel/Return Item Popup Modal */}
      <ActionModal 
        activeActionItem={activeActionItem}
        actionType={actionType}
        modalQty={modalQty}
        setModalQty={setModalQty}
        modalReason={modalReason}
        setModalReason={setModalReason}
        modalComments={modalComments}
        setModalComments={setModalComments}
        simulating={simulating}
        onConfirm={handleConfirmModalAction}
        onClose={() => setActiveActionItem(null)}
      />
    </div>
  );
}