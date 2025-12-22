import React, { useState } from "react";
import { SignupForm } from "../../components/index";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signup } from "../../appFeatures/auth/authSlice";
import { clearTokens } from "../../api/tokenUtils";
import Alert from "../../components/common-ui/Alert";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);

  // local form state lives here (page owns it)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // All logic lives in the page:
  const handleSubmit = async (formData) => {
    // confirm password validation (frontend-only)
    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match!" });
      return;
    }

    const payload = {
      username: formData.name, // map frontend name -> backend username
      email: formData.email,
      password: formData.password,
    };

    try {
      // Call signup thunk. unwrap() throws on rejection so we can catch it here.
      await dispatch(signup(payload)).unwrap();

      // If your slice persisted tokens on signup, remove them now:
      clearTokens(); // remove tokens from localstorage
      dispatch({ type: "auth/clearAuth" }); // reset redux auth state
 // ✅ show success alert
    setAlert({
      type: "success",
      message: "User registered successfully. Redirecting to login...",
    });

      // Then navigate to the login page
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1000);
      return () => clearTimeout(timer);
    } catch (error) {
      // Extract a string message from the error object
      const message =
        error?.username?.[0] ||
        error?.email?.[0] ||
        error?.detail ||
        "Signup failed";
    setAlert({ type: "error", message });
    }
  };

  return (
    <>
      {/* Alert message */}
      {alert && (
  <Alert
    type={alert.type}
    message={alert.message}
    onClose={() => setAlert(null)}
  />
)}

      <SignupForm
        form={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        status={status}
      />
    </>
  );
}
