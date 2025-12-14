import React from "react";

export default function ProfileDelete({ conversationId, onDelete, loading, error, onClose }) {

  return (
    <div>
      <h4>Delete chat</h4>
     <p style={{ color: "#575454ff" }}>
        This will hide this chat from your list.
      </p>

 {error && (
        <div style={{ color: "#f55", marginBottom: 8 }}>
          {error?.message || "Delete failed"}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
        type="button"
          onClick={onDelete}
 
          disabled={loading}
         className={`btn btn-outline-danger py-2 px-3 rounded-2 ${
    loading ? "disabled opacity-50" : ""
  }`}
        >
          {loading ? "Deleting..." : "Delete chat"}
        </button>

        <button
          onClick={onClose}
          className="btn border-secondary text-secondary bg-transparent py-2 px-3 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
