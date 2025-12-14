import React, { useState } from "react";
import { LoginForm } from "../../components/index";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../../appFeatures/auth/authSlice";
import { saveTokens } from "../../api/tokenUtils";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  // local form state lives here (page owns it)
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState(null);

  const handleChange = (e)=>{
    const {name, value} = e.target;
    setForm((f)=>({...f, [name]:value}))
  }

  // This receives formData 
  const handleSubmit= async () =>{
    const payload = {
        username : form.username,   // map frontend name -> backend username
  password: form.password,
    }
    setFormErrors(null)
    try {
        // Try logging in. Thunk should return { access, refresh, user? } on success
        const result = await dispatch(login(payload)).unwrap()

        // backend returns user only on a separate endpoint, fetch it:
      await dispatch(getCurrentUser()).unwrap();

saveTokens()
         // Post-login: redirect to conversations / home
        navigate("/");
    } catch (error) {
      setFormErrors(error);
        
    }
  }

  return (
    <>
      <LoginForm form={form} onChange={handleChange} onSubmit={handleSubmit} status={status} error={error} formErrors={formErrors} />
    </>
  );
}
