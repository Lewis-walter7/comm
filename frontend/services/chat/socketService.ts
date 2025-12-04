import { io, Socket } from "socket.io-client";
import { MessageDto, ConversationDto, PresenceDto } from "./chatApi";

export interface SocketEvents {
  // Connection events
  connection: { status: string; userId: string };

  // Message events
  "message:new": { message: MessageDto; conversationId: string };
  "message:edit": { message: MessageDto };
  "message:delete": { messageId: string; conversationId: string };
  "message:reaction": { message: MessageDto };
  "message:read": {
    userId: string;
    conversationId: string;
    messageId?: string;
    readAt: string;
  };

  // Typing events
  "typing:start": { userId: string; conversationId: string };
  "typing:stop": { userId: string; conversationId: string };

  // Conversation events
  "conversation:new": { conversation: ConversationDto };
  "conversation:updated": {
    conversationId: string;
    lastMessage?: MessageDto;
    updatedAt: string;
    updates?: any;
  };

  // Member events
  "member:joined": { conversationId: string; member: any };
  "member:left": { conversationId: string; userId: string };

  // Presence events
  presence_update: {
    userId: string;
    status: string;
    workspaceId: string;
    lastSeen?: string;
  };
}

export type SocketEventHandler<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private lastWorkspaceJoin = 0;
  private workspaceJoinDelay = 1000; // 1 second minimum between joins

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    this.socket = io(`${socketUrl}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 5000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
    this.reconnectAttempts = 0;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      // Only reconnect for server-side disconnects, not auth errors
      if (
        reason === "io server disconnect" &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);

      // Check if it's an authentication error
      if (
        error?.message?.includes("Authentication") ||
        error?.message?.includes("Unauthorized") ||
        error?.type === "UnauthorizedError"
      ) {
        console.warn("Authentication error, stopping reconnection attempts");
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        return; // Don't attempt to reconnect on auth errors
      }

      // Only retry for non-auth errors
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    });

    // Set up event forwarding
    Object.keys(this.getDefaultEventHandlers()).forEach((event) => {
      this.socket!.on(event, (data) => {
        this.emitLocal(event, data);
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        // Check if we still have a valid token before reconnecting
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        if (!token) {
          console.log("No token available, stopping reconnection attempts");
          return;
        }

        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.log("Max reconnection attempts reached");
    }
  }

  // Event handling
  on<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEventHandler<SocketEvents[K]>,
  ) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEventHandler<SocketEvents[K]>,
  ) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  private emitLocal(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in socket event handler for ${event}:`, error);
        }
      });
    }
  }

  private getDefaultEventHandlers() {
    return {
      connection: () => {},
      "message:new": () => {},
      "message:edit": () => {},
      "message:delete": () => {},
      "message:reaction": () => {},
      "message:read": () => {},
      "typing:start": () => {},
      "typing:stop": () => {},
      "conversation:new": () => {},
      "conversation:updated": () => {},
      "member:joined": () => {},
      "member:left": () => {},
      presence_update: () => {},
    };
  }

  // WebSocket message sending
  async joinWorkspace(workspaceId: string) {
    // Rate limiting to prevent rapid successive calls
    const now = Date.now();
    const timeSinceLastJoin = now - this.lastWorkspaceJoin;

    if (timeSinceLastJoin < this.workspaceJoinDelay) {
      console.log(
        `Rate limiting workspace join, waiting ${this.workspaceJoinDelay - timeSinceLastJoin}ms`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, this.workspaceJoinDelay - timeSinceLastJoin),
      );
    }

    this.lastWorkspaceJoin = Date.now();
    return this.emit("join_workspace", { workspaceId });
  }

  async joinConversation(conversationId: string) {
    return this.emit("join_conversation", { conversationId });
  }

  async leaveConversation(conversationId: string) {
    return this.emit("leave_conversation", { conversationId });
  }

  async sendMessage(data: {
    conversationId: string;
    content: string;
    replyToId?: string;
    attachments?: any[];
  }) {
    return this.emit("send_message", data);
  }

  async editMessage(data: { messageId: string; content: string }) {
    return this.emit("edit_message", data);
  }

  async deleteMessage(data: { messageId: string; conversationId: string }) {
    return this.emit("delete_message", data);
  }

  async addReaction(data: {
    messageId: string;
    emoji: string;
    conversationId: string;
  }) {
    return this.emit("add_reaction", data);
  }

  async startTyping(conversationId: string) {
    return this.emit("typing_start", { conversationId, isTyping: true });
  }

  async stopTyping(conversationId: string) {
    return this.emit("typing_stop", { conversationId, isTyping: false });
  }

  async markAsRead(data: { conversationId: string; messageId?: string }) {
    return this.emit("mark_as_read", data);
  }

  async updatePresence(data: { status: string; workspaceId: string }) {
    return this.emit("update_presence", data);
  }

  // Helper to send events with Promise-like interface
  private emit(
    event: string,
    data: any,
  ): Promise<{ status: string; data?: any; message?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({ status: "error", message: "Socket not connected" });
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        resolve(response || { status: "ok" });
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ status: "timeout", message: "Request timed out" });
      }, 5000);
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
