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
  });
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // All logic lives in the page:
  const handleSubmit = async (formData) => {
    const payload = {
      username: formData.name, // map frontend name -> backend username
      email: formData.email,
      password: formData.password,
    };
    try {
      // Call signup thunk. unwrap() throws on rejection so we can catch it here.
      const result = await dispatch(signup(payload)).unwrap();

      // If your slice persisted tokens on signup, remove them now:
      clearTokens(); // remove tokens from localstorage
      dispatch({ type: "auth/clearAuth" }); // reset redux auth state

      // Then navigate to the login page
      navigate("/login");
    } catch (error) {
      setFormError(error);
    }
  };

  return (
    <>
      {/* Alert message */}
      <Alert
        type="error"
        message={formError}
        onClose={() => setFormError(null)}
      />
      <SignupForm
        form={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        status={status}
      />
    </>
  );
}
