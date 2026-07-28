import AdminDashboard from "../components/Dashboard/AdminDashboard";
import UserDashboard from "../components/Dashboard/UserDashboard";
import { useAuth } from "../hooks/useAuth";

// L'accès est garanti par <ProtectedRoute> dans App.jsx : cette page n'a plus à
// vérifier la session ni à rediriger elle-même.
const DashboardPage = () => {
  const { user } = useAuth();

  // L'API renvoie un booléen isAdmin ; il n'y a pas de champ `role`, l'ancien
  // test user.role === "admin" n'était donc jamais vrai.
  return user.isAdmin ? (
    <AdminDashboard user={user} />
  ) : (
    <UserDashboard user={user} />
  );
};

export default DashboardPage;
