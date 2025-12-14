import React from "react";

/**
 * ChatLayout: dumb, presentational container.
 * - sidebar: a React node containing search input + heading + conversation list
 * - header: chat header
 * - messages: message area
 * - input: message input area
 */
export default function ChatLayout({ sidebar, header, messages, input }) {
  return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 300,
          minWidth: "300px",
          height: "100%",
          display: "flex",
          flexDirection: "column",

          // Bootstrap theme-aware border + background
          borderRight: "1px solid var(--bs-border-color)",
          background: "var(--bs-body-bg)",
        }}
      >
        {sidebar}
      </div>

      {/* Right area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            flex: "0 0 auto",
            zIndex: 2,

            // Theme-aware
            borderBottom: "1px solid var(--bs-border-color)",
            background: "var(--bs-body-bg)",
            color: "var(--bs-body-color)",
          }}
        >
          {header}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "auto",

            // Subtle background that changes in dark mode
            background: "var(--bs-tertiary-bg)",
            color: "var(--bs-body-color)",
          }}
        >
          {messages}
        </div>

        {/* Input */}
        <div
          style={{
            flex: "0 0 auto",

            // Theme aware
            borderTop: "1px solid var(--bs-border-color)",
            background: "var(--bs-body-bg)",
            color: "var(--bs-body-color)",
          }}
        >
          {input}
        </div>
      </div>
    </div>
  );
}
