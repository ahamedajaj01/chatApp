import { MessageList } from "../../../../components";

export default function ChatPane({ scrollRef, messages, currentUserId, conversationId }) {

  return (
    <div ref={scrollRef} style={{ height: "100%", overflow: "auto", background: "var(--bs-tertiary-bg)", color: "var(--bs-body-color)" }} aria-live="polite">
      <MessageList conversationId={conversationId} messages={messages} currentUserId={currentUserId} />
    </div>
  );
}
