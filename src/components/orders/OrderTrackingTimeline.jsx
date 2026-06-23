import React from "react";
import { Check, Sliders, Truck, Package } from "lucide-react";

export default function OrderTrackingTimeline({ order, createdDateStr, deliveredDate }) {
  const isCancelled = order.status === "cancelled";
  const isReturned = order.status === "returned" || order.status === "return_requested";

  if (isCancelled || isReturned) return null;

  // Map status names to linear steps index
  const statusLevels = {
    "processing": 1,
    "shipped": 2,
    "out_for_delivery": 2,
    "delivered": 3
  };
  const currentLevel = statusLevels[order.status] ?? 0;

  const getStepClass = (stepIdx, stepName) => {
    if (currentLevel > stepIdx) return "completed";
    if (currentLevel === stepIdx) return `active ${stepName}-stage`;
    return "";
  };

  const getProgressBarWidth = () => {
    if (currentLevel <= 0) return "0%";
    if (currentLevel === 1) return "33.33%";
    if (currentLevel === 2) return "66.66%";
    return "100%";
  };

  return (
    <div className="timeline-section">
      <div className="timeline-tracker">
        <div className="timeline-bar-bg">
          <div className="timeline-bar-fill" style={{ width: getProgressBarWidth() }}></div>
        </div>

        {/* Step 1: Confirmed */}
        <div className={`timeline-step ${getStepClass(0, "confirmed")}`}>
          <div className="step-icon-container">
            <Check size={20} />
          </div>
          <span className="step-label">CONFIRMED</span>
          <span className="step-time">{createdDateStr}</span>
        </div>

        {/* Step 2: Processing */}
        <div className={`timeline-step ${getStepClass(1, "processing")}`}>
          <div className="step-icon-container">
            <Sliders size={20} />
          </div>
          <span className="step-label">PROCESSING</span>
          <span className="step-time">
            {currentLevel === 1 ? "Current State" : currentLevel > 1 ? "Completed" : "Upcoming"}
          </span>
        </div>

        {/* Step 3: Shipped */}
        <div className={`timeline-step ${getStepClass(2, "shipped")}`}>
          <div className="step-icon-container">
            <Truck size={20} />
          </div>
          <span className="step-label">SHIPPED</span>
          <span className="step-time">
            {currentLevel < 2 ? "Upcoming" : order.status === "out_for_delivery" ? "Out for Delivery" : currentLevel === 2 ? "Current State" : "Completed"}
          </span>
        </div>

        {/* Step 4: Delivered */}
        <div className={`timeline-step ${getStepClass(3, "delivered")}`}>
          <div className="step-icon-container">
            <Package size={20} />
          </div>
          <span className="step-label">DELIVERED</span>
          <span className="step-time">
            {currentLevel === 3 ? `Delivered on ${deliveredDate}` : "Upcoming"}
          </span>
        </div>
      </div>
    </div>
  );
}
