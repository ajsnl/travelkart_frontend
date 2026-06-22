import React from "react";
import { MapPin, CheckCircle2, Plus, Phone } from "lucide-react";

export default function CheckoutAddressSection({
  addresses,
  selectedAddress,
  setSelectedAddress,
  loadingAddresses,
  setEditAddressData,
  setShowAddressForm,
  handleDeleteAddress,
  handleSetDefaultAddr
}) {
  return (
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
  );
}
