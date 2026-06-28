import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Download } from "lucide-react";

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
import { generateInvoicePDF } from "../utils/invoiceGenerator";

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
  const getOrderData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const res = await fetchOrderDetail(trackingId);
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      if (!silent) {
        setError(err.response?.data?.error || "Unable to retrieve order details. Please verify the URL or ensure you are logged in.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getOrderData();

    const interval = setInterval(() => {
      getOrderData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [trackingId]);

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

  const handleCancelEntireOrder = () => {
    handleOpenActionModal(order, "cancel_entire_order");
  };

  const handleReturnEntireOrder = () => {
    handleOpenActionModal(order, "return_entire_order");
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
      let res;
      if (actionType === "cancel_entire_order") {
        res = await simulateOrderAdvance(order.tracking_id, "cancelled", modalReason, modalComments);
        toast.success("Entire order cancelled successfully! ❌");
      } else if (actionType === "return_entire_order") {
        res = await simulateOrderAdvance(order.tracking_id, "return_requested", modalReason, modalComments);
        toast.success("Return process initiated successfully! 🔄");
      } else if (actionType === "cancel") {
        res = await cancelOrderItem(activeActionItem.id, modalQty, modalReason, modalComments);
        toast.success("Item cancelled successfully!");
      } else {
        res = await returnOrderItem(activeActionItem.id, modalQty, modalReason, modalComments);
        toast.success("Return initiated successfully!");
      }
      
      setOrder(res.data);
      setActiveActionItem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to process ${actionType.replace(/_/g, " ")}.`);
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

        {/* Status Tracker Bar Card */}
        <div className="tracking-main-card">
          
          <OrderTrackingBanner 
            order={order}
            deliveredDate={deliveredDate}
            simulating={simulating}
            onCancelEntireOrder={handleCancelEntireOrder}
            onReturnEntireOrder={handleReturnEntireOrder}
          />

          <OrderTrackingTimeline 
            order={order}
            createdDateStr={createdDateStr}
            deliveredDate={deliveredDate}
          />

          <hr className="section-divider" />

          {/* Details split grid: Left (Items), Right (Address, Payment, Support) */}
          <div className="tracking-details-grid">
            
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

              <BillingSummary order={order} />
            </div>
            
            {/* Right Column: Address, Payment, Support Cards */}
            <OrderDetailsSidebar order={order} />

          </div>

          <hr className="section-divider" />

          <div className="tracking-footer-actions">
            <button 
              className="btn-go-orders font-inter" 
              onClick={() => navigate("/profile")}
            >
              Go to My Orders
            </button>
            {order.payment_status === "paid" && (
              <button 
                className="btn-download-invoice font-inter" 
                onClick={() => generateInvoicePDF(order)}
              >
                <Download size={16} /> Download Invoice
              </button>
            )}
          </div>

        </div>
      </main>
      <Footer />
      
     
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