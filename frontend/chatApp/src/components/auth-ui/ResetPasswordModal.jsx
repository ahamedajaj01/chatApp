import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input, Button, Alert } from "../index";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../appFeatures/auth/authSlice";

function ResetPasswordModal() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [alert, setAlert] = useState(null);
    const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    if (password !== confirm) {
        setStatus("error");
      setAlert({ type: "error", message: "Passwords do not match" });
      return;
    }
    try {
      await dispatch(
        resetPassword({ uid, token, newPassword: password })
      ).unwrap();
      setStatus("success");
      setAlert({ type: "success", message: "Password reset successfully!" });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
        setStatus("error");
      let message =
        error?.new_password?.[0] ||
        error?.detail ||
        "Failed to reset password. Please try again.";
      setAlert({ type: "error", message });
    }
  };

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block", background: "rgba(0,0,0,.5)" }}
      >
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
              <h5 className="modal-title">Reset Password</h5>
              <button
                className="btn-close"
                onClick={() => navigate("/login")}
              />
            </div>

            <div className="modal-body">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="modal-body">
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={status === "loading" ? true : false}
              >
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ResetPasswordModal;
