import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchConversations,
  fetchMarkRead,
  fetchMessages,
  sendMessages,
  startConversation,
} from "../chatSlice";
import webSocketService from "../../../api/websocketService";

export default function useChatData({ routeConversationId, navigate }) {
  const dispatch = useDispatch();
  const conversations = useSelector((s) => s.chat.conversations) || [];
  const messagesMap = useSelector((s) => s.chat.messages) || {};
  const chatStatus = useSelector((s) => s.chat.status);
  const user = useSelector((s) => s.auth.user) || {};

  const [activeConversation, setActiveConversation] = useState(null);
  const [headerTitleOverride, setHeaderTitleOverride] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (routeConversationId) setActiveConversation(routeConversationId);
  }, [routeConversationId]);

  useEffect(() => {
    if (activeConversation !== null) {
      dispatch(fetchMessages(activeConversation));
      dispatch(fetchMarkRead(activeConversation));
    }
  }, [activeConversation, dispatch]);

  const activeMessages =
    messagesMap[String(activeConversation)] ||
    messagesMap[activeConversation] ||
    [];

  useEffect(() => {
    if (!scrollRef.current) return;
    const raf = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(raf);
  }, [activeConversation, activeMessages]);

  async function handleStartConversation(userObj) {
    try {
      const result = await dispatch(
        startConversation({ username: userObj.username })
      ).unwrap();
      const convId = result?.id || result?.conversation?.id;
      if (convId) {
        setActiveConversation(convId);
        setHeaderTitleOverride(userObj.username || null);
        dispatch(fetchConversations());
      } else {
        const found = (conversations || []).find((c) =>
          c.participants?.some((p) => p.id === userObj.id)
        );
        if (found) {
          setActiveConversation(found.id);
          setHeaderTitleOverride(null);
        }
      }
    } catch (err) {
      console.error("Start conversation failed", err);
    }
  }

  async function handleSendMessage(text) {
    if (!activeConversation) {
      return;
    }
    try {
      const res = await dispatch(
        sendMessages({ conversationId: activeConversation, text })
      ).unwrap();
      if (scrollRef.current) {
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
      return res;
    } catch (err) {
      console.error("Send message failed", err);
      throw err;
    }
  }

  function getConversationTitle(conv, currentUserKey, headerTitleOverride) {
    if (headerTitleOverride) return headerTitleOverride;
    if (!conv) return null;

    // If conversation has a name, use it
    if (conv.name) return conv.name;

    const participants = conv.participants || [];

    const getName = (p) => {
      if (!p) return null;
      if (typeof p === "string") return p;
      return (
        p.username ||
        p.user?.username ||
        p.name ||
        p.full_name ||
        p.email ||
        (p.id != null ? String(p.id) : null)
      );
    };

    for (const p of participants) {
      const name = getName(p);
      if (!name) continue;

      if (String(name) !== String(currentUserKey)) {
        return name; // other participant
      }
    }

    return `Chat ${conv.id}`;
  }
  const currentConv = conversations.find(
    (c) => String(c.id) === String(activeConversation)
  );

  const currentUserKey = String(user?.username ?? user?.id ?? "");
  const headerTitle = getConversationTitle(
    currentConv,
    currentUserKey,
    headerTitleOverride
  );

  // WebSocket Connection Logic

  const accessToken = useSelector((s) => s.auth.accessToken);
  const convId = currentConv?.id;

  useEffect(() => {
    if (!accessToken || !convId) return;

    webSocketService.connect(accessToken, convId);

    return () => {
      // normal cleanup, allows reconnect later
      webSocketService.disconnect();
    };
  }, [accessToken, convId]);

  useEffect(() => {
      const handleWsMessage = (data) => {
        if (data.type === "conversation_updated") {
          dispatch(fetchMessages(data.conversation_id));
          dispatch(fetchConversations());
      }
  }
      webSocketService.on("message", handleWsMessage);
      return () => {
        webSocketService.off("message", handleWsMessage);
      }
}, [dispatch]);

  return {
    conversations,
    messagesMap,
    chatStatus,
    user,
    headerTitle,
    activeConversation,
    setActiveConversation,
    headerTitleOverride,
    setHeaderTitleOverride,
    handleStartConversation,
    handleSendMessage,
    activeMessages,
    scrollRef,
  };
}
