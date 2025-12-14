// src/components/SearchResults.jsx
import React from "react";

export default function SearchResults({ results = [], status = "idle", error = null, query = "", onSelect }) {
  const MIN_SEARCH_LENGTH = 2;
  if (String(query || "").trim().length < MIN_SEARCH_LENGTH) return null;

  return (
    <div style={{ padding: 12 }}>
      {status === "loading" && <div style={{ color: "#666" }}>Searching…</div>}
      {error && <div style={{ color: "crimson" }}>{error.message || error}</div>}
      {status === "idle" && results.length === 0 && (
        <div style={{ color: "#666" }}>No users found for "{query}"</div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.map((u, idx) => (
          <li
            key={u.id ?? `user-${idx}`}
            onClick={() => onSelect(u)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(u); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 6px",
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 600 }}>{u.username}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
