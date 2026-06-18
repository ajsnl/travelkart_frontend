import React, { useEffect, useState } from "react";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../services/authService";
import AddressForm from "./AddressForm";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCustomDialog } from "../CustomDialog";

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showConfirm } = useCustomDialog();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAddresses();
      const defaultAddress = res.data.find(addr => addr.is_default);
      const otherAddresses = res.data.filter(addr => !addr.is_default);

      const finalList = defaultAddress
        ? [defaultAddress, ...otherAddresses]
        : otherAddresses;

      setAddresses(finalList);
      setError(null);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (data) => {
    if (editData) {
      await updateAddress(editData.id, data);
    } else {
      await addAddress(data);
    }
    setShowForm(false);
    setEditData(null);
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this address?", "Delete Address", "error");
    if (confirmed) {
      try {
        await deleteAddress(id);
        fetchAddresses();
      } catch (err) {
        console.error("Error deleting address:", err);
        const backendError = err.response?.data?.error || "Failed to delete address.";
        toast.error(backendError);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default address:", err);
      toast.error("Failed to set default address.");
    }
  };

  return (
    <div className="address-section-card">
      <div className="address-section-header">
        <h3 className="address-section-title">My Addresses</h3>
        <button 
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }} 
          className="add-address-btn"
        >
          <Plus size={16} />
          <span>Add Address</span>
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading addresses...</p>}
      
      {error && <p style={{ textAlign: "center", color: "var(--error-color)" }}>{error}</p>}

      {!loading && !error && addresses.length === 0 && (
        <div className="no-addresses-message">
          <MapPin size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <p>No addresses added yet. Add one to speed up checkout!</p>
        </div>
      )}

      {!loading && !error && addresses.map((addr) => (
        <div 
          key={addr.id} 
          className={`address-item-card ${addr.is_default ? "default" : ""}`}
        >
          <div className="address-details">
            <h4 className="address-recipient">
              <span>{addr.full_name}</span>
              <span className="address-phone">({addr.phone})</span>
            </h4>
            <p className="address-text">
              {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
            </p>
            <p className="address-text" style={{ fontStyle: "italic", fontSize: "13px", color: "var(--text-muted)" }}>
              {addr.country}
            </p>

            {addr.is_default && (
              <span className="address-badge-default">
                Default Address
              </span>
            )}
          </div>

          <div className="address-actions">
            {!addr.is_default && (
              <button 
                onClick={() => handleSetDefault(addr.id)}
                className="action-btn set-default-btn"
              >
                Set Default
              </button>
            )}

            <button 
              onClick={() => {
                setEditData(addr);
                setShowForm(true);
              }}
              className="action-btn"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>

            {!addr.is_default && (
              <button 
                onClick={() => handleDelete(addr.id)}
                className="action-btn delete-btn"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {showForm && (
        <AddressForm
          initialData={editData}
          onSubmit={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}
    </div>
  );
};

export default AddressList;