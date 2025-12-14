import React from "react";
import MessageItem from "./MessageItem";

export default function MessageList({conversationId, messages, currentUserId }) {
  // normalize messages to an array
  const listRaw = Array.isArray(messages) ? messages : messages ? Object.values(messages) : [];
  const list = listRaw.slice().sort((a, b) => {
    const ta = a?.timestamp ? Date.parse(a.timestamp) : 0;
    const tb = b?.timestamp ? Date.parse(b.timestamp) : 0;
    return ta - tb;
  });

  // normalize currentUserId to string for comparison safety
  const me = currentUserId != null ? String(currentUserId) : null;

  return (
    <div className="p-3">
      {list.map((msg, idx) => {
        // Extract sender ID from multiple possible fields
       const senderId = msg?.sender?.id ?? msg?.sender ?? msg?.sender_id ?? msg?.user?.id ?? null;
const senderUsername = msg?.sender?.username ?? msg?.user?.username ?? null;
const isMe = me != null && (String(senderId) === String(me) || String(senderUsername) === String(me));

        // Accept either `content` (server) or `message` (older shape) safely
        const text = msg?.content ?? msg?.message ?? "";

        // fallback timestamp / id for key
        const key = msg?.id ?? `msg-${idx}`;
        

        return (
          
          <MessageItem
            key={msg?.id ?? `msg-${idx}`}
            message={msg}
            conversationId={conversationId}
            text={text}
            isMe={isMe}
            showDropdown={msg?.showDropdown}  // You can manage the dropdown visibility here
          />
        );
      })}
    </div>
  );
}