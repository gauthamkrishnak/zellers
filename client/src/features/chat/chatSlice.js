import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://127.0.0.1:8000/chat";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/conversations`, { headers: authHeader() });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchConversationDetails = createAsyncThunk(
  "chat/fetchConversationDetails",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/conversations/${conversationId}`, {
        headers: authHeader(),
      });
      return data; // { conversation, messages }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async ({ productId, initialMessage }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/conversations`,
        { product_id: productId, initial_message: initialMessage },
        { headers: authHeader() }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const acceptConversation = createAsyncThunk(
  "chat/acceptConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE}/conversations/${conversationId}/accept`, {}, { headers: authHeader() });
      return { conversation_id: conversationId, status: "ACTIVE" };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const rejectConversation = createAsyncThunk(
  "chat/rejectConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE}/conversations/${conversationId}/reject`, {}, { headers: authHeader() });
      return { conversation_id: conversationId, status: "REJECTED" };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendMessageRest = createAsyncThunk(
  "chat/sendMessageRest",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/messages`,
        { conversation_id: conversationId, content },
        { headers: authHeader() }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    status: "idle",
    detailStatus: "idle",
    error: null,
  },
  reducers: {
    receiveMessage(state, action) {
      const msg = action.payload;
      // Append to open conversation
      if (state.activeConversation?.id === msg.conversation_id) {
        const alreadyExists = state.messages.some((m) => m.id === msg.id);
        if (!alreadyExists) state.messages.push(msg);
      }
      // Update preview in list
      const conv = state.conversations.find((c) => c.id === msg.conversation_id);
      if (conv) {
        conv.last_message = msg.content;
        conv.last_message_time = msg.created_at;
        conv.last_sender_id = msg.sender_id;
      }
    },
    updateConversationStatus(state, action) {
      const { conversation_id, status } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversation_id);
      if (conv) conv.status = status;
      if (state.activeConversation?.id === conversation_id) {
        state.activeConversation.status = status;
      }
    },
    clearActiveConversation(state) {
      state.activeConversation = null;
      state.messages = [];
      state.detailStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.status = "loading"; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchConversationDetails.pending, (state) => { state.detailStatus = "loading"; })
      .addCase(fetchConversationDetails.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.activeConversation = action.payload.conversation;
        state.messages = action.payload.messages;
      })
      .addCase(fetchConversationDetails.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload;
      })

      .addCase(startConversation.fulfilled, (state, action) => {
        const existing = state.conversations.find((c) => c.id === action.payload.id);
        if (!existing) state.conversations.unshift(action.payload);
      })

      .addCase(acceptConversation.fulfilled, (state, action) => {
        const { conversation_id, status } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversation_id);
        if (conv) conv.status = status;
        if (state.activeConversation?.id === conversation_id) state.activeConversation.status = status;
      })

      .addCase(rejectConversation.fulfilled, (state, action) => {
        const { conversation_id, status } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversation_id);
        if (conv) conv.status = status;
        if (state.activeConversation?.id === conversation_id) state.activeConversation.status = status;
      })

      .addCase(sendMessageRest.fulfilled, (state, action) => {
        const msg = action.payload;
        if (state.activeConversation?.id === msg.conversation_id) {
          const alreadyExists = state.messages.some((m) => m.id === msg.id);
          if (!alreadyExists) state.messages.push(msg);
        }
      });
  },
});

export const { receiveMessage, updateConversationStatus, clearActiveConversation } = chatSlice.actions;
export default chatSlice.reducer;
