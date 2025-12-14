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
              if (p == null) return "";
              if (typeof p === "string") return String(p);
              if (p.id !== undefined) return String(p.id);
              if (p.username) return String(p.username);
              if (p.user && p.user.username) return String(p.user.username);
              return "";
            };

            const otherParticipant =
              c.participants &&
              c.participants.find((p) => participantKey(p) !== String(currentUserId));

            // try common places for a display name
            const otherName =
              (typeof otherParticipant === "string" ? otherParticipant : null) ??
              otherParticipant?.username ??
              otherParticipant?.user?.username ??
              otherParticipant?.name ??
              otherParticipant?.full_name ??
              otherParticipant?.email ??
              null;
            const displayName =
              c.name || otherName || `Conversation ${c.id}`;

            return (
              <Button
                key={c.id ?? `conv-${idx}`}
                className={`list-group-item list-group-item-action ${
                  activeId === c.id ? "active" : ""
                }`}
                onClick={() => onSelect(c.id)}
              >
                {displayName}
              </Button>
            );
          })}
        </div>
      </>
    );
  }

  export default ConversationList;
