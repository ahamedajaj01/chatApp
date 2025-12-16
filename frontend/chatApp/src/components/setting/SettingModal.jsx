// SettingsModal.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setDarkMode } from "../../appFeatures/themeSlice";
import { logout as logoutSession } from '../../appFeatures/auth/authSlice';


export default function SettingsModal({ show, onClose, onSave, user }) {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
     const navigate = useNavigate();

       const handleLogout = async ()=>{
    try {
      await dispatch(logoutSession());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
  
    }
  };

  if (!show) return null;

  return (
    // lightweight modal — no bootstrap JS required
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Settings</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <strong>User:</strong> {user?.username ?? user?.email ?? "—"}
            </div>

            <div className="mb-3">
              <label className="form-label">Theme</label>
              <select
                className="form-select"
                value={darkMode ? "dark" : "light"}
                onChange={(e) =>
                  dispatch(setDarkMode(e.target.value === "dark"))
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Logout button */}
            <hr />
            <div className="d-grid">
              <button onClick={handleLogout} type="button" className="btn btn-outline-danger">
                Logout
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onSave?.();
                onClose?.();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
