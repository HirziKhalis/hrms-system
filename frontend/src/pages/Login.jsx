// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Store both token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        <br /><br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
