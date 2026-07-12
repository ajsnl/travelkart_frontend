import React, { useState } from "react";
import { Star, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { goldMembership, verifyGoldMembership } from "../../services/authService";

const MembershipCard = ({ user, refreshUser }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  const isGold = user.is_gold_member;

  // Load Razorpay SDK Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyGold = async () => {
    try {
      setSubmitting(true);

      // 1. Get Razorpay Order ID from backend
      const res = await goldMembership();
      const paymentData = res.data;

      // 2. Load SDK script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setSubmitting(false);
        return;
      }

      // 3. Configure Checkout Options
      const options = {
        key: paymentData.razorpay_key_id,
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency,
        name: "TravelKart Gold",
        description: "Upgrade to Gold Membership",
        order_id: paymentData.razorpay_order_id,
        handler: async function (response) {
          try {
            setSubmitting(true);
            await verifyGoldMembership(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            toast.success("Welcome to Gold Club! 🌟 Upgraded successfully.");
            if (refreshUser) {
              await refreshUser();
            }
          } catch (err) {
            console.error("Gold membership signature verification failed:", err);
            toast.error(err.response?.data?.error || "Verification failed. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
        theme: {
          color: "#032070"
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Gold upgrade failed:", err);
      const msg = err.response?.data?.error || "Failed to initiate payment gateway.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

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
        <>
          <div className="gold-status-badge">
            <Star size={14} fill="#FBBF24" style={{ color: "#FBBF24" }} />
            <span>Gold Status Active</span>
          </div>
          <button 
            className="membership-view-benefits-btn font-inter" 
            onClick={() => navigate("/shop")}
          >
            Explore Collections
          </button>
        </>
      ) : (
        <button 
          className="membership-view-benefits-btn font-inter" 
          style={{ backgroundColor: "var(--accent-orange)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          onClick={handleBuyGold}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Processing...
            </>
          ) : (
            "Buy Gold"
          )}
        </button>
      )}
    </div>
  );
};

export default MembershipCard;


