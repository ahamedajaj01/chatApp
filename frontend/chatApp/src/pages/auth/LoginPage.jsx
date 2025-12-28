import React, { useState } from "react";
import { LoginForm, ForgotPasswordModal } from "../../components/index";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../../appFeatures/auth/authSlice";
import { saveTokens } from "../../api/tokenUtils";
import Alert from "../../components/common-ui/Alert";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [showForgot, setShowForgot] = useState(false);

  // local form state lives here (page owns it)
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
    const [alert, setAlert] = useState(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // This receives formData
  const handleSubmit = async () => {
    const payload = {
      username: form.username, // map frontend name -> backend username
      password: form.password,
    };
    setAlert(null)
    try {
      // Try logging in. Thunk should return { access, refresh, user? } on success
      const result = await dispatch(login(payload)).unwrap();

      // backend returns user only on a separate endpoint, fetch it:
      await dispatch(getCurrentUser()).unwrap();

      saveTokens();
      // Post-login: redirect to conversations page
      navigate("/");
    } catch (error) {
      let message = error?.username?.[0] || error?.password?.[0] || error?.detail || "Login failed. Please try again.";

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
      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        status={status}
        error={error}
        onForgotPassword={() => setShowForgot(true)}
      />
      <ForgotPasswordModal
        show={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </>
  );
}
