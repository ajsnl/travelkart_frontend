import React, { useState, useEffect } from "react";

const AddressForm = ({ onSubmit, initialData, onClose }) => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        full_name: initialData.full_name || "",
        phone: initialData.phone || "",
        address_line: initialData.address_line || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
        country: initialData.country || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      await onSubmit(form);
    } catch (err) {
      console.error("Address submission error:", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          // Check for non_field_errors
          if (data.non_field_errors) {
            setGeneralError(data.non_field_errors.join(" "));
          } else {
            setFieldErrors(data);
          }
        } else if (typeof data === "string") {
          setGeneralError(data);
        } else {
          setGeneralError("Failed to save address. Please check your inputs.");
        }
      } else {
        setGeneralError("Network error. Please check your internet connection.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputFields = [
    { label: "Full Name", name: "full_name", type: "text", fullWidth: true },
    { label: "Phone Number", name: "phone", type: "tel", placeholder: "10-digit number" },
    { label: "Pincode", name: "pincode", type: "text", placeholder: "6-digit code" },
    { label: "Address Line", name: "address_line", type: "textarea", fullWidth: true },
    { label: "City", name: "city", type: "text" },
    { label: "State", name: "state", type: "text" },
    { label: "Country", name: "country", type: "text" },
  ];

  return (
    <div className="modal-overlay">
      <div className="address-modal-content">
        <h3 className="form-title">
          {initialData ? "Edit Address" : "Add New Address"}
        </h3>

        {generalError && (
          <div className="form-general-error">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="address-form-grid">
            {inputFields.map((field) => {
              const hasError = !!fieldErrors[field.name];
              const errorMessage = fieldErrors[field.name] 
                ? (Array.isArray(fieldErrors[field.name]) ? fieldErrors[field.name].join(" ") : fieldErrors[field.name])
                : "";

              return (
                <div 
                  key={field.name} 
                  className={`form-field-wrapper ${field.fullWidth ? "full-width" : ""}`}
                >
                  <label className="form-label" htmlFor={field.name}>
                    {field.label}
                  </label>
                  
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder || field.label}
                      className={`form-input ${hasError ? "error-border" : ""}`}
                      required
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder || field.label}
                      className={`form-input ${hasError ? "error-border" : ""}`}
                      required
                    />
                  )}
                  
                  {hasError && (
                    <span className="error-message">{errorMessage}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="form-actions-row">
            <button 
              type="button" 
              onClick={onClose} 
              className="form-btn cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-btn save-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;