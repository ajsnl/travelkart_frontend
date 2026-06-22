import React from "react";
import { Package, Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export default function OrderTrackingBanner({ 
  order, 
  deliveredDate, 
  simulating, 
  onCancelEntireOrder, 
  onReturnEntireOrder 
}) {
  const getBannerDetails = () => {
    switch (order.status) {
      case "processing":
        return {
          title: "Order Processing",
          desc: "We're preparing your curated essentials for shipment.",
          bgColor: "#EBF5FF",
          textColor: "#00236F",
          icon: <Package size={24} style={{ color: "#00236F" }} />,
          showAction: "cancel"
        };
      case "shipped":
        return {
          title: "Order Shipped",
          desc: "Your shipment is in transit with our logistics carrier.",
          bgColor: "#FEF3C7",
          textColor: "#92400E",
          icon: <Truck size={24} style={{ color: "#92400E" }} />,
          showAction: "cancel"
        };
      case "out_for_delivery":
        return {
          title: "Out for Delivery",
          desc: "Your package is with the carrier and will be delivered today.",
          bgColor: "#E0F2FE",
          textColor: "#0369A1",
          icon: <Truck size={24} style={{ color: "#0369A1", transform: "scaleX(-1)" }} />,
          showAction: "cancel"
        };
      case "delivered":
        return {
          title: "Order Delivered",
          desc: `Your package was safely delivered on ${deliveredDate}.`,
          bgColor: "#D1FAE5",
          textColor: "#065F46",
          icon: <CheckCircle2 size={24} style={{ color: "#065F46" }} />,
          showAction: "return"
        };
      case "cancelled":
        return {
          title: "Order Cancelled",
          desc: "This order has been cancelled and refunded where applicable.",
          bgColor: "#FEE2E2",
          textColor: "#991B1B",
          icon: <XCircle size={24} style={{ color: "#991B1B" }} />,
          showAction: "none"
        };
      case "returned":
        return {
          title: "Order Returned",
          desc: "The package has been returned to our warehouse and refund initiated.",
          bgColor: "#F0FDFA",
          textColor: "#0F766E",
          icon: <RotateCcw size={24} style={{ color: "#0F766E" }} />,
          showAction: "none"
        };
      default:
        return {
          title: "Order Update",
          desc: "Logistics update in progress.",
          bgColor: "#F8FAFC",
          textColor: "#1E293B",
          icon: <Package size={24} />,
          showAction: "none"
        };
    }
  };

  const banner = getBannerDetails();

  return (
    <div 
      className="order-status-banner" 
      style={{ 
        backgroundColor: banner.bgColor, 
        color: banner.textColor,
        borderColor: banner.textColor + "33" 
      }}
    >
      <div className="banner-left-content">
        <div className="banner-icon-wrapper">{banner.icon}</div>
        <div className="banner-text-block">
          <h3 className="banner-status-title">{banner.title}</h3>
          <p className="banner-status-desc">{banner.desc}</p>
        </div>
      </div>
      {banner.showAction === "cancel" && (
        <button 
          className="banner-action-btn cancel-btn"
          onClick={onCancelEntireOrder}
          disabled={simulating}
        >
          Cancel Entire Order
        </button>
      )}
      {banner.showAction === "return" && (
        <button 
          className="banner-action-btn return-btn"
          onClick={onReturnEntireOrder}
          disabled={simulating}
        >
          Return Entire Order
        </button>
      )}
    </div>
  );
}
