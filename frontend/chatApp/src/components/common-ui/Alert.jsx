import React from "react";

const alertClasses = {
  success: "alert alert-success",
  error: "alert alert-danger",
  info: "alert alert-info",
  warning: "alert alert-warning",
};

export default function Alert({ type = "info", message, onClose }) {
  if (!message) return null; // Don't render if no message

  return (
    <div className={`${alertClasses[type]} alert-dismissible fade show`} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
}
