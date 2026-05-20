import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import api from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);


useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/user/me/");
      console.log(res.data);
      setUser(res.data);
    } catch (err) {
      console.log("Not logged in");
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? <p>Welcome {user.username}</p> : <p>Loading...</p>}
    </div>
  );
}