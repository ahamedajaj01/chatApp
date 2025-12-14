import React, { useEffect, useRef } from "react";
import useMessageActions from "../../appFeatures/chat/hooks/useMessageActions";

export default function MessageActionsDropdown({
  conversationId,
  message,
  isMe,
  onClose,
}) {
  const dropdownRef = useRef(null);
  const { run } = useMessageActions();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const menuItemStyle = {
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    borderRadius: "4px",
  };

  // for message delete
  if (!message) {
    console.error('MessageActionsDropdown rendered without message prop', { conversationId, message });
    return null;
  }

  const convoId = conversationId ?? message?.conversationId;
  const msgId = message?.id;

  const handleDelete = async () => {
    if (!convoId || !msgId) {
      console.error('handleDelete missing ids', { conversationId, convoId, msgId, message });
      return; // bail out safely
    }

    const res = await run("delete", { conversationId: convoId, messageId: msgId });
    if (res.ok) onClose();
    else {
      console.log(res.error);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="message-dropdown"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        [isMe ? "right" : "left"]: "0",
        marginTop: "4px",
        backgroundColor: "var(--bs-tertiary-bg)", // auto-switches in dark mode
        color: "var(--bs-tertiary-color)", // text auto-switch
        borderRadius: "var(--bs-border-radius-lg)",
        boxShadow: "var(--bs-box-shadow)", // uses correct dark-mode shadow
        padding: "8px",
        zIndex: 1000,
        minWidth: "150px",
        transformOrigin: isMe ? "right top" : "left top",
        transition: "transform 0.12s ease, opacity 0.12s ease",
        transform: "translateY(0px)",
        opacity: 1,
      }}
    >
      <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
        <li
          style={menuItemStyle}
          className="dropdown-item-like"
          onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "var(--bs-dropdown-link-hover-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bs-dropdown-bg)")
          }
          onClick={() => {
            onClose();
          }}
        >
          Reply
        </li>
        <li
          style={menuItemStyle}
          className="dropdown-item-like"
          onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "var(--bs-dropdown-link-hover-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bs-dropdown-bg)")
          }
          onClick={() => {
            onClose();
          }}
        >
          Forward
        </li>
        <li
          style={menuItemStyle}
          className="dropdown-item-like text-danger"
          onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "var(--bs-dropdown-link-hover-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bs-dropdown-bg)")
          }
          onClick={handleDelete}
        >
          Delete For Me
        </li>
      </ul>
    </div>
  );
}
