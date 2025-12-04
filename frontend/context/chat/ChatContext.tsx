"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  chatApi,
  ConversationDto,
  MessageDto,
  PresenceDto,
} from "../../services/chat/chatApi";
import { socketService, SocketEvents } from "../../services/chat/socketService";

export interface ChatState {
  // Conversations
  conversations: ConversationDto[];
  activeConversation: ConversationDto | null;

  // Messages
  messages: Record<string, MessageDto[]>;
  loadingMessages: Record<string, boolean>;

  // Typing indicators
  typingUsers: Record<string, Set<string>>;

  // Presence
  presence: Record<string, PresenceDto>;

  // UI State
  isConnected: boolean;
  currentWorkspace: string | null;
  isJoiningWorkspace: boolean;
  showSidebar: boolean;
  showThreadPanel: boolean;
  activeThread: MessageDto | null;

  // Loading states
  loadingConversations: boolean;
  sendingMessage: boolean;

  // Search
  searchResults: MessageDto[];
  searchQuery: string;
  isSearching: boolean;
}

export type ChatAction =
  | { type: "SET_WORKSPACE"; payload: string }
  | { type: "SET_CONVERSATIONS"; payload: ConversationDto[] }
  | { type: "ADD_CONVERSATION"; payload: ConversationDto }
  | { type: "UPDATE_CONVERSATION"; payload: ConversationDto }
  | { type: "REMOVE_CONVERSATION"; payload: string }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: ConversationDto | null }
  | {
      type: "SET_MESSAGES";
      payload: { conversationId: string; messages: MessageDto[] };
    }
  | {
      type: "ADD_MESSAGE";
      payload: { conversationId: string; message: MessageDto };
    }
  | {
      type: "UPDATE_MESSAGE";
      payload: { conversationId: string; message: MessageDto };
    }
  | {
      type: "REMOVE_MESSAGE";
      payload: { conversationId: string; messageId: string };
    }
  | {
      type: "SET_TYPING_USERS";
      payload: { conversationId: string; users: Set<string> };
    }
  | {
      type: "ADD_TYPING_USER";
      payload: { conversationId: string; userId: string };
    }
  | {
      type: "REMOVE_TYPING_USER";
      payload: { conversationId: string; userId: string };
    }
  | { type: "SET_PRESENCE"; payload: PresenceDto[] }
  | { type: "UPDATE_PRESENCE"; payload: PresenceDto }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "SET_JOINING_WORKSPACE"; payload: boolean }
  | { type: "SET_LOADING_CONVERSATIONS"; payload: boolean }
  | {
      type: "SET_LOADING_MESSAGES";
      payload: { conversationId: string; loading: boolean };
    }
  | { type: "SET_SENDING_MESSAGE"; payload: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_THREAD_PANEL" }
  | { type: "SET_ACTIVE_THREAD"; payload: MessageDto | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: MessageDto[] }
  | { type: "SET_SEARCHING"; payload: boolean }
  | { type: "CLEAR_SEARCH" };

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loadingMessages: {},
  typingUsers: {},
  presence: {},
  isConnected: false,
  currentWorkspace: null,
  isJoiningWorkspace: false,
  showSidebar: true,
  showThreadPanel: false,
  activeThread: null,
  loadingConversations: false,
  sendingMessage: false,
  searchResults: [],
  searchQuery: "",
  isSearching: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_WORKSPACE":
      return {
        ...state,
        currentWorkspace: action.payload,
        conversations: [],
        activeConversation: null,
        messages: {},
      };

    case "SET_CONVERSATIONS":
      return {
        ...state,
        conversations: action.payload,
        loadingConversations: false,
      };

    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [
          action.payload,
          ...state.conversations.filter((c) => c.id !== action.payload.id),
        ],
      };

    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
        activeConversation:
          state.activeConversation?.id === action.payload.id
            ? action.payload
            : state.activeConversation,
      };

    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(
          (c) => c.id !== action.payload,
        ),
        activeConversation:
          state.activeConversation?.id === action.payload
            ? null
            : state.activeConversation,
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(
            ([key]) => key !== action.payload,
          ),
        ),
      };

    case "SET_ACTIVE_CONVERSATION":
      return {
        ...state,
        activeConversation: action.payload,
        activeThread: null,
        showThreadPanel: false,
      };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
        loadingMessages: {
          ...state.loadingMessages,
          [action.payload.conversationId]: false,
        },
      };

    case "ADD_MESSAGE":
      const existingMessages =
        state.messages[action.payload.conversationId] || [];
      const messageExists = existingMessages.some(
        (m) => m.id === action.payload.message.id,
      );

      if (messageExists) {
        return state;
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            ...existingMessages,
            action.payload.message,
          ],
        },
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: (
            state.messages[action.payload.conversationId] || []
          ).map((m) =>
            m.id === action.payload.message.id ? action.payload.message : m,
          ),
        },
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: (
            state.messages[action.payload.conversationId] || []
          ).filter((m) => m.id !== action.payload.messageId),
        },
      };

    case "SET_TYPING_USERS":
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: action.payload.users,
        },
      };

    case "ADD_TYPING_USER":
      const currentTypers =
        state.typingUsers[action.payload.conversationId] || new Set();
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: new Set([
            ...currentTypers,
            action.payload.userId,
          ]),
        },
      };

    case "REMOVE_TYPING_USER":
      const updatedTypers = new Set(
        state.typingUsers[action.payload.conversationId] || new Set(),
      );
      updatedTypers.delete(action.payload.userId);
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: updatedTypers,
        },
      };

    case "SET_PRESENCE":
      const presenceMap = action.payload.reduce(
        (acc, p) => {
          acc[p.userId] = p;
          return acc;
        },
        {} as Record<string, PresenceDto>,
      );
      return {
        ...state,
        presence: presenceMap,
      };

    case "UPDATE_PRESENCE":
      return {
        ...state,
        presence: {
          ...state.presence,
          [action.payload.userId]: action.payload,
        },
      };

    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        isConnected: action.payload,
      };

    case "SET_JOINING_WORKSPACE":
      return {
        ...state,
        isJoiningWorkspace: action.payload,
      };

    case "SET_LOADING_CONVERSATIONS":
      return {
        ...state,
        loadingConversations: action.payload,
      };

    case "SET_LOADING_MESSAGES":
      return {
        ...state,
        loadingMessages: {
          ...state.loadingMessages,
          [action.payload.conversationId]: action.payload.loading,
        },
      };

    case "SET_SENDING_MESSAGE":
      return {
        ...state,
        sendingMessage: action.payload,
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        showSidebar: !state.showSidebar,
      };

    case "TOGGLE_THREAD_PANEL":
      return {
        ...state,
        showThreadPanel: !state.showThreadPanel,
      };

    case "SET_ACTIVE_THREAD":
      return {
        ...state,
        activeThread: action.payload,
        showThreadPanel: action.payload !== null,
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };

    case "SET_SEARCH_RESULTS":
      return {
        ...state,
        searchResults: action.payload,
        isSearching: false,
      };

    case "SET_SEARCHING":
      return {
        ...state,
        isSearching: action.payload,
      };

    case "CLEAR_SEARCH":
      return {
        ...state,
        searchQuery: "",
        searchResults: [],
        isSearching: false,
      };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;

  // Actions
  setWorkspace: (workspaceId: string) => Promise<void>;
  loadConversations: (workspaceId: string) => Promise<void>;
  createConversation: (data: any) => Promise<ConversationDto | null>;
  selectConversation: (conversation: ConversationDto) => Promise<void>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    replyToId?: string,
  ) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  addReaction: (
    messageId: string,
    emoji: string,
    conversationId: string,
  ) => Promise<void>;
  markAsRead: (conversationId: string, messageId?: string) => Promise<void>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  updatePresence: (status: string, workspaceId: string) => Promise<void>;
  searchMessages: (query: string, workspaceId: string) => Promise<void>;
  openThread: (message: MessageDto) => void;
  closeThread: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Socket event handlers
  const setupSocketListeners = useCallback(() => {
    socketService.on("message:new", ({ message, conversationId }) => {
      dispatch({ type: "ADD_MESSAGE", payload: { conversationId, message } });

      // Update conversation's last message
      const conversation = state.conversations.find(
        (c) => c.id === conversationId,
      );
      if (conversation) {
        dispatch({
          type: "UPDATE_CONVERSATION",
          payload: { ...conversation, lastMessage: message },
        });
      }
    });

    socketService.on("message:edit", ({ message }) => {
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { conversationId: message.conversationId, message },
      });
    });

    socketService.on("message:delete", ({ messageId, conversationId }) => {
      dispatch({
        type: "REMOVE_MESSAGE",
        payload: { conversationId, messageId },
      });
    });

    socketService.on("message:reaction", ({ message }) => {
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { conversationId: message.conversationId, message },
      });
    });

    socketService.on("typing:start", ({ userId, conversationId }) => {
      dispatch({
        type: "ADD_TYPING_USER",
        payload: { conversationId, userId },
      });
    });

    socketService.on("typing:stop", ({ userId, conversationId }) => {
      dispatch({
        type: "REMOVE_TYPING_USER",
        payload: { conversationId, userId },
      });
    });

    socketService.on("conversation:new", ({ conversation }) => {
      dispatch({ type: "ADD_CONVERSATION", payload: conversation });
    });

    socketService.on(
      "conversation:updated",
      ({ conversationId, lastMessage }) => {
        const conversation = state.conversations.find(
          (c) => c.id === conversationId,
        );
        if (conversation && lastMessage) {
          dispatch({
            type: "UPDATE_CONVERSATION",
            payload: { ...conversation, lastMessage },
          });
        }
      },
    );

    socketService.on(
      "presence_update",
      ({ userId, status, workspaceId, lastSeen }) => {
        const existingPresence = state.presence[userId];
        dispatch({
          type: "UPDATE_PRESENCE",
          payload: {
            userId,
            workspaceId,
            status,
            lastSeen: lastSeen || new Date().toISOString(),
            user: existingPresence?.user || {
              id: userId,
              name: "",
              avatarUrl: null,
            },
          },
        });
      },
    );
  }, [state.conversations, state.presence]);

  useEffect(() => {
    let connectionInterval: NodeJS.Timeout;
    let cleanupFn: (() => void) | undefined;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      // First validate the token before attempting WebSocket connection
      const validateTokenAndConnect = async () => {
        try {
          // Test if token is valid
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/users/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            // Token is valid, proceed with WebSocket connection
            socketService.connect(token);
            setupSocketListeners();

            // Set up connection status monitoring
            const checkConnection = () => {
              const isConnected = socketService.isConnected();
              dispatch({ type: "SET_CONNECTION_STATUS", payload: isConnected });
            };

            // Initial check after connection attempt
            setTimeout(checkConnection, 1000);

            // Set up periodic connection check (less frequent to avoid spam)
            connectionInterval = setInterval(checkConnection, 10000);

            cleanupFn = () => {
              clearInterval(connectionInterval);
              socketService.disconnect();
            };
          } else {
            // Token is invalid, clear it and don't attempt WebSocket connection
            console.warn("Invalid token, clearing auth data");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
        }
      };

      validateTokenAndConnect();
    } else {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
    }

    // Return cleanup function
    return () => {
      if (connectionInterval) {
        clearInterval(connectionInterval);
      }
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [setupSocketListeners]);

  // Actions
  const setWorkspace = async (workspaceId: string) => {
    // Prevent duplicate calls
    if (state.isJoiningWorkspace || state.currentWorkspace === workspaceId) {
      console.log(
        "Already joining workspace or workspace already active:",
        workspaceId,
      );
      return;
    }

    dispatch({ type: "SET_JOINING_WORKSPACE", payload: true });

    try {
      dispatch({ type: "SET_WORKSPACE", payload: workspaceId });
      await loadConversations(workspaceId);
      await socketService.joinWorkspace(workspaceId);

      // Load presence
      try {
        const presence = await chatApi.getPresence(workspaceId);
        dispatch({ type: "SET_PRESENCE", payload: presence });
      } catch (error) {
        console.error("Failed to load presence:", error);
      }
    } finally {
      dispatch({ type: "SET_JOINING_WORKSPACE", payload: false });
    }
  };

  const loadConversations = async (workspaceId: string) => {
    dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
    try {
      const conversations = await chatApi.getConversations({ workspaceId });
      dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: false });
    }
  };

  const createConversation = async (
    data: any,
  ): Promise<ConversationDto | null> => {
    try {
      const conversation = await chatApi.createConversation(data);
      dispatch({ type: "ADD_CONVERSATION", payload: conversation });
      return conversation;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  };

  const selectConversation = async (conversation: ConversationDto) => {
    dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversation });
    await loadMessages(conversation.id);
    await socketService.joinConversation(conversation.id);
  };

  const loadMessages = async (conversationId: string, page = 1) => {
    dispatch({
      type: "SET_LOADING_MESSAGES",
      payload: { conversationId, loading: true },
    });
    try {
      const messages = await chatApi.getMessages(conversationId, {
        page,
        limit: 50,
      });
      dispatch({ type: "SET_MESSAGES", payload: { conversationId, messages } });
    } catch (error) {
      console.error("Failed to load messages:", error);
      dispatch({
        type: "SET_LOADING_MESSAGES",
        payload: { conversationId, loading: false },
      });
    }
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    replyToId?: string,
  ) => {
    dispatch({ type: "SET_SENDING_MESSAGE", payload: true });
    try {
      await socketService.sendMessage({
        conversationId,
        content,
        replyToId,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      dispatch({ type: "SET_SENDING_MESSAGE", payload: false });
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      await socketService.editMessage({ messageId, content });
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const deleteMessage = async (messageId: string, conversationId: string) => {
    try {
      await socketService.deleteMessage({ messageId, conversationId });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const addReaction = async (
    messageId: string,
    emoji: string,
    conversationId: string,
  ) => {
    try {
      await socketService.addReaction({ messageId, emoji, conversationId });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const markAsRead = async (conversationId: string, messageId?: string) => {
    try {
      await socketService.markAsRead({ conversationId, messageId });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const startTyping = (conversationId: string) => {
    socketService.startTyping(conversationId);
  };

  const stopTyping = (conversationId: string) => {
    socketService.stopTyping(conversationId);
  };

  const updatePresence = async (status: string, workspaceId: string) => {
    try {
      await socketService.updatePresence({ status, workspaceId });
    } catch (error) {
      console.error("Failed to update presence:", error);
    }
  };

  const searchMessages = async (query: string, workspaceId: string) => {
    if (!query.trim()) {
      dispatch({ type: "CLEAR_SEARCH" });
      return;
    }

    dispatch({ type: "SET_SEARCHING", payload: true });
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });

    try {
      const results = await chatApi.searchMessages({
        query: query.trim(),
        workspaceId,
      });
      dispatch({ type: "SET_SEARCH_RESULTS", payload: results });
    } catch (error) {
      console.error("Failed to search messages:", error);
      dispatch({ type: "SET_SEARCHING", payload: false });
    }
  };

  const openThread = (message: MessageDto) => {
    dispatch({ type: "SET_ACTIVE_THREAD", payload: message });
  };

  const closeThread = () => {
    dispatch({ type: "SET_ACTIVE_THREAD", payload: null });
  };

  const contextValue: ChatContextType = {
    state,
    dispatch,
    setWorkspace,
    loadConversations,
    createConversation,
    selectConversation,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markAsRead,
    startTyping,
    stopTyping,
    updatePresence,
    searchMessages,
    openThread,
    closeThread,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
