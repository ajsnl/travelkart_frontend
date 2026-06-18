import React, { useState, useEffect } from "react";
import { resendEmailOTP } from "../../services/authService";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useCustomDialog } from "../CustomDialog";

const OTPVerificationModal = ({ email, onSubmit, onClose }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showConfirm } = useCustomDialog();
  
  // Timer for resend cooldown (60 seconds)
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }
    const confirmed = await showConfirm("Are you sure you want to verify this OTP?", "Verify OTP", "info");
    if (!confirmed) return;
    
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      await onSubmit(otp);
      toast.success("OTP Verified")
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("OTP verification is Failed",err)
      setError(err.response?.data?.error || "Invalid verification code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setError("");
    setSuccessMsg("");
    try {
      await resendEmailOTP();
      setSuccessMsg("Verification code resent successfully!");
      toast.success("Verification code resent successfully")
      setCooldown(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Resend OTP error",err)
      setError(err.response?.data?.error || "Failed to resend verification code.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="address-modal-content" style={{ maxWidth: "420px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div style={{ background: "rgba(0, 35, 111, 0.05)", padding: "16px", borderRadius: "50%", color: "var(--primary-blue)" }}>
            <ShieldCheck size={40} />
          </div>
        </div>

        <h3 className="form-title" style={{ marginBottom: "10px" }}>Verify Your Email</h3>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "20px" }}>
          We've sent a 6-digit security code to <strong style={{ color: "var(--text-dark)" }}>{email}</strong>.
        </p>

        {error && (
          <div className="form-general-error" style={{ textAlign: "left", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.08)", borderLeft: "4px solid var(--success-color)", padding: "12px", borderRadius: "8px", color: "var(--success-color)", fontSize: "13px", fontWeight: 500, marginBottom: "20px", textAlign: "left" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field-wrapper" style={{ marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // Allow digits only
                if (val.length <= 6) setOtp(val);
                setError("");
              }}
              style={{
                fontFamily: "monospace",
                fontSize: "24px",
                letterSpacing: "8px",
                textAlign: "center",
                height: "56px",
                borderRadius: "12px",
              }}
              className={`form-input ${error ? "error-border" : ""}`}
              required
              disabled={submitting}
              maxLength={6}
            />
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>
            Didn't receive the code?{" "}
            {cooldown > 0 ? (
              <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-orange)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RefreshCw size={12} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <div className="form-actions-row" style={{ justifyContent: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              className="form-btn cancel-btn"
              style={{ flex: 1, height: "48px" }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-btn save-btn"
              style={{ flex: 1, height: "48px" }}
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
