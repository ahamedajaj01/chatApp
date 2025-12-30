// src/components/auth/ForgotPasswordModal.jsx
import { useState, useEffect } from "react";
import { Input, Button, Alert} from "../index";
import { sendPasswordResetEmail } from "../../appFeatures/auth/authSlice";
import { useDispatch } from "react-redux";

export default function ForgotPasswordModal({ show, onClose }) {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
const [alert, setAlert] = useState(null);

    const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading");
    try {
        await dispatch(sendPasswordResetEmail(email)).unwrap();
        setStatus("success");
        setAlert({ type: "success", message: "Password reset link sent to your email." });
        setEmail("");
    } catch (error) {
        setStatus("error");
        let message = error?.email?.[0] || error?.detail || "Failed to send reset link. Please try again.";
        setAlert({ type: "error", message });
    }
}

  if (!show) return null;

  return (
    <>
 

    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
           {alert && (
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(null)}
      />
    )}
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Forgot Password</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
              label="Email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>


          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={status === "loading"? true : false}>
                {status === "loading" ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
