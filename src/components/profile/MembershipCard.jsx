import React from "react";
import { Star, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const MembershipCard = ({ user }) => {
  if (!user) return null;
  const isGold = user.is_gold_member;

  return (
    <div className="figma-membership-card">
      <div className="membership-card-header-row">
        <span className="membership-header-tag uppercase">Membership Status</span>
        <Star size={16} fill={isGold ? "#FBBF24" : "#FFFFFF"} className="membership-header-star-icon" />
      </div>

      <h2 className="membership-tier-title-display font-plus-jakarta">
        {isGold ? "Gold" : "Regular"}
      </h2>

      {isGold ? (
        // Gold Member view: Show active benefits
        <div className="membership-active-benefits-stack">
          <span className="benefits-label uppercase">Active Benefits</span>
          <ul className="benefits-list-container">
            <li className="benefit-item-node">
              <span className="benefit-check-bullet" style={{ color: "#34D399" }}>✓</span> 
              <span>Free Delivery</span>
            </li>
            <li className="benefit-item-node">
              <span className="benefit-check-bullet" style={{ color: "#34D399" }}>✓</span> 
              <span>24/7 Digital Concierge</span>
            </li>
            <li className="benefit-item-node">
              <span className="benefit-check-bullet" style={{ color: "#34D399" }}>✓</span> 
              <span>Priority Shipping</span>
            </li>
          </ul>
        </div>
      ) : (
        // Regular user view: Prompt to buy Gold membership
        <div className="membership-active-benefits-stack">
          <span className="benefits-label uppercase" style={{ color: "#FCA5A5" }}>Locked Gold Benefits</span>
          <ul className="benefits-list-container" style={{ opacity: 0.6 }}>
            <li className="benefit-item-node">
              <Lock size={12} style={{ color: "#F87171" }} /> 
              <span style={{ textDecoration: "line-through" }}>Free Delivery</span>
            </li>
            <li className="benefit-item-node">
              <Lock size={12} style={{ color: "#F87171" }} /> 
              <span style={{ textDecoration: "line-through" }}>24/7 Digital Concierge</span>
            </li>
            <li className="benefit-item-node">
              <Lock size={12} style={{ color: "#F87171" }} /> 
              <span style={{ textDecoration: "line-through" }}>Priority Shipping</span>
            </li>
          </ul>
        </div>
      )}

      {isGold ? (
        <button 
          className="membership-view-benefits-btn font-inter" 
          onClick={() => toast.info("Redirecting to your benefits console...")}
        >
          View Benefits
        </button>
      ) : (
        <button 
          className="membership-view-benefits-btn font-inter" 
          style={{ backgroundColor: "var(--accent-orange)", color: "#FFFFFF" }}
          onClick={() => toast.info("Redirecting to checkout to upgrade to Gold membership...")}
        >
          Buy Gold
        </button>
      )}
    </div>
  );
};

export default MembershipCard;
