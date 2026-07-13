import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCustomDialog } from "../CustomDialog";

const ProfileEditForm = ({ user, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    dob: "",
    email: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showConfirm } = useCustomDialog();

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        phone: user.phone || "",
        dob: user.dob || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDobMaxStr = () => {
    const today = new Date();
    const year = today.getFullYear() - 13;
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

    // First / Last Name validation
    const nameRegex = /^[A-Za-z\s]+$/;
    if (form.first_name && !nameRegex.test(form.first_name.trim())) {
      toast.error("First name must contain only letters and spaces");
      return;
    }
    if (form.last_name && !nameRegex.test(form.last_name.trim())) {
      toast.error("Last name must contain only letters and spaces");
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    // DOB validation
    if (form.dob) {
      const dobMaxStr = getDobMaxStr();
      if (form.dob > dobMaxStr) {
        toast.error("You must be at least 13 years old");
        return;
      }
    }
    const confirmed = await showConfirm("Are you sure you want to save these profile changes?", "Save Changes", "info");
    if (!confirmed) return;
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    // Prepare data (prevent sending unchanged fields if needed, but standard PATCH is fine)
    const payload = { ...form };
    // If email is disabled (social account), don't send it or send it as is
    if (user.is_social) {
      delete payload.email;
    }

    try {
      await onSubmit(payload);
      toast.success("Profile Updated")
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Error Occured",err)
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          if (data.non_field_errors) {
            setGeneralError(data.non_field_errors.join(" "));
          } else {
            setFieldErrors(data);
          }
        } else if (typeof data === "string") {
          setGeneralError(data);
        } else {
          setGeneralError("Failed to update profile. Please try again.");
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
      <div className="address-modal-content">
        <h3 className="form-title">Edit Profile</h3>

        {generalError && (
          <div className="form-general-error">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="address-form-grid">
            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                className={`form-input ${fieldErrors.first_name ? "error-border" : ""}`}
                required
              />
              {fieldErrors.first_name && (
                <span className="error-message">{fieldErrors.first_name.join(" ")}</span>
              )}
            </div>

            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                className={`form-input ${fieldErrors.last_name ? "error-border" : ""}`}
                required
              />
              {fieldErrors.last_name && (
                <span className="error-message">{fieldErrors.last_name.join(" ")}</span>
              )}
            </div>

            <div className="form-field-wrapper full-width">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className={`form-input ${fieldErrors.username ? "error-border" : ""}`}
                required
              />
              {fieldErrors.username && (
                <span className="error-message">{fieldErrors.username.join(" ")}</span>
              )}
            </div>

            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit number"
                value={form.phone}
                onChange={handleChange}
                className={`form-input ${fieldErrors.phone ? "error-border" : ""}`}
              />
              {fieldErrors.phone && (
                <span className="error-message">{fieldErrors.phone.join(" ")}</span>
              )}
            </div>

            <div className="form-field-wrapper">
              <label className="form-label" htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                max={getDobMaxStr()}
                className={`form-input ${fieldErrors.dob ? "error-border" : ""}`}
              />
              {fieldErrors.dob && (
                <span className="error-message">{fieldErrors.dob.join(" ")}</span>
              )}
            </div>

            <div className="form-field-wrapper full-width">
              <label className="form-label" htmlFor="email">
                Email Address {user.is_social && <span style={{ color: "var(--accent-orange)", textTransform: "none", fontSize: "10px" }}>(Linked to Google)</span>}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`form-input ${fieldErrors.email ? "error-border" : ""}`}
                disabled={user.is_social}
                title={user.is_social ? "Google users cannot edit their email address" : ""}
                required
              />
              {fieldErrors.email && (
                <span className="error-message">{fieldErrors.email.join(" ")}</span>
              )}
            </div>
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
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;
