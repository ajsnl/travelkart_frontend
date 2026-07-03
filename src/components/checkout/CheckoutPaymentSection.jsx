import React from "react";
import { Banknote, CreditCard, ShieldCheck, Wallet, Info } from "lucide-react";
import { toast } from "react-toastify";

export default function CheckoutPaymentSection({ 
  paymentMethod, 
  setPaymentMethod,
  walletBalance = 0,
  finalTotal = 0
}) {

  const handleDisabledClick = (message) => {
    toast.info(message);
  };

  const isInsufficient = walletBalance < finalTotal;

  const paymentOptions = [
    {
      id: "razorpay",
      name: "Razorpay (Cards/UPI/Net)",
      icon: <CreditCard size={24} />,
      status: "active",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: <Banknote size={24} />,
      status: "active",
    },
    {
      id: "wallet",
      name: `Travel Wallet`,
      icon: <Wallet size={24} />,
      status: isInsufficient ? "insufficient" : "active",
      message: isInsufficient 
        ? `Insufficient wallet balance. Your balance is ₹${walletBalance.toFixed(2)}, but the order total is ₹${finalTotal.toFixed(2)}.` 
        : null,
    },
  ];

  return (
    <section className="checkout-section-card">
      
      {/* Header */}
      <div className="checkout-section-header">
        <h2 className="checkout-section-title">
          <Banknote size={20} />
          <span>Payment Method</span>
        </h2>
      </div>

      {/* Payment Options */}
      <div className="checkout-payment-methods-grid">
        {paymentOptions.map((option) => {
          const isSelected = paymentMethod === option.id;
          const isDisabled = option.status === "coming" || option.status === "insufficient";

          return (
            <div
              key={option.id}
              className={`checkout-payment-method-card 
                ${isSelected ? "selected" : ""} 
                ${isDisabled ? "disabled" : ""}
              `}
              onClick={() => {
                if (option.status === "coming") {
                  handleDisabledClick(option.message);
                } else if (option.status === "insufficient") {
                  toast.error(option.message);
                } else {
                  setPaymentMethod(option.id);
                }
              }}
            >
              <div className="checkout-payment-method-icon">
                {option.icon}
              </div>

              <span className="checkout-payment-method-name">
                {option.name}
              </span>

              <span
                className={`payment-badge ${
                  option.status === "active" ? "active" : option.status === "insufficient" ? "insufficient" : "coming"
                }`}
              >
                {option.status === "active" 
                  ? "Active" 
                  : option.status === "insufficient" 
                    ? `₹${walletBalance.toFixed(2)}` 
                    : "Coming Soon"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Wallet Info */}
      {paymentMethod === "wallet" && (
        <div className="checkout-payment-details-form">
          <div className="checkout-wallet-info-box">
            <div className="checkout-wallet-balance-row">
              <h4>Wallet Balance</h4>
              <span className="checkout-wallet-amount">
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>
            <div className="checkout-wallet-status-msg success">
              <ShieldCheck size={16} />
              <span>
                Sufficient balance! ₹{finalTotal.toFixed(2)} will be debited from your wallet.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Info */}
      {paymentMethod === "razorpay" && (
        <div className="checkout-payment-details-form">
          <div className="checkout-cod-info" style={{ backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
            <Info size={16} style={{ color: "#2563eb" }} />
            <span>
              Secure online payment via Razorpay. Supports Credit/Debit Cards, UPI, Netbanking, and Wallets. Running in Test Mode; no real money is charged.
            </span>
          </div>
        </div>
      )}

      {/* COD Info */}
      {paymentMethod === "cod" && (
        <div className="checkout-payment-details-form">
          <div className="checkout-cod-info">
            <Info size={16} />
            <span>
              Cash on Delivery is available. Please keep cash or QR payment ready at your shipping address during delivery. Delivery takes approximately 3–5 business days.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
