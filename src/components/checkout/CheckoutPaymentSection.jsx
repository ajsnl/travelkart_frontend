import React from "react";
import { Banknote, CreditCard, ShieldCheck, Wallet, Info } from "lucide-react";
import { toast } from "react-toastify";

export default function CheckoutPaymentSection({ 
  paymentMethod, 
  setPaymentMethod 
}) {

  const handleDisabledClick = (message) => {
    toast.info(message);
  };

  const paymentOptions = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard size={24} />,
      status: "coming",
      message: "Credit/Debit Card coming soon!",
    },
    {
      id: "upi",
      name: "UPI Unified",
      icon: <ShieldCheck size={24} />,
      status: "coming",
      message: "UPI Unified payment method will be implemented in the future!",
    },
    {
      id: "wallet",
      name: "Travel Wallet",
      icon: <Wallet size={24} />,
      status: "coming",
      message: "Travel Wallet payment method will be implemented in the future!",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: <Banknote size={24} />,
      status: "active",
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
          const isDisabled = option.status === "coming";

          return (
            <div
              key={option.id}
              className={`checkout-payment-method-card 
                ${isSelected ? "selected" : ""} 
                ${isDisabled ? "disabled" : ""}
              `}
              onClick={() => {
                if (isDisabled) {
                  handleDisabledClick(option.message);
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
                  option.status === "active" ? "active" : "coming"
                }`}
              >
                {option.status === "active" ? "Active" : "Coming Soon"}
              </span>
            </div>
          );
        })}
      </div>

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