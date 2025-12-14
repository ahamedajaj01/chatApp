// SettingsButton.jsx
import React from "react";

export default function SettingsButton({ onClick }) {
  return (
    <div className="border-top p-2 text-center" style={{ flex: "0 0 auto" }}>
      <button
        type="button"
        className="btn btn-light rounded-circle"
        onClick={onClick}
        aria-label="Open settings"
        title="Settings"
      >
        <i className="bi bi-gear-fill" style={{ fontSize: 20 }} />
      </button>
    </div>
  );
}
