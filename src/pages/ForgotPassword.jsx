import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/auth/forgot-password/", {
        email,
      });

      // ✅ store email for next steps
      localStorage.setItem("resetEmail", email);

      alert("OTP sent to your email");
      navigate("/verify-otp");
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded">
        <h2 className="text-xl mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 w-full"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;