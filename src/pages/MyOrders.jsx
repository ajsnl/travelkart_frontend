import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingBag, Loader2, AlertCircle } from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchUserOrders, simulateOrderAdvance } from "../services/orderService";
import { useCustomDialog } from "../components/CustomDialog";
import { toast } from "react-toastify";

import OrderFilters from "../components/orders/OrderFilters";
import OrderCard from "../components/orders/OrderCard";
import OrderPagination from "../components/orders/OrderPagination";

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

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchUserOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError("Unable to fetch your order history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      navigate("/login", { state: { from: "/orders" } });
    }
  }, [isAuthenticated, navigate]);

  // Cancel order
  const handleCancelOrder = async (trackingId) => {
    const confirmed = await showConfirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
      "Cancel Order",
      "error"
    );
    if (!confirmed) return;

    try {
      await simulateOrderAdvance(trackingId, "cancelled");
      toast.success("Order cancelled successfully!");
      loadOrders();
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error("Failed to cancel order.");
    }
  };

  // Return order trigger
  const handleReturnOrder = async (trackingId) => {
    const confirmed = await showConfirm(
      "Are you sure you want to request a return for this order?",
      "Return Order",
      "warning"
    );
    if (!confirmed) return;

    try {
      await simulateOrderAdvance(trackingId, "returned");
      toast.success("Return process initiated successfully!");
      loadOrders();
    } catch (err) {
      console.error("Return error:", err);
      toast.error("Failed to initiate return.");
    }
  };

  // Add review placeholder
  const handleAddReview = (trackingId) => {
    toast.info(`Review interface for Order #${trackingId} is coming soon!`);
  };

  //tab switching(All,cancelled..)

const tabMap = {
  PROCESSING: ["processing"],
  SHIPPED: ["shipped", "out_for_delivery"],
  DELIVERED: ["delivered"],
  CANCELLED: ["cancelled"],
  RETURNED: ["returned"],
};

const matchesTab = (orderStatus) => {
  if (activeTab === "ALL") return true;
  return tabMap[activeTab]?.includes(orderStatus.toLowerCase());
};

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    if (!matchesTab(order.status)) return false;

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

  // Reset page number on filter changes
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

        {/* Filters and Search toolbar */}
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
    </div>
  );
}
