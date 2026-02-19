import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import { loginGuest, loginUser } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../utils/roles";

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError("");
      const response = await loginUser(payload);
      login({ token: response.token, user: response.user });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await loginGuest();
      login({ token: response.token, user: response.user });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Guest mode unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
      <button className="btn btn-outline" type="button" onClick={handleGuestMode} disabled={loading}>
        Continue as Guest
      </button>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        New user? <Link to="/register">Create account</Link>
      </p>
    </section>
  );
};

export default LoginPage;
