import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../../api/chatService";

// for error
function normalizeError(err) {
  return {
    status: err?.response?.status ?? null,
    message:
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Unknown error",
    details: err?.response?.data ?? null,
  };
}

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      return {
        conversationId,
        messages: await chatService.getMessages(conversationId),
      };
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const sendMessages = createAsyncThunk(
  "chat/sendmessages",
  async ({ conversationId, text }, { rejectWithValue }) => {
    try {
      const message = await chatService.sendMessage(conversationId, text);
      return { conversationId, message };
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const fetchMarkRead = createAsyncThunk(
  "chat/fetchMarkRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      return await chatService.markRead(conversationId);
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query, { rejectWithValue, signal }) => {
    try {
      // backend expects query param 'query'
      const data = await chatService.searchUsers(query, { signal });
      return data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async (body, { rejectWithValue }) => {
    try {
      const data = await chatService.startConversation(body);
      return data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const deleteMessageForMe = createAsyncThunk(
  "chat/deleteMessageForMe",
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      await chatService.deleteMessageForMe(messageId);
      return { messageId, conversationId };
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);
export const hideConversation = createAsyncThunk(
  "chat/hideConversation",
  async (conversationId, { rejectWithValue }) => {
    if (!conversationId) {
      return rejectWithValue({ message: "conversationId is required" });
    }
    try {
      await chatService.hideConversation(conversationId);
      return { conversationId };
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    searchResults: [],
    searchStatus: "idle",
    searchError: null,
    messages: {},
    status: "idle",
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const message = action.payload;
      // Ensure we have a conversation ID
      const conversationId = message.conversation || message.conversation_id;
      if (!conversationId) {
        console.error("chatSlice: No conversation ID in message");
        return;
      }

      const id = String(conversationId);

      if (!state.messages[id]) {
        state.messages[id] = [message];
        return;
      }

      const current = state.messages[id];

      // Helper to check for duplicates
      const isDuplicate = (list) =>
        list.some((m) => String(m.id) === String(message.id));

      // Handle array structure
      if (Array.isArray(current)) {
        if (!isDuplicate(current)) {
          current.push(message);
        }
      }
      // Handle paginated structure { results: [...] }
      else if (current && Array.isArray(current.results)) {
        if (!isDuplicate(current.results)) {
          current.results.push(message);
        }
      }
      // Fallback: replace with array if structure is unexpected
      else {
        state.messages[id] = [message];
      }
    },

    // Chat list updates can be handled here as needed
    chatListUpdated: (state, action) => {
      const { conversation_id, unread_count } = action.payload;

      const conv = state.conversations.find(
        (c) => String(c.id) === String(conversation_id)
      );

      if (conv) {
        conv.unread_count = unread_count;
      } else {
        // new conversation arrives via first message
        state.conversations.unshift({
          id: conversation_id,
          unread_count,
          last_message: null,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { conversationId, messages } = action.payload;
        const id = String(conversationId);
        let incoming = [];
        // normalize stored messages to always be an array
        if (Array.isArray(messages)) incoming = messages;
        else if (messages && Array.isArray(messages.messages))
          incoming = messages.messages;
        else incoming = [];

        // replace with fresh server messages (no merge to avoid duplicates)
        state.messages[id] = incoming;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      // sendMessages
      .addCase(sendMessages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(sendMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { conversationId, message } = action.payload;
        const id = String(conversationId);
        if (!state.messages[id]) {
          state.messages[id] = [message];
          return;
        }
        const current = state.messages[id];
        // if it's array, append if not duplicate
        if (Array.isArray(current)) {
          if (!current.some((m) => String(m.id) === String(message.id))) {
            current.push(message);
          } else {
            // if server sent an updated version, replace it
            const idx = current.findIndex(
              (m) => String(m.id) === String(message.id)
            );
            if (idx !== -1) current[idx] = message;
          }
          return;
        }
        // if it's paginated shape { results: [...] }, append there
        if (current && Array.isArray(current.results)) {
          if (
            !current.results.some((m) => String(m.id) === String(message.id))
          ) {
            current.results.push(message);
          } else {
            const idx = current.results.findIndex(
              (m) => String(m.id) === String(message.id)
            );
            if (idx !== -1) current.results[idx] = message;
          }
          return;
        }
        // unexpected shape: replace with array preserving anything with ids
        const recovered = [];
        for (const k in current) {
          const v = current[k];
          if (v && typeof v === "object" && v.id != null) recovered.push(v);
        }
        if (!recovered.some((m) => String(m.id) === String(message.id)))
          recovered.push(message);
        state.messages[id] = recovered.length ? recovered : [message];
      })

      .addCase(sendMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      // fetchMarkRead
      .addCase(fetchMarkRead.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMarkRead.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { conversationId, messages } = action.payload || {};
        if (conversationId && messages) {
          state.messages[conversationId] = messages;
        }
      })
      .addCase(fetchMarkRead.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      .addCase(searchUsers.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload ?? {
          message: action.error?.message ?? "Search failed",
        };
        state.searchResults = [];
      })

      // startConversation
      .addCase(startConversation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.status = "succeeded";
        const conv = action.payload;
        // Add new conversation to list if not already there
        const exists = state.conversations.some((c) => c.id === conv.id);
        if (!exists) {
          state.conversations.unshift(conv);
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      })

      //  deleteMessageForMe
      .addCase(deleteMessageForMe.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        // remove message from all conversations where it exists
        for (const convId in state.messages) {
          state.messages[convId] = state.messages[convId].filter(
            (m) => String(m.id) !== String(messageId)
          );
        }
      })
      .addCase(deleteMessageForMe.rejected, (state, action) => {
        state.error = action.payload || action.error?.message;
      })

      // hide conversation
      .addCase(hideConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        // remove conversation from list
        state.conversations = state.conversations.filter(
          (c) => String(c.id) !== String(conversationId)
        );
        // optionally: clear its messages from state
        delete state.messages[String(conversationId)];
      })
      .addCase(hideConversation.rejected, (state, action) => {
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { addMessage, chatListUpdated } = chatSlice.actions;
export default chatSlice.reducer;
