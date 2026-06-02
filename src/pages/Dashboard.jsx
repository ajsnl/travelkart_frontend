
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/");
    } else if (isAuthenticated && !loading && user?.role === "admin") {
      navigate("/admin");
    }
  }, [isAuthenticated, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-blue-900">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f2d70", marginBottom: "20px" }}>
          Welcome, {user?.username || "Traveler"}!
        </h1>
        <p style={{ color: "#555866", fontSize: "16px", marginBottom: "32px" }}>
          You have successfully logged in to TravelKart. Explore your profile or start planning your next journey.
        </p>

        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              logoutUser(navigate);
            }
          }}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
        >
          Logout
        </button>
      </div>
    </div>
  );
}