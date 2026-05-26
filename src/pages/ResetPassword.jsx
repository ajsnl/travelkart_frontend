import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleReset = async (e) => {
    e.preventDefault();

    // ✅ Check if email exists
    if (!email) {
      alert("Session expired. Please restart password reset.");
      navigate("/forgot-password");
      return;
    }

    // ✅ Password match validation
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:8000/api/auth/reset-password/",
        {
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          withCredentials: true, // 🔥 important for cookies
        }
      );

      alert("Password reset successful");

      // ✅ Clear only temp data
      localStorage.removeItem("resetEmail");

      // ✅ Redirect to login
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleReset} className="p-6 bg-white shadow rounded w-80">
        <h2 className="text-xl mb-4 text-center">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          className="border p-2 w-full mb-3"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2 w-full mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          className="bg-purple-600 text-white px-4 py-2 w-full disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;