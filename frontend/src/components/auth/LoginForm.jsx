import { useState } from "react";

const LoginForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;
