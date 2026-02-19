import { useState } from "react";

const RegisterForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    fullName: "",
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
      <h2>Create Account</h2>

      <label htmlFor="fullName">Full Name</label>
      <input
        id="fullName"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        required
      />

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
        minLength={8}
        value={form.password}
        onChange={handleChange}
        required
      />

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
};

export default RegisterForm;
