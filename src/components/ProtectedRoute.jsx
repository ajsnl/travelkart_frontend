import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-blue-900">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;