import React, { useState } from 'react';
import MessageActionsDropdown from "./MessageActionsDropdown"

export default function MessageItem({conversationId,message, text, isMe }) {
  const [hovered, setHovered] = useState(false);  // Local hover state to show dropdown button
  const [dropdownOpen, setDropdownOpen] = useState(false);  // State to control dropdown menu visibility

  return (
    <div
      className="message-item"
      onMouseEnter={() => setHovered(true)}  // Set hover state to true
      onMouseLeave={() => {
        setHovered(false);
        // Close dropdown when mouse leaves the message area
        if (!dropdownOpen) {
          setDropdownOpen(false);
        }
      }}
      style={{
        marginBottom: 8,
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        position: 'relative', // To position the dropdown relative to the message bubble
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {/* Dropdown button for sent messages - appears on LEFT side of bubble */}
      {isMe && hovered && (
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bs-body-color)',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 5.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div
        style={{
          padding: 8,
          borderRadius: 6,
          maxWidth: "70%",
          backgroundColor: isMe ? "#0d6efd" : "var(--bs-body-bg)",
          color: isMe ? "white" : "var(--bs-body-color)",
          border: isMe ? "none" : "1px solid var(--bs-border-color)",
          position: 'relative',
        }}
      >
        {text}
      </div>

      {/* Dropdown button for received messages - appears on RIGHT side of bubble */}
      {!isMe && hovered && (
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bs-body-color)',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 5.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Show dropdown menu when button is clicked */}
      {dropdownOpen && (
        <MessageActionsDropdown
        message={message}
        conversationId={conversationId}
          isMe={isMe}
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}
