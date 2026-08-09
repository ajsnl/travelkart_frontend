import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, X } from "lucide-react";
import { toast } from "react-toastify";
import { fetchWalletDetails, addWalletMoney, verifyWalletPayment } from "../../services/walletService";

const WalletCard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await fetchWalletDetails();
      setBalance(parseFloat(res.data.balance));
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
      toast.error("Failed to load wallet balance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

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

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

      if (cleanAmount > 500000) {
      toast.error("The maximum deposit limit per transaction is ₹5,00,000 (5 Lakhs). Please enter an amount up to ₹5,00,000.");
      return;
    }

    try {
      setSubmitting(true);
      // 1. Get Razorpay Order ID from backend
      const res = await addWalletMoney(cleanAmount);
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
        name: "TravelKart Wallet",
        description: "Add funds to travel wallet",
        order_id: paymentData.razorpay_order_id,
        handler: async function (response) {
          try {
            setSubmitting(true);
            const verifyRes = await verifyWalletPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            toast.success("Funds added successfully! ");
            setBalance(parseFloat(verifyRes.data.balance));
            setShowAddModal(false);
            setAmount("");
            loadWallet(); // refresh balance
          } catch (err) {
            console.error("Wallet signature verification failed:", err);
            toast.error("Verification failed. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
        theme: {
          color: "#0284C7"
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
      console.error("Add money failed:", err);
      const msg = err.response?.data?.error || "Failed to initiate payment gateway.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <>
      <div className="figma-wallet-gradient-card font-inter">
        <div className="wallet-card-internal-flex">
          <div className="wallet-balance-text-stack">
            <span className="wallet-header-tag uppercase">Wallet Balance</span>
            <h2 className="wallet-amount-value-display">
              ₹{loading ? "..." : balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
            <span className="wallet-info-subtext">Available for your next Orders</span>
          </div>
          <div className="wallet-floating-icon-box">
            <Wallet size={20} />
          </div>
        </div>

        <div className="wallet-interactive-actions-row">
          <button className="wallet-action-trigger-btn font-inter" onClick={() => setShowAddModal(true)}>
            Add Funds
          </button>
          <button className="wallet-action-trigger-btn font-inter" onClick={() => navigate("/wallet-history")}>
            History
          </button>
        </div>
      </div>

      {/* ADD FUNDS MODAL */}
      {showAddModal && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-content">
            <div className="wallet-modal-header">
              <h3 className="wallet-modal-title">Add Money to Wallet</h3>
              <button className="wallet-modal-close-btn" onClick={() => { setShowAddModal(false); setAmount(""); }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddFunds} className="wallet-modal-body">
              <div className="wallet-input-container">
                <label className="wallet-input-label">Enter Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="wallet-input-field font-inter"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="500000"
                  required
                  disabled={submitting}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Maximum limit per transaction: ₹5,00,000 (5 Lakhs)
                </span>
              </div>
              <div className="wallet-quick-amounts">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`wallet-quick-amount-btn ${parseFloat(amount) === q ? "active" : ""}`}
                    onClick={() => setAmount(q.toString())}
                    disabled={submitting}
                  >
                    + ₹{q}
                  </button>
                ))}
              </div>
              <button type="submit" className="wallet-modal-submit-btn font-inter" disabled={submitting || !amount}>
                {submitting ? "Processing Payment..." : "Pay Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletCard;

