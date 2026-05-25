import React, { useEffect } from "react";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Redux
import { useDispatch } from "react-redux";
import { setUser, logout } from "./features/auth/authSlice";

// ✅ Service
import { getCurrentUser } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();

  // 🔥 AUTO LOGIN ON REFRESH
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser(); // calls /user/me/
        dispatch(setUser(user));
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
             <Dashboard />
          </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;