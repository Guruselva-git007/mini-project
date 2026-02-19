import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ROLES, roleHomePath } from "./utils/roles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CitizenDashboardPage from "./pages/CitizenDashboardPage";
import AuthorityDashboardPage from "./pages/AuthorityDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import MapPage from "./pages/MapPage";

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(user.role)} replace />;
};

const AuthenticatedLayout = () => (
  <ProtectedRoute>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<AuthenticatedLayout />}>
      <Route
        path="/citizen"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <CitizenDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/authority"
        element={
          <ProtectedRoute roles={[ROLES.AUTHORITY]}>
            <AuthorityDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="/report" element={<ReportIssuePage />} />
      <Route path="/map" element={<MapPage />} />
    </Route>

    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

export default App;
