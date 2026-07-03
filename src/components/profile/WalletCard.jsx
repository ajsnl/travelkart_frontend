import React, { useState, useEffect } from "react";
import { Wallet, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "react-toastify";
import { fetchWalletDetails, addWalletMoney, verifyWalletPayment } from "../../services/walletService";

const WalletCard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters State
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const loadWallet = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await fetchWalletDetails(filters);
      setBalance(parseFloat(res.data.balance));
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
      toast.error("Failed to load wallet balance.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch transactions whenever filters change
  useEffect(() => {
    loadWallet({
      type: filterType,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
  }, [filterType, filterStartDate, filterEndDate]);

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
            toast.success("Funds added successfully! 💵");
            setBalance(parseFloat(verifyRes.data.balance));
            setShowAddModal(false);
            setAmount("");
            loadWallet(); // refresh transactions list
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
          <button className="wallet-action-trigger-btn font-inter" onClick={() => setShowHistoryModal(true)}>
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
                  required
                  disabled={submitting}
                />
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

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-content" style={{ maxWidth: "500px" }}>
            <div className="wallet-modal-header">
              <h3 className="wallet-modal-title font-plus-jakarta">Wallet Transaction History</h3>
              <button className="wallet-modal-close-btn" onClick={() => setShowHistoryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="wallet-modal-body">
              {/* FILTER CONTROLS */}
              <div className="wallet-filters-row font-inter" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: "8px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none", backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">All Types</option>
                    <option value="CREDIT">Credits</option>
                    <option value="DEBIT">Debits</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{ padding: "7px 8px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none", backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748B" }}>To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{ padding: "7px 8px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none", backgroundColor: "#FFFFFF" }}
                  />
                </div>
                {(filterType || filterStartDate || filterEndDate) && (
                  <button
                    onClick={() => { setFilterType(""); setFilterStartDate(""); setFilterEndDate(""); }}
                    style={{ alignSelf: "flex-end", padding: "8px 12px", borderRadius: "8px", border: "none", backgroundColor: "#F1F5F9", color: "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer", height: "35px" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="wallet-transactions-list animate-fade-in">
                {transactions.length === 0 ? (
                  <div className="wallet-no-transactions font-inter">
                    No transactions found yet. Add funds or place an order to get started!
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className={`wallet-transaction-item ${t.transaction_type === "CREDIT" ? "credit" : "debit"}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: t.transaction_type === "CREDIT" ? "#E8F5E9" : "#FFEBEE",
                          color: t.transaction_type === "CREDIT" ? "#2E7D32" : "#C62828",
                          flexShrink: 0
                        }}>
                          {t.transaction_type === "CREDIT" ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div className="wallet-txn-meta">
                          <span className="wallet-txn-reason font-inter">{t.reason}</span>
                          <span className="wallet-txn-date font-inter">
                            {new Date(t.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="wallet-txn-amount-stack">
                        <span className={`wallet-txn-amount font-inter ${t.transaction_type === "CREDIT" ? "credit" : "debit"}`}>
                          {t.transaction_type === "CREDIT" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`wallet-badge ${t.transaction_type === "CREDIT" ? "credit" : "debit"} font-inter`}>
                          {t.transaction_type === "CREDIT" ? "Added / Refund" : "Paid"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletCard;

