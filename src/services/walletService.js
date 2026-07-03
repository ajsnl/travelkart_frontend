import api from "../api/axios";

// Fetch wallet details (balance and transaction history)
export const fetchWalletDetails = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  
  const queryStr = params.toString();
  return api.get(`wallet/${queryStr ? `?${queryStr}` : ""}`);
};

// Initiate adding money to the wallet
export const addWalletMoney = (amount) => {
  return api.post("wallet/add/", { amount });
};

// Verify the Razorpay payment signature
export const verifyWalletPayment = (razorpay_payment_id, razorpay_order_id, razorpay_signature) => {
  return api.post("wallet/verify/", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
  });
};
