import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchConversations } from "../../../appFeatures/chat/chatSlice";
import webSocketService from "../../../api/websocketService";

export default function useChatListSocket() {
  const dispatch = useDispatch();
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    // ✅ Connect once for user-level updates (unread, new chats)
    // "list" is just a dummy room; backend routes by user group
    webSocketService.connect(accessToken, "list");

    const handleMessage = (data) => {
      if (!data?.type) return;
        if (data.type === "chat_list_update" || data.type === "conversation_updated" ) {
          dispatch(fetchConversations());
        }
    };
    webSocketService.on("message", handleMessage);
    return () => {
      webSocketService.off("message", handleMessage);
    }
  }, [accessToken, dispatch]);
}
