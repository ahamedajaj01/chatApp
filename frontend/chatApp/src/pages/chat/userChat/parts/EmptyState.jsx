import React from "react";

export default function EmptyState() {
  return (
    <div className="h-100 d-flex align-items-center justify-content-center text-muted">
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>Select a chat</div>
        <div style={{ fontSize: 14 }}>
          Click a conversation on the left or start a new one to begin messaging.
        </div>
      </div>
    </div>
  );
}
