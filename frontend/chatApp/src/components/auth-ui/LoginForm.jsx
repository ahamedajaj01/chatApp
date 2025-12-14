// src/components/LoginForm.jsx
import React from "react";
import { Input, Button } from "../index";
import { Link } from "react-router-dom";

export default function LoginForm({
  form = { username: "", password: "" }, // default to avoid null
  onChange = () => {},
  onSubmit = () => {},
  status = "idle",
  error = null,
  formErrors = null,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // pass data to the page
  };

  return (
    <div className="container mt-5 my-5">
      <h4 className="mb-4">Login to Your Account</h4>

      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-body text-body">
        <Input
          label="Username"
          name="username"
          value={form.username || ""}
          onChange={onChange}
          placeholder="Enter your username"
          className="form-control mb-3"
          required
        />
        {formErrors?.username && <p className="text-danger fs-6 mb-2">{String(formErrors.username)}</p>}

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password || ""}
          onChange={onChange}
          placeholder="********"
          className="form-control mb-3"
          required
        />
        {formErrors?.password && <p className="text-danger fs-6 mb-2">{String(formErrors.password)}</p>}

        {error && !formErrors && <div className="text-danger mb-2">{String(error)}</div>}

        <div className="d-grid">
          <Button type="submit" disabled={status === "loading"} className="btn btn-primary">
            {status === "loading" ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p className="text-center my-2">
          Don't have an account? <Link to="/register">Signup</Link>
        </p>
      </form>
    </div>
  );
}
