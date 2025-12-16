import React, {useState} from 'react';
import {Button, Input} from "../index"

function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <>
 <form onSubmit={handleSend} className="d-flex align-items-end p-2 border-top"
  style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
 role="search">
  {/* textarea grows and takes remaining width */}
  <textarea
    className="form-control rounded-pill flex-grow-1 me-2"
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Type your message..."
    rows={1}
    disabled={disabled}
    aria-label="Type your message"
    onInput={(e) => {
      // small inline auto-grow, no external CSS
      e.target.style.height = "auto";
      e.target.style.height = Math.min(160, e.target.scrollHeight) + "px";
    }}
    style={{ paddingRight: "3.5rem" }} // leave space so text doesn't run into the button
  />

  {/* circular send button (Bootstrap classes only) */}
  <button
    type="submit"
    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
    disabled={disabled || !String(text || "").trim().length}
    style={{ width: 44, height: 44 }}
    aria-label="Send message"
  >
    {/* icon-only makes it compact and WhatsApp-like on small screens */}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M15.964.686a.5.5 0 0 0-.592-.592L.5 6.707v2.586l6.879-1.767L15.964.686zM6.304 8.11 1 9.383v2.683l5.304-3.956z"/>
    </svg>
  </button>
</form>
    </>
  )
}

export default MessageInput
