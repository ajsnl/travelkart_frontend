import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, useNavigationType } from "react-router-dom"; 

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./features/auth/authSlice";

// Service
import { getCurrentUser } from "./services/authService";

// Routes
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";

// Toast Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  const location = useLocation(); 
  const navigationType = useNavigationType(); 
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/verify-otp",
      "/reset-password"
    ];

    const checkAuth = async () => {
      try {
        //  ONLY CHECK AUTH FOR PRIVATE ROUTES
        if (!publicRoutes.includes(location.pathname)) {
          const userData = await getCurrentUser();
          dispatch(setUser(userData));
        } else if (publicRoutes.includes(location.pathname)) {
          // If they land on guest routes
          if (isAuthenticated) {
            // REDIRECT them back to their dashboard if they are already logged in
            const target = user?.role === "admin" ? "/admin" : "/dashboard";
            navigate(target, { replace: true });
          } else {
            // Check if they have an active backend session (e.g. after a hard page refresh on landing page)
            try {
              const userData = await getCurrentUser(true);
              if (userData) {
                dispatch(setUser(userData));
                const target = userData.role === "admin" ? "/admin" : "/dashboard";
                navigate(target, { replace: true });
              }
            } catch (err) {
              // Not logged in, let them access guest page
            }
          }
        }
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [location.pathname, dispatch, isAuthenticated, navigationType, user, navigate]);

  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;