import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
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
import CheckoutAddressSection from "../components/checkout/CheckoutAddressSection";
import CheckoutPaymentSection from "../components/checkout/CheckoutPaymentSection";
import CheckoutOrderSummarySection from "../components/checkout/CheckoutOrderSummarySection";
import CheckoutSuccessView from "../components/checkout/CheckoutSuccessView";
import { placeOrder } from "../services/orderService";
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
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Checkout Actions
  const [processing, setProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

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

  // Shipping logic: Free for gold members OR if order subtotal (totalPrice) > 1500
  const isGold = profile?.is_gold_member || false;
  const rawSubtotal = totalPrice; // Net subtotal
  const originalSubtotal = totalPrice + discountTotal; // Subtotal before discounts
  const shippingFee = (isGold || rawSubtotal > 1500) ? 0 : 99;
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

      // Place order via backend API
      const response = await placeOrder(selectedAddress.id, paymentMethod.toUpperCase());
      const orderData = response.data;


      setPlacedOrderDetails({
        trackingId: orderData.tracking_id,
        items: orderData.items,
        subtotal: parseFloat(orderData.subtotal),
        shipping: parseFloat(orderData.shipping_fee),
        discount: parseFloat(orderData.discount),
        total: parseFloat(orderData.total_price),
        paymentMethod: orderData.payment_method,
        address: {
          full_name: orderData.full_name,
          address_line: orderData.address_line,
          city: orderData.city,
          state: orderData.state,
          pincode: orderData.pincode,
          country: orderData.country,
          phone: orderData.phone,
        },
        deliveryEstimate: orderData.delivery_estimate
      });

       // Clear user cart locally (backend cart is cleared inside placeOrder API)
      await dispatch(clearUserCart()).unwrap();

      setIsSuccess(true);
      toast.success("Order Placed Successfully! ✈️");
    } catch (err) {
      console.error("Order completion failed:", err);
      const backendError = err.response?.data?.error || err.response?.data?.detail || "An error occurred during order confirmation.";
      toast.error(backendError);toast.error("An error occurred during order confirmation.");
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
      <CheckoutSuccessView
        placedOrderDetails={placedOrderDetails}
        userEmail={userEmail}
        navigate={navigate}
      />
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
              <CheckoutAddressSection
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                loadingAddresses={loadingAddresses}
                setEditAddressData={setEditAddressData}
                setShowAddressForm={setShowAddressForm}
                handleDeleteAddress={handleDeleteAddress}
                handleSetDefaultAddr={handleSetDefaultAddr}
              />

              <CheckoutPaymentSection 
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />
            </div>

            {/* Right Side: Order summary & product review */}
            <CheckoutOrderSummarySection
              items={items}
              totalItems={totalItems}
              originalSubtotal={originalSubtotal}
              discountTotal={discountTotal}
              shippingFee={shippingFee}
              taxAmount={taxAmount}
              isGold={isGold}
              finalTotal={finalTotal}
              isCheckoutRestricted={isCheckoutRestricted}
              processing={processing}
              selectedAddress={selectedAddress}
              handlePlaceOrder={handlePlaceOrder}
            />

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
