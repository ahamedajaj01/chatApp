// src/components/LoginForm.jsx
import { Input, Button } from "../index";
import { Link } from "react-router-dom";

export default function LoginForm({
  form = { username: "", password: "" }, // default to avoid null
  onChange = () => {},
  onSubmit = () => {},
  status = "idle",
  onForgotPassword,
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
        {/* Forgot Password */} 
        <div className="d-flex justify-content-end mb-3">
         <Button type="button" variant="link" size="sm" onClick={onForgotPassword}>
          Forget Password?
          </Button>
        </div>
    

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
