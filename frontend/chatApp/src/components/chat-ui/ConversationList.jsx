import { Button } from "../index";

function ConversationList({
  conversations,
  onSelect,
  activeId,
  currentUserId,
}) {
  return (
    <>
      <div className="list-group">
        {conversations.map((c, idx) => {
          // helper to extract a comparable key from a participant entry
          const participantKey = (p) => {
            if (!p) return "";
            if (typeof p === "string") return String(p);
            if (p.id != null) return String(p.id);
            if (p._id != null) return String(p._id);
            if (p.user?.id != null) return String(p.user.id);
            if (p.user?._id != null) return String(p.user._id);
            return "";
          };

          const otherParticipant =
            c.participants &&
            c.participants?.find(
              (p) => participantKey(p) !== String(currentUserId)
            );

          // try common places for a display name
          const otherName =
            (typeof otherParticipant === "string" ? otherParticipant : null) ??
            otherParticipant?.username ??
            otherParticipant?.user?.username ??
            otherParticipant?.name ??
            otherParticipant?.full_name ??
            otherParticipant?.email ??
            null;
          const displayName = c.name || otherName || `Conversation ${c.id}`;

          return (
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              key={c.id ?? `conv-${idx}`}
              className={`list-group-item list-group-item-action ${
                activeId === c.id ? "active" : ""
              }`}
              onClick={() => onSelect(c.id)}
            >
              {displayName}
              {c.unread_count > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {c.unread_count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </>
  );
}

export default ConversationList;
