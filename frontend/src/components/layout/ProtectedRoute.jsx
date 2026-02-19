import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleHomePath } from "../../utils/roles";

const ProtectedRoute = ({ roles = [], children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
