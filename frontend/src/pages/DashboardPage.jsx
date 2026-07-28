import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import UserDashboard from "../components/Dashboard/UserDashboard";
import { getStoredUser } from "../utils/auth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getStoredUser();
    if (!userData) navigate("/login");
    else setUser(userData);
  }, [navigate]);

  if (!user) return <div>Chargement...</div>;

  // L'API renvoie un booléen isAdmin ; il n'y a pas de champ `role`, l'ancien
  // test user.role === "admin" n'était donc jamais vrai.
  return user.isAdmin ? (
    <AdminDashboard user={user} />
  ) : (
    <UserDashboard user={user} />
  );
};

export default DashboardPage;