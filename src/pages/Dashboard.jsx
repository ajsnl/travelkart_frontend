import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (loading) return <h1>Loading...</h1>;

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return <h1>Welcome {user?.username}</h1>;
}