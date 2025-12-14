// components/userProfile/ProfileModal.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useConversationActions from "../../appFeatures/chat/hooks/useConversationActions";

// import your separate section components
import ProfileAbout from "./section/ProfileAbout";
import ProfileDelete from "./section/ProfileDelete";

export default function ProfileModal({
  show,
  onClose,
  conversation = {},
  user,
  displayName,
}) {
  const tabs = [
    { key: "about", label: "About", Component: ProfileAbout },
    { key: "delete", label: "Delete", Component: ProfileDelete },
  ];

  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (show) setActiveTab("about");
  }, [show]);

  // hook provides action + loading + error
  const {
    hideConversation,
    loading: hideloading,
    error: hideError,
  } = useConversationActions();

  const handleDelete = async (conversationId) => {
      // conversationId may be a number or string; normalize to string for logging/requests
    const convId = conversationId ?? (typeof conversation === "object" ? conversation.id:conversation)
if (!convId) {
    console.warn("No conversation id, aborting delete");
    return;
  }
    try {
      await hideConversation(convId, {
        onSuccess: () => {
          onClose?.();
        },
        onError: (error) => {
          console.error("Hide conversation failed", error);
        },
      });
    } catch (error) {
      // hook already handles error state; nothing else required here
      console.error("handleDelete caught", error);
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
     className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 bg-dark bg-opacity-50"
      style={{ zIndex: 1050 }}
    >
      <div
         className="w-100 d-flex overflow-hidden rounded-3 shadow"
        style={{ maxWidth: 600 }}
         role="dialog"
        aria-modal="true"
      >
        {/* Left Tabs */}
        <div
           className="d-flex flex-column p-3 gap-2 border-end" style={{ width: 160 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
        className={`w-100 text-start py-2 px-3 rounded-2 border-0 ${
                activeTab === tab.key ? "bg-secondary text-white" : "bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Panel – Render actual component */}
        <div className="flex-grow-1 p-3 bg-body">
          {tabs.map((tab) => {
            if (tab.key !== activeTab) return null;
            const SectionComponent = tab.Component;
            const convId = typeof conversation === "object" ? conversation.id : conversation;
            return (
              <SectionComponent
                key={tab.key}
                conversation={conversation}
                user={user}
                displayName={displayName}
                onClose={onClose}
                onDelete={()=>handleDelete(convId)}
                loading={hideloading}
                error={hideError}
              />
            );
          })}

          <div className="mt-3 text-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
