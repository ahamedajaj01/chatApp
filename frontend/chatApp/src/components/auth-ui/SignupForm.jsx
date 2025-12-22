import React, { useState } from 'react';
import { Input, Button } from '../index';
import {Link} from "react-router-dom"

function SignupForm({onSubmit, status="idle"}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //  Validate & submit to backend
    onSubmit(formData)
    
  };

  return (
    <div className="container mt-4 my-5">
      <h3 className="mb-3">Register Your Account to Log Your Complaint</h3>
      <form onSubmit={handleSubmit}>
        <Input
          label="UserName"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your username"
        />
        {/* error message */}
        
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
        />
   

        <div className="mt-3">
          <Button disabled={status === "loading"} type="submit" className="btn btn-primary w-100">
  {status === "loading" ? "Registering....." : "Register"}
          </Button>
        </div>
      </form>
            <p className="text-center my-1">Already have an account? <Link to="/login" >Login</Link></p>

    </div>
  );
}

export default SignupForm;