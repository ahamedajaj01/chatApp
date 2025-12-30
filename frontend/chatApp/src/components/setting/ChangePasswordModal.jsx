import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, resetError } from "../../appFeatures/auth/authSlice";
import { Input } from "../index"

export default function ChangePasswordModal({ show, onClose }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      dispatch(resetError());
      setIsLoading(false);
    }
  }, [show, dispatch]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(
        changePassword({ oldPassword, newPassword })
      ).unwrap();

      // ✅ success only
      setOldPassword("");
      setNewPassword("");
      onClose();
    } catch (err) {
      // ❌ failure → modal stays open
      console.error("Change password failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = () => {
    if (!error) return null;
    if (typeof error === "string") return error;

    // Handle Django/DRF style errors
    if (error.detail) return error.detail;
    if (error.error) return error.error;
    if (error.message) return error.message;

    // Handle field-specific errors (e.g., { "old_password": ["Incorrect"] })
    return Object.entries(error)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join(" | ");
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Change Password</h5>
            <button className="btn-close" onClick={onClose} disabled={isLoading} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 small">
                  {renderError()}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <Input
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />

              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <Input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />

              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
