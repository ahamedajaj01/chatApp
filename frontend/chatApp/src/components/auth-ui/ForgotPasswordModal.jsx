// src/components/auth/ForgotPasswordModal.jsx
import { Input, Button } from "../index";

export default function ForgotPasswordModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Forgot Password</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" className="disabled">
              Send reset link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
