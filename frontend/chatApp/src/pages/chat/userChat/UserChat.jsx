import React, { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SettingsModal, ChangePasswordModal } from "../../../components"
import { ChatLayout, ConversationHeader, MessageInput, ProfileModal } from "../../../components";


import useChatData from "../../../appFeatures/chat/hooks/useChatData";
import useChatSearch from "../../../appFeatures/chat/hooks/useChatSearch";
import Sidebar from "./parts/Sidebar";
import ChatPane from "./parts/ChatPane";
import EmptyState from "./parts/EmptyState";

export default function UserChat() {
  const navigate = useNavigate();
  const { conversationId: routeConversationId } = useParams();

  // Avatar- user profile
  const [profileOpen, setProfileOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);


  const {
    conversations,
    user,
    chatStatus,
    activeConversation,
    setActiveConversation,
    headerTitle,
    setHeaderTitleOverride,
    handleStartConversation,
    handleSendMessage,
    activeMessages,
    scrollRef,
    activeUser, // for online status
  } = useChatData({ routeConversationId, navigate });

  const { searchQuery, setSearchQuery, searchResults, searchStatus, searchError } =
    useChatSearch();

  const [showSetting, setShowSetting] = useState(false);

  function handleSelectConversation(id) {
    setActiveConversation(id);
    setHeaderTitleOverride(null);
    navigate(`/chats/${String(id)}`, { replace: false });
  }

  // mobile view
  const isMobileChatOpen = Boolean(activeConversation);

  return (
    <>
      <ChatLayout
        isChatOpen={isMobileChatOpen} // for mobile chat layout
        sidebar={
          <Sidebar
            conversations={conversations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searchStatus={searchStatus}
            searchError={searchError}
            onSelectConversation={handleSelectConversation}
            currentUserId={ String(user.id)}
            onStartConversation={handleStartConversation}
            onOpenSettings={() => setShowSetting(true)}
          />
        }
        header={
          activeConversation ? (
            // For mobile view css
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="btn btn-link d-md-none"
                onClick={() => {
                  setActiveConversation(null);  //Mobile view
                  navigate('/chats');
                }}
                style={{ marginRight: 8, padding: '8px 12px' }}
              >
                <i className="bi bi-arrow-left" style={{ fontSize: 20 }}></i>
              </button>

              <ConversationHeader
                title={headerTitle}
                isOnline={activeUser?.is_online}
                onAvatarClick={() => setProfileOpen(true)}
              />
            </div>
          ) : (
            <>
              <div style={{ padding: 16, borderBottom: "1px solid var(--bs-border-color)" }}>
                <strong>Your Chats</strong>

              </div>
            </>
          )
        }
        messages={
          activeConversation ? (
            <ChatPane scrollRef={scrollRef} messages={activeMessages} currentUserId={user.id} conversationId={activeConversation} />
          ) : (
            <EmptyState />
          )
        }
        input={
          activeConversation ? (
            <MessageInput
              key={activeConversation ?? "no-conv"}
              onSend={handleSendMessage}
              disabled={chatStatus === "loading"}
            />
          ) : null
        }
      />

      {/* Profile modal */}
      <ProfileModal
        show={profileOpen}
        onClose={() => setProfileOpen(false)}
        conversation={activeConversation}
        user={user}
        displayName={headerTitle}
      />

      <SettingsModal
        show={showSetting}
        onClose={() => setShowSetting(false)}
        onSave={() => setShowSetting(false)}
        user={user}
        onChangePassword={()=>{
          setShowSetting(false);
          setShowChangePassword(true)
        }}
      />
      <ChangePasswordModal
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}
