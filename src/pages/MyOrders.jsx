import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingBag, Loader2, AlertCircle, X } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchUserOrders, simulateOrderAdvance } from "../services/orderService";
import { useCustomDialog } from "../components/CustomDialog";
import { toast } from "react-toastify";

import OrderFilters from "../components/orders/OrderFilters";
import OrderCard from "../components/orders/OrderCard";
import OrderPagination from "../components/orders/OrderPagination";
import ActionModal from "../components/orders/ActionModal";

import "./MyOrders.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;

  // ActionModal States
  const [activeActionItem, setActiveActionItem] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalReason, setModalReason] = useState("");
  const [modalComments, setModalComments] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Review Item Selection Modal State
  const [reviewSelectionOrder, setReviewSelectionOrder] = useState(null);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const res = await fetchUserOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      if (!silent) {
        setError("Unable to fetch your order history. Please try again later.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();

      const interval = setInterval(() => {
        loadOrders(true);
      }, 4000);

      return () => clearInterval(interval);
    } else {
      navigate("/login", { state: { from: "/orders" } });
    }
  }, [isAuthenticated, navigate]);

  
  const handleCancelOrder = (trackingId) => {
    const orderObj = orders.find(o => o.tracking_id === trackingId);
    if (!orderObj) return;

    setActiveActionItem(orderObj);
    setActionType("cancel_entire_order");
    setModalQty(1);
    setModalReason("");
    setModalComments("");
  };

  const handleReturnOrder = (trackingId) => {
    const orderObj = orders.find(o => o.tracking_id === trackingId);
    if (!orderObj) return;

    const deliveryTime = new Date(orderObj.updated_at);
    const now = new Date();
    const diffTime = Math.abs(now - deliveryTime);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 10) {
      toast.error("Return window has expired. Returns are only allowed within 10 days of delivery.");
      return;
    }

    setActiveActionItem(orderObj);
    setActionType("return_entire_order");
    setModalQty(1);
    setModalReason("");
    setModalComments("");
  };

  const handleConfirmModalAction = async () => {
    if (!activeActionItem || !modalReason) return;
    setSubmittingAction(true);
    try {
      if (actionType === "cancel_entire_order") {
        await simulateOrderAdvance(activeActionItem.tracking_id, "cancelled", modalReason, modalComments);
        toast.success("Order cancelled successfully! ");
      } else if (actionType === "return_entire_order") {
        await simulateOrderAdvance(activeActionItem.tracking_id, "return_requested", modalReason, modalComments);
        toast.success("Return process initiated successfully! 🔄");
      }
      
      loadOrders(true);
      setActiveActionItem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to process ${actionType.replace(/_/g, " ")}.`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddReview = (trackingId) => {
    const orderObj = orders.find(o => o.tracking_id === trackingId);
    if (!orderObj) return;

    const reviewableItems = (orderObj.items || []).filter(
      item => !item.is_cancelled && !item.is_returned && item.variant?.product_id
    );

    if (reviewableItems.length === 0) {
      toast.error("There are no reviewable products in this order.");
      return;
    }

    if (reviewableItems.length === 1) {
      navigate(`/product/${reviewableItems[0].variant.product_id}?writeReview=true`);
    } else {
      setReviewSelectionOrder(orderObj);
    }
  };

  // Tab switching mapping
  const tabMap = {
    PROCESSING: ["processing"],
    SHIPPED: ["shipped", "out_for_delivery"],
    DELIVERED: ["delivered"],
    CANCELLED: ["cancelled"],
    RETURNED: ["returned", "return_requested"],
  };

  const matchesTab = (order) => {
    if (activeTab === "ALL") return true;
    
    // Check if the overall order status matches the tab
    const statusMatch = tabMap[activeTab]?.includes(order.status.toLowerCase());
    if (statusMatch) return true;

    // Check if any individual item in the order has been cancelled or returned
    if (activeTab === "CANCELLED") {
      return (order.items || []).some(item => item.is_cancelled);
    }
    if (activeTab === "RETURNED") {
      return (order.items || []).some(item => item.is_returned);
    }

    return false;
  };

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    if (!matchesTab(order)) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = order.tracking_id.toLowerCase().includes(q);
      const matchItems = (order.items || []).some((item) =>
        (item.variant?.product_name || "").toLowerCase().includes(q)
      );
      return matchId || matchItems;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculation
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="myorders-viewport">
      <Navbar />

      <main className="myorders-content font-inter">
        <header className="myorders-header">
          <h1 className="font-plus-jakarta">My Orders</h1>
        </header>

        <OrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {loading ? (
          <div className="myorders-loader-container">
            <Loader2 className="animate-spin" size={40} style={{ color: "#00236F" }} />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="myorders-error-card">
            <AlertCircle size={48} style={{ color: "#EF4444", marginBottom: "16px" }} />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="myorders-btn-retry" onClick={loadOrders}>
              Retry Fetching
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="myorders-empty-card">
            <ShoppingBag size={48} style={{ color: "#94A3B8", marginBottom: "16px" }} />
            <h3>No Orders Found</h3>
            <p>
              {searchQuery
                ? "No matching orders fit your search query."
                : `You don't have any orders categorized under "${activeTab.toLowerCase()}".`}
            </p>
            <button className="myorders-btn-shop" onClick={() => navigate("/shop")}>
              Go Shopping
            </button>
          </div>
        ) : (
          <div className="myorders-cards-stack">
            {currentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancelOrder={handleCancelOrder}
                onReturnOrder={handleReturnOrder}
                onAddReview={handleAddReview}
                navigate={navigate}
              />
            ))}

            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
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
        simulating={submittingAction}
        onConfirm={handleConfirmModalAction}
        onClose={() => setActiveActionItem(null)}
      />

      {/* Review Item Selection Modal */}
      {reviewSelectionOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            width: "90%",
            maxWidth: "450px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            boxSizing: "border-box"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h3 className="font-plus-jakarta" style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                Select Product to Review
              </h3>
              <button 
                onClick={() => setReviewSelectionOrder(null)} 
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(reviewSelectionOrder.items || [])
                .filter(item => !item.is_cancelled && !item.is_returned && item.variant?.product_id)
                .map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "12px", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc" 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img 
                        src={item.variant?.image_url} 
                        alt={item.variant?.product_name} 
                        style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} 
                      />
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.variant?.product_name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          SKU: {item.variant?.sku}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReviewSelectionOrder(null);
                        navigate(`/product/${item.variant.product_id}?writeReview=true`);
                      }}
                      style={{ 
                        fontSize: "11px", 
                        padding: "6px 14px", 
                        cursor: "pointer", 
                        border: "none", 
                        borderRadius: "20px", 
                        backgroundColor: "#00236F", 
                        color: "#ffffff", 
                        fontWeight: "600" 
                      }}
                    >
                      Review
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
