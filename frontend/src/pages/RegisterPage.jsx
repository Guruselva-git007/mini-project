import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import RegisterForm from "../components/auth/RegisterForm";
import { registerUser } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../utils/roles";

const RegisterPage = () => {
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
      const response = await registerUser(payload);
      login({ token: response.token, user: response.user });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <RegisterForm onSubmit={handleSubmit} loading={loading} />
      {error && <p className="error">{error}</p>}
      <p className="muted">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
