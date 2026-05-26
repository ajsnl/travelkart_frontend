
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <button onClick={() => logoutUser(navigate)}>
        Logout
      </button>
    </div>
  );
}