import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const ChangePasswordModal = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password visibility states
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    if (form.new_password !== form.confirm_password) {
      setFieldErrors({ confirm_password: ["New passwords do not match"] });
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      console.error("Change password error:", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          if (data.error) {
            setFieldErrors({ old_password: [data.error] });
          } else if (data.non_field_errors) {
            setGeneralError(data.non_field_errors.join(" "));
          } else {
            setFieldErrors(data);
          }
        } else if (typeof data === "string") {
          setGeneralError(data);
        } else {
          setGeneralError("Failed to update password. Please check your credentials.");
        }
      } else {
        setGeneralError("Network error. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="address-modal-content" style={{ maxWidth: "440px" }}>
        <h3 className="form-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Lock size={22} className="alert-strip-icon-accent" style={{ color: "var(--primary-blue)" }} />
          <span>Change Password</span>
        </h3>

        {generalError && (
          <div className="form-general-error">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="address-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            
            {/* Old Password */}
            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="old_password">Old Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="old_password"
                  name="old_password"
                  type={showOld ? "text" : "password"}
                  value={form.old_password}
                  onChange={handleChange}
                  className={`form-input ${fieldErrors.old_password ? "error-border" : ""}`}
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.old_password && (
                <span className="error-message">{fieldErrors.old_password.join(" ")}</span>
              )}
            </div>

            {/* New Password */}
            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="new_password">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="new_password"
                  name="new_password"
                  type={showNew ? "text" : "password"}
                  value={form.new_password}
                  onChange={handleChange}
                  className={`form-input ${fieldErrors.new_password ? "error-border" : ""}`}
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.new_password && (
                <span className="error-message">{fieldErrors.new_password.join(" ")}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={`form-input ${fieldErrors.confirm_password ? "error-border" : ""}`}
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm_password && (
                <span className="error-message">{fieldErrors.confirm_password.join(" ")}</span>
              )}
            </div>

          </div>

          <div className="form-actions-row" style={{ marginTop: "24px" }}>
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
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
