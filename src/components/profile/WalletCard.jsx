import React from "react";
import { Wallet } from "lucide-react";
import { toast } from "react-toastify";

const WalletCard = () => {
  // Configured default balance context parameters
  const activeBalanceValue = 500.00;

  return (
    <div className="figma-wallet-gradient-card font-inter">
      <div className="wallet-card-internal-flex">
        <div className="wallet-balance-text-stack">
          <span className="wallet-header-tag uppercase">Wallet Balance</span>
          <h2 className="wallet-amount-value-display">
            ₹{activeBalanceValue.toFixed(2)}
          </h2>
          <span className="wallet-info-subtext">Available for your next Orders</span>
        </div>
        <div className="wallet-icon-container-box">
          <Wallet size={20} />
        </div>
      </div>

      <div className="wallet-interactive-actions-row">
        <button className="wallet-action-trigger-btn font-inter" onClick={() => toast.info("Redirecting to secure transaction gateway...")}>
          Add Funds
        </button>
        <button className="wallet-action-trigger-btn font-inter" onClick={() => toast.info("Fetching historical account details...")}>
          History
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
