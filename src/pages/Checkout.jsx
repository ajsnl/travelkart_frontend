import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  CheckCircle2,
  Trash2,
  Plus,
  Lock,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Truck,
  CheckCircle,
  Info,
  ShieldCheck,
  Phone,
  Banknote,
  Loader2,
  CreditCard,
  Wallet
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCart, clearUserCart } from "../features/cart/cartSlice";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getProfile
} from "../services/authService";
import AddressForm from "../components/profile/AddressForm";
import { toast } from "react-toastify";
import { useCustomDialog } from "../components/CustomDialog";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { showConfirm, showAlert } = useCustomDialog();

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  // User Profile details (Gold member & Wallet balance status)
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Payment states
  const paymentMethod = "cod";

  // Checkout Actions
  const [processing, setProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Static Wallet Balance (aligned with WalletCard.jsx)
  const walletBalance = 500.00;

  // Initial Fetches
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await getAddresses();
      
      // Sort default address first
      const defaultAddress = res.data.find(addr => addr.is_default);
      const otherAddresses = res.data.filter(addr => !addr.is_default);
      const sortedAddresses = defaultAddress
        ? [defaultAddress, ...otherAddresses]
        : otherAddresses;
        
      setAddresses(sortedAddresses);

      // Default select
      const defAddr = res.data.find((addr) => addr.is_default);
      if (defAddr) {
        setSelectedAddress(defAddr);
      } else if (res.data.length > 0 && !selectedAddress) {
        setSelectedAddress(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      toast.error("Failed to fetch address details.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    dispatch(getCart());
    fetchAddresses();
    fetchProfile();
  }, [dispatch]);

  // Handle Add/Edit address saves
  const handleSaveAddress = async (formData) => {
    try {
      if (editAddressData) {
        const res = await updateAddress(editAddressData.id, formData);
        toast.success("Address updated successfully!");
        if (selectedAddress?.id === editAddressData.id) {
          setSelectedAddress(res.data);
        }
      } else {
        const res = await addAddress(formData);
        toast.success("Address added successfully!");
        if (!selectedAddress || res.data.is_default) {
          setSelectedAddress(res.data);
        }
      }
      setShowAddressForm(false);
      setEditAddressData(null);
      fetchAddresses();
    } catch (err) {
      console.error("Address submission error:", err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : "Failed to save address.";
      toast.error(msg);
    }
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    const confirmed = await showConfirm("Are you sure you want to delete this address?", "Delete Address", "error");
    if (confirmed) {
      try {
        await deleteAddress(id);
        toast.success("Address deleted.");
        if (selectedAddress?.id === id) {
          setSelectedAddress(null);
        }
        fetchAddresses();
      } catch (err) {
        console.error("Error deleting address:", err);
        const backendError = err.response?.data?.error || "Failed to delete address.";
        toast.error(backendError);
      }
    }
  };

  const handleSetDefaultAddr = async (id, e) => {
    e.stopPropagation();
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated.");
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default address:", err);
      toast.error("Failed to set default address.");
    }
  };

  // Cart values calculations
  const items = cart?.items || [];
  const totalItems = cart?.total_items || 0;
  const totalPrice = cart?.total_price || 0;
  const discountTotal = cart?.discount_total || 0;
  const isCheckoutRestricted = cart?.is_checkout_restricted || false;

  // Shipping logic: Free for gold members OR if order subtotal (totalPrice) > 500
  const isGold = profile?.is_gold_member || false;
  const rawSubtotal = totalPrice; // Net subtotal
  const originalSubtotal = totalPrice + discountTotal; // Subtotal before discounts
  const shippingFee = (isGold || rawSubtotal > 500) ? 0 : 99;
  const taxAmount = rawSubtotal * 0.18; // 18% GST (Included)
  const finalTotal = rawSubtotal + shippingFee;

  // Validation
  const validateForm = () => {
    if (!selectedAddress) {
      toast.warning("Please select or add a shipping address.");
      return false;
    }
    return true;
  };

  // Process Checkout Order Submit
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const confirmed = await showConfirm(
      `Confirm placing this order for ₹${finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}?`,
      "Place Order",
      "info"
    );

    if (!confirmed) return;

    try {
      setProcessing(true);

      // Simulate a small delay for premium processing look
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const trackingId = "TK-" + Math.floor(100000 + Math.random() * 900000);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4); // 4 days estimate

      setPlacedOrderDetails({
        trackingId,
        items: [...items],
        subtotal: rawSubtotal,
        shipping: shippingFee,
        discount: discountTotal,
        total: finalTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        address: { ...selectedAddress },
        deliveryEstimate: deliveryDate.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      });

      // Clear user cart on backend
      await dispatch(clearUserCart()).unwrap();

      setIsSuccess(true);
      toast.success("Order Placed Successfully! ✈️");
    } catch (err) {
      console.error("Order completion failed:", err);
      toast.error("An error occurred during order confirmation.");
    } finally {
      setProcessing(false);
    }
  };

  // Redirect if cart is empty and not placed successfully
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !isSuccess && !processing && !placedOrderDetails) {
      // Cart is empty, navigate to shop after warning if they manually typed /checkout
      const checkCartEmpty = async () => {
        const res = await dispatch(getCart()).unwrap();
        if ((res.items || []).length === 0) {
          toast.info("Your cart is empty. Add products to proceed.");
          navigate("/shop");
        }
      };
      checkCartEmpty();
    }
  }, [items.length, isSuccess, processing, placedOrderDetails, cartLoading, navigate, dispatch]);

  if (isSuccess && placedOrderDetails) {
    const userEmail = profile?.email || "alex.travelle@example.com";
    return (
      <div className="checkout-success-viewport">
        <Navbar />
        <main className="checkout-success-content font-inter">
          
          {/* Confirmed Icon & Title Header */}
          <div className="conf-header">
            <div className="conf-icon-wrapper">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="conf-title">Order Confirmed</h1>
            <p className="conf-subtitle">
              Thank you for your purchase. We've sent a confirmation email to <span className="conf-email-highlight">{userEmail}</span>.
            </p>
          </div>

          {/* Two Columns Grid */}
          <div className="conf-main-grid">
            
            {/* Left Column: Order details & items summary */}
            <div className="conf-left-column">
              <div className="conf-card">
                <div className="conf-order-meta-row">
                  <div className="conf-meta-block">
                    <span className="conf-meta-label">Order Number</span>
                    <span className="conf-meta-value">{placedOrderDetails.trackingId}</span>
                  </div>
                  <div className="conf-meta-block" style={{ textAlign: "right" }}>
                    <span className="conf-meta-label">Estimated Delivery</span>
                    <span className="conf-meta-value">{placedOrderDetails.deliveryEstimate}</span>
                  </div>
                </div>

                <h3 className="conf-section-heading">ORDER SUMMARY</h3>
                
                <div className="conf-items-list">
                  {placedOrderDetails.items.map((item) => {
                    const variant = item.variant;
                    const price = variant?.offer_price ? parseFloat(variant.offer_price) : parseFloat(variant?.price || 0);
                    const itemTotal = price * item.quantity;
                    return (
                      <div key={item.id} className="conf-item-row">
                        <img 
                          src={variant?.image_url} 
                          alt={variant?.product_name || "Variant"} 
                          className="conf-item-img" 
                        />
                        <div className="conf-item-details">
                          <div className="conf-item-name">{variant?.product_name}</div>
                          <div className="conf-item-attributes">
                            {variant?.product_brand && <span>by {variant.product_brand} • </span>}
                            {variant?.attributes && Object.entries(variant.attributes).map(([k, v]) => (
                              <span key={k}>{k}: {v} • </span>
                            ))}
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <div className="conf-item-price" style={{ color: "#00236F", fontWeight: "700" }}>
                            ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Shipping Info & Grand Totals */}
            <div className="conf-right-column">
              
              {/* Shipping Address Box */}
              <div className="conf-info-card">
                <h3 className="conf-info-card-title">
                  <Truck size={15} style={{ color: "#00236F" }} />
                  <span>SHIPPING ADDRESS</span>
                </h3>
                <p className="conf-info-card-text">
                  <strong style={{ display: "block", marginBottom: "4px" }}>{placedOrderDetails.address.full_name}</strong>
                  {placedOrderDetails.address.address_line}<br />
                  {placedOrderDetails.address.city}, {placedOrderDetails.address.state} - {placedOrderDetails.address.pincode}<br />
                  {placedOrderDetails.address.country}
                </p>
              </div>

              {/* Order Total Box */}
              <div className="conf-total-card">
                <span className="conf-total-card-label">ORDER TOTAL</span>
                <div className="conf-total-rows">
                  <div className="conf-total-row">
                    <span>Subtotal</span>
                    <span>₹{(placedOrderDetails.subtotal + placedOrderDetails.discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {placedOrderDetails.discount > 0 && (
                    <div className="conf-total-row text-discount">
                      <span>Shipping Discount</span>
                      <span>-₹{placedOrderDetails.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="conf-total-row">
                    <span>Shipping</span>
                    <span>{placedOrderDetails.shipping === 0 ? "Free" : `₹${placedOrderDetails.shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="conf-total-row">
                    <span>Estimated Tax</span>
                    <span>₹{(placedOrderDetails.subtotal * 0.18).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <hr className="conf-total-divider" />

                <div className="conf-total-row grand-total-row">
                  <span>Grand Total</span>
                  <span className="conf-grand-total">
                    ₹{placedOrderDetails.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="conf-actions-stack">
            <button 
              className="conf-btn-primary" 
              onClick={() => toast.info("Order tracking details will be available soon!")}
            >
              Track Order
            </button>
            <button 
              className="conf-btn-secondary" 
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </button>
          </div>

          {/* Concierge Assistance */}
          <div className="conf-assistance-box">
            <p className="conf-assistance-text">Need assistance ?</p>
            <p className="conf-assistance-subtext">Our concierge team is available 24/7 to help you.</p>
            <div className="conf-assistance-links">
              <a href="mailto:support@travelkart.com" className="conf-assistance-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>📧 Email Support</span>
              </a>
              <span style={{ color: "#CBD5E1" }}>|</span>
              <button 
                onClick={() => toast.info("Redirecting to concierge help desk...")} 
                className="conf-assistance-link-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>📖 Help Center</span>
              </button>
            </div>
          </div>

        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page-viewport">
      <Navbar />

      <main className="checkout-main-content font-inter">
        {/* Header Hero Section */}
        <header className="checkout-header">
          <h1 className="checkout-title">Checkout Details</h1>
          <p className="checkout-subtitle">
            Configure shipping logistics and select secure settlement framework.
          </p>
        </header>

        {cartLoading && items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
            <Loader2 className="animate-spin" size={40} style={{ color: "#00236F", marginBottom: "16px" }} />
            <p style={{ color: "#64748B" }}>Retrieving your cargo details...</p>
          </div>
        ) : (
          <div className="checkout-grid-layout">
            
            {/* Left Side: Address settings & payment details */}
            <div className="checkout-main-column">
              
              {/* Address Settings Section */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title">
                    <MapPin size={20} />
                    <span>Shipping Address</span>
                  </h2>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => {
                        setEditAddressData(null);
                        setShowAddressForm(true);
                      }}
                      className="checkout-addr-action-btn"
                      style={{ color: "#00236F", fontWeight: "700" }}
                    >
                      <Plus size={14} />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {loadingAddresses ? (
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Loading saved addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="checkout-no-addresses">
                    <MapPin size={32} style={{ opacity: 0.5, marginBottom: "8px" }} />
                    <p style={{ margin: "0 0 12px 0" }}>No saved addresses found in your travel logs.</p>
                    <button
                      onClick={() => {
                        setEditAddressData(null);
                        setShowAddressForm(true);
                      }}
                      className="checkout-add-addr-card-btn"
                    >
                      <Plus size={16} />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="checkout-address-grid">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id;
                      return (
                        <div
                          key={addr.id}
                          className={`checkout-address-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedAddress(addr)}
                        >
                          <div className="checkout-address-header">
                            <div className="checkout-address-name">
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {addr.full_name}
                                {addr.is_default && (
                                  <span className="address-badge-default" style={{ 
                                    fontSize: "10px", 
                                    padding: "2px 6px", 
                                    backgroundColor: "rgba(0, 35, 111, 0.08)", 
                                    color: "#00236F", 
                                    borderRadius: "4px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                  }}>
                                    Default
                                  </span>
                                )}
                              </span>
                              <span className="checkout-address-phone">
                                <Phone size={11} style={{ display: "inline", marginRight: "3px" }} />
                                {addr.phone}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 size={16} className="checkout-address-check" />
                            )}
                          </div>
                          
                          <div className="checkout-address-body">
                            {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                              {addr.country}
                            </div>
                          </div>

                          <div className="checkout-address-actions">
                            {!addr.is_default && (
                              <button
                                onClick={(e) => handleSetDefaultAddr(addr.id, e)}
                                className="checkout-addr-action-btn"
                                title="Make default shipping address"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditAddressData(addr);
                                setShowAddressForm(true);
                              }}
                              className="checkout-addr-action-btn"
                            >
                              Edit
                            </button>
                            {!addr.is_default && (
                              <button
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="checkout-addr-action-btn delete"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Payment Method Settings Section */}
              <section className="checkout-section-card">
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title">
                    <Banknote size={20} />
                    <span>Payment Method</span>
                  </h2>
                </div>

                <div className="checkout-payment-methods-grid">
                  <div
                    className="checkout-payment-method-card inactive"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                    onClick={() => toast.info("Credit/Debit Card payment method will be implemented in the future!")}
                  >
                    <CreditCard className="checkout-payment-method-icon" size={24} />
                    <span className="checkout-payment-method-name">Credit/Debit Card</span>
                    <span style={{ fontSize: "9px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>Coming Soon</span>
                  </div>

                  <div
                    className="checkout-payment-method-card inactive"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                    onClick={() => toast.info("UPI Unified payment method will be implemented in the future!")}
                  >
                    <ShieldCheck className="checkout-payment-method-icon" size={24} />
                    <span className="checkout-payment-method-name">UPI Unified</span>
                    <span style={{ fontSize: "9px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>Coming Soon</span>
                  </div>

                  <div
                    className="checkout-payment-method-card inactive"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                    onClick={() => toast.info("Travel Wallet payment method will be implemented in the future!")}
                  >
                    <Wallet className="checkout-payment-method-icon" size={24} />
                    <span className="checkout-payment-method-name">Travel Wallet</span>
                    <span style={{ fontSize: "9px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>Coming Soon</span>
                  </div>

                  <div className="checkout-payment-method-card selected" style={{ cursor: "default" }}>
                    <Banknote className="checkout-payment-method-icon" size={24} />
                    <span className="checkout-payment-method-name">Cash on Delivery</span>
                    <span style={{ fontSize: "9px", color: "#10B981", fontWeight: "700", textTransform: "uppercase", marginTop: "2px" }}>Active</span>
                  </div>
                </div>

                <div className="checkout-payment-details-form">
                  <div className="checkout-cod-info">
                    <Info size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span>
                      Cash on Delivery is available. Please keep cash or QR payment ready at your shipping address during delivery. Delivery takes approximately 3-5 standard business days.
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Side: Order summary & product review */}
            <div className="checkout-summary-column">
              <div className="checkout-section-card" style={{ marginBottom: "0" }}>
                <h2 className="checkout-section-title" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "12px", marginBottom: "16px" }}>
                  Order Summary
                </h2>

                {/* Product Overview list */}
                <div className="checkout-product-list">
                  {items.map((item) => {
                    const variant = item.variant;
                    const priceToUse = variant?.offer_price ? parseFloat(variant.offer_price) : parseFloat(variant?.price || 0);
                    const itemTotal = priceToUse * item.quantity;

                    return (
                      <div key={item.id} className="checkout-product-item">
                        <div className="checkout-prod-img-wrapper">
                          <img
                            src={variant?.image_url}
                            alt={variant?.product_name || "Gear Product"}
                            className="checkout-prod-img"
                          />
                        </div>

                        <div className="checkout-prod-details">
                          <div>
                            <div className="checkout-prod-name">{variant?.product_name}</div>
                            <div className="checkout-prod-meta">
                              {variant?.product_brand && <span>by {variant.product_brand}</span>}
                              {variant?.attributes && Object.entries(variant.attributes).map(([k, v]) => (
                                <span key={k} style={{ marginLeft: "6px" }}>• {k}: {v}</span>
                              ))}
                            </div>
                          </div>

                          <div className="checkout-prod-qty-price">
                            <span className="checkout-prod-qty">Qty: {item.quantity}</span>
                            <span className="checkout-prod-price">
                              ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr className="checkout-divider" />

                {/* Calculations details */}
                <div className="checkout-breakdown-details">
                  <div className="checkout-breakdown-row">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{originalSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="checkout-breakdown-row discount">
                      <span>Gear Discounts</span>
                      <span>-₹{discountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="checkout-breakdown-row">
                    <span>Shipping Fee</span>
                    {shippingFee === 0 ? (
                      <span style={{ color: "#10B981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Truck size={14} /> FREE
                      </span>
                    ) : (
                      <span>₹{shippingFee.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="checkout-breakdown-row taxes">
                    <span>GST (18% Included)</span>
                    <span>₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {isGold && (
                    <div className="checkout-breakdown-row" style={{ color: "#B45309", fontSize: "12px", fontWeight: "600" }}>
                      <span>✪ Gold Member shipping waiver applied</span>
                    </div>
                  )}

                  <hr className="checkout-divider" style={{ margin: "8px 0" }} />

                  <div className="checkout-breakdown-row total">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button
                    disabled={
                      isCheckoutRestricted ||
                      items.length === 0 ||
                      !selectedAddress ||
                      processing
                    }
                    onClick={handlePlaceOrder}
                    className="checkout-place-order-btn"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Confirming Cargo...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Place Order</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="checkout-security-guarantee">
                    <ShieldCheck size={14} style={{ color: "#10B981" }} />
                    <span>Secure SSL Encryption. All transactions are protected.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Address Edit/Add Modal Overlay */}
      {showAddressForm && (
        <AddressForm
          initialData={editAddressData}
          onSubmit={handleSaveAddress}
          onClose={() => {
            setShowAddressForm(false);
            setEditAddressData(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
