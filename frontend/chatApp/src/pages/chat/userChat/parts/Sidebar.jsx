import React from "react";
import {ConversationList, SearchResults} from "../../../../components";

export default function Sidebar({
  conversations,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchStatus,
  searchError,
  onSelectConversation,
  currentUserId,
  onStartConversation,
  onOpenSettings,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: "1 1 auto", overflow: "auto" }}>
        <div style={{ padding: 12, borderBottom: "1px solid var(--bs-border-color)" }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--bs-border-color)" }}
          />
        </div>

        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--bs-border-color)" }}>
          <h3 style={{ margin: 0, fontSize: 14 }}>Chats</h3>
        </div>
        

        {String(searchQuery || "").trim().length >= 3 ? (
          <SearchResults results={searchResults || []} status={searchStatus} error={searchError} query={searchQuery} onSelect={onStartConversation} />
          
        ) : (
          <ConversationList conversations={conversations} onSelect={onSelectConversation} activeId={null} currentUserId={currentUserId} />
        )}
         <div style={{ flex: "0 0 auto", borderTop: "1px solid var(--bs-border-color)", padding: 10, textAlign: "left" }}>
      <button
  type="button"
  className="btn btn-outline-secondary rounded-circle"
  onClick={onOpenSettings}
  aria-label="Open settings"
  title="Settings"
  style={{ width: 40, height: 40 }}
>
  <i className="bi bi-gear-fill" style={{ fontSize: 18 }}></i>
</button>

      </div>
      </div>

     
    </div>
  );
}
