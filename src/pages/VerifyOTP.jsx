import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/auth/verify-forgot-otp/", {
        email,
        otp,
      });

      alert("OTP verified");
      navigate("/reset-password");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleVerify} className="p-6 bg-white shadow rounded">
        <h2 className="text-xl mb-4">Enter OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          className="border p-2 w-full mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />

        <button className="bg-green-600 text-white px-4 py-2 w-full">
          Verify OTP
        </button>
      </form>
    </div>
  );
}

export default VerifyOTP;