import React from "react";

export default function ProfileAbout({ conversation,user, displayName }) {
      const otherLabel = displayName ?? conversation?.title ?? "Unknown User";

  return (
    <div>
         <p style={{ fontWeight: 600 }}>
        {otherLabel|| "Unknown User"}
      </p>
      <h3>{conversation.title}</h3>
      Description:
      <p style={{ color: "#555" }}>
        {conversation.about ?? "No description available."}
      </p>
    </div>
  );
}
