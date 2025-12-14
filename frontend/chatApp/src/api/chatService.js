import apiClient from "./apiClient";

class ChatService {
  async getConversations() {
    const res = await apiClient.get("/conversations/");
    return res.data;
  }

  async startConversation(body) {
    const res = await apiClient.post("/conversations/", body);
    return res.data;
  }

  async getMessages(conversationId) {
    const res = await apiClient.get(
      `/conversations/${conversationId}/messages/`
    );
    return res.data;
  }

  async sendMessage(conversationId, text) {
    const res = await apiClient.post(
      `/conversations/${conversationId}/messages/`,
      {
        content: text,
      }
    );
    return res.data;
  }

  async markRead(conversationId) {
    const res = await apiClient.post(
      `/conversations/${conversationId}/mark_read/`
    );
    return res.data;
  }

  async searchUsers(query, options = {}) {
    const res = await apiClient.get("/users/search/", {
      params: { query },
      ...options,
    });
    return res.data;
  }

  async deleteMessageForMe(messageId) {
    const res = await apiClient.post(`/message/${messageId}/delete-for-me/`);
    return res.data;
  }

  async hideConversation(conversationId) {
    const res = await apiClient.post(
      `conversation/${conversationId}/hide-for-me/`
    );
    return res.data;
  }
}

const chatService = new ChatService();
export default chatService;
