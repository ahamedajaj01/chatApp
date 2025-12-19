import { Button } from "../index";
import React from "react";

function ConversationHeader({ title, onAvatarClick, isOnline}) {
  const initial = title?.toString().trim().charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="p-2 border-bottom"
      style={{
        background: "var(--bs-body-bg)",
        color: "var(--bs-body-color)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Avatar button: initial must be a child of the button */}
      <Button
      onClick={()=>onAvatarClick()}
        type="button"
        aria-label={title ? `Open profile for ${title}` : "Open profile"}
        title={title}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#0d6efd20",
          color: "#0d6efd",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          cursor: "pointer",
          border: "none",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {initial}
      </Button>

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
      <div
        style={{
           fontWeight: 600,
      fontSize: "16px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
         {isOnline && (
          <div
            style={{
              fontSize: "12px",
              color: "#198754", // bootstrap green
              marginTop:"2px"
            }}
          >
            Online
          </div>
        )}
    </div>
    </div>
  );
}

export default ConversationHeader;
