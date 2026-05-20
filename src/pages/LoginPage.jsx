import { useState } from "react";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/login/", { email, password });

      // test user
      const res = await api.get("/user/me/");
      console.log(res.data);

      window.location.href = "/dashboard";
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-blue-900 text-white flex-col justify-center px-16 relative">
        
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Curated journeys for the modern traveler.
        </h1>

        <p className="text-lg opacity-80 mb-6">
          Experience the art of effortless exploration with TravelKart.
          Your digital concierge for unique destinations.
        </p>

        <p className="text-sm opacity-60">
          Chosen by hundreds of travelers
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

          <h2 className="text-3xl font-bold mb-2 text-center">
            Welcome back
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Please enter your details to access your dashboard.
          </p>

          <form onSubmit={handleLogin}>
            
            {/* Email */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                placeholder="alex@voyage.com"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                placeholder="********"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-blue-900 text-white p-3 rounded-full text-lg hover:bg-blue-800 transition"
            >
              Sign In →
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <span className="text-blue-600 cursor-pointer">
              Create one
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;