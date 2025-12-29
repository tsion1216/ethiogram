import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.user = null;
    this.groups = new Map(); // Store groups locally
    this.users = new Map(); // Store online users
  }

  connect(userData) {
    if (!this.socket) {
      this.user = userData;
      this.socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
        query: {
          userId: userData.id || Date.now(),
          name: userData.name,
          avatar: userData.avatar,
        },
        auth: {
          token: userData.token || null,
        },
      });

      this.setupEventListeners();
    }
    return this.socket;
  }

  setupEventListeners() {
    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      this.isConnected = true;

      // Register user
      this.socket.emit("user_joined", this.user);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from chat server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // User events
    this.socket.on("user_joined", (user) => {
      console.log(`${user.name} joined the chat`);
      this.users.set(user.id, user);
    });

    this.socket.on("user_left", (user) => {
      console.log(`${user.name} left the chat`);
      this.users.delete(user.id);
    });

    this.socket.on("online_users", (users) => {
      this.users = new Map(users.map((user) => [user.id, user]));
    });

    // Message events
    this.socket.on("receive_message", (message) => {
      console.log("📩 New message received:", message);
    });

    this.socket.on("message_sent", (message) => {
      console.log("✅ Message sent successfully:", message);
    });

    this.socket.on("message_deleted", ({ messageId, deletedBy }) => {
      console.log(`🗑️ Message ${messageId} deleted by ${deletedBy}`);
    });

    this.socket.on("message_edited", ({ messageId, newText, editedBy }) => {
      console.log(`✏️ Message ${messageId} edited by ${editedBy}`);
    });

    // Group events
    this.socket.on("group_created", (group) => {
      console.log("👥 Group created:", group.name);
      this.groups.set(group.id, group);
    });

    this.socket.on("group_updated", (group) => {
      console.log("🔄 Group updated:", group.name);
      this.groups.set(group.id, group);
    });

    this.socket.on("group_deleted", (groupId) => {
      console.log("🗑️ Group deleted:", groupId);
      this.groups.delete(groupId);
    });

    this.socket.on("user_added_to_group", ({ groupId, user, addedBy }) => {
      console.log(`➕ ${user.name} added to group by ${addedBy}`);
    });

    this.socket.on(
      "user_removed_from_group",
      ({ groupId, user, removedBy }) => {
        console.log(`➖ ${user.name} removed from group by ${removedBy}`);
      }
    );

    this.socket.on("group_members", ({ groupId, members }) => {
      console.log(`👥 Group ${groupId} members:`, members);
    });

    this.socket.on("admin_added", ({ groupId, user, addedBy }) => {
      console.log(`👑 ${user.name} promoted to admin by ${addedBy}`);
    });

    this.socket.on("admin_removed", ({ groupId, user, removedBy }) => {
      console.log(`👑 ${user.name} demoted from admin by ${removedBy}`);
    });

    this.socket.on(
      "group_settings_updated",
      ({ groupId, settings, updatedBy }) => {
        console.log(`⚙️ Group ${groupId} settings updated by ${updatedBy}`);
      }
    );

    // Announcement events
    this.socket.on("announcement_sent", ({ groupId, announcement, sender }) => {
      console.log(
        `📢 Announcement in group ${groupId} from ${sender.name}:`,
        announcement.text
      );
    });

    // Typing indicators
    this.socket.on("user_started_typing", ({ userId, userName, chatId }) => {
      console.log(`⌨️ ${userName} is typing in chat ${chatId}`);
    });

    this.socket.on("user_stopped_typing", ({ userId, userName, chatId }) => {
      console.log(`⌨️ ${userName} stopped typing in chat ${chatId}`);
    });

    // Reaction events
    this.socket.on("reaction_added", ({ messageId, emoji, user }) => {
      console.log(
        `😊 ${user.name} reacted with ${emoji} to message ${messageId}`
      );
    });

    this.socket.on("reaction_removed", ({ messageId, emoji, user }) => {
      console.log(
        `😊 ${user.name} removed ${emoji} reaction from message ${messageId}`
      );
    });

    // Error events
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("group_error", ({ error, groupId }) => {
      console.error(`Group ${groupId} error:`, error);
    });

    this.socket.on("permission_denied", ({ action, reason }) => {
      console.error(`Permission denied for ${action}:`, reason);
    });
  }

  // User Methods
  updateProfile(profileData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("update_profile", profileData);
    }
  }

  setStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit("set_status", status);
    }
  }

  // Message Methods
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_message", {
        ...messageData,
        senderId: this.socket.id,
        timestamp: new Date().toISOString(),
      });
    }
  }

  deleteMessage(messageId, chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("delete_message", { messageId, chatId });
    }
  }

  editMessage(messageId, chatId, newText) {
    if (this.socket && this.isConnected) {
      this.socket.emit("edit_message", { messageId, chatId, newText });
    }
  }

  reactToMessage(messageId, chatId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit("add_reaction", { messageId, chatId, emoji });
    }
  }

  removeReaction(messageId, chatId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit("remove_reaction", { messageId, chatId, emoji });
    }
  }

  // Typing Indicators
  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("start_typing", chatId);
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop_typing", chatId);
    }
  }

  // Group Methods
  createGroup(groupData) {
    if (this.socket && this.isConnected) {
      const group = {
        ...groupData,
        id: `group-${Date.now()}`,
        createdAt: new Date().toISOString(),
        admin: this.socket.id,
        members: [this.socket.id],
      };
      this.socket.emit("create_group", group);
      return group.id;
    }
  }

  joinGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join_group", groupId);
    }
  }

  leaveGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave_group", groupId);
    }
  }

  deleteGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("delete_group", groupId);
    }
  }

  addMembersToGroup(groupId, memberIds) {
    if (this.socket && this.isConnected) {
      this.socket.emit("add_members", { groupId, memberIds });
    }
  }

  removeMemberFromGroup(groupId, memberId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("remove_member", { groupId, memberId });
    }
  }

  promoteToAdmin(groupId, memberId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("add_admin", { groupId, memberId });
    }
  }

  demoteFromAdmin(groupId, memberId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("remove_admin", { groupId, memberId });
    }
  }

  updateGroupSettings(groupId, settings) {
    if (this.socket && this.isConnected) {
      this.socket.emit("update_group_settings", { groupId, settings });
    }
  }

  getGroupMembers(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("get_group_members", groupId);
    }
  }

  getGroupInfo(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("get_group_info", groupId);
    }
  }

  // Announcement Methods
  sendAnnouncement(groupId, text) {
    if (this.socket && this.isConnected) {
      const announcement = {
        groupId,
        text,
        senderId: this.socket.id,
        timestamp: new Date().toISOString(),
        isAnnouncement: true,
      };
      this.socket.emit("send_announcement", announcement);
    }
  }

  // Chat Management
  joinChat(chatId, chatType = "private") {
    if (this.socket && this.isConnected) {
      this.socket.emit("join_chat", { chatId, chatType });
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave_chat", chatId);
    }
  }

  // File Transfer
  sendFile(chatId, fileData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_file", {
        chatId,
        fileData,
        senderId: this.socket.id,
        timestamp: new Date().toISOString(),
      });
    }
  }

  sendVoiceMessage(chatId, audioData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_voice_message", {
        chatId,
        audioData,
        senderId: this.socket.id,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Utility Methods
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  isUserOnline(userId) {
    return this.users.has(userId);
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getGroup(groupId) {
    return this.groups.get(groupId);
  }

  getAllGroups() {
    return Array.from(this.groups.values());
  }

  getMyGroups() {
    return Array.from(this.groups.values()).filter((group) =>
      group.members.includes(this.socket.id)
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit("user_leaving", this.user);
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.groups.clear();
      this.users.clear();
    }
  }

  reconnect() {
    if (this.user) {
      this.disconnect();
      return this.connect(this.user);
    }
  }

  // Presence methods
  setOnline() {
    if (this.socket && this.isConnected) {
      this.socket.emit("set_online");
    }
  }

  setAway() {
    if (this.socket && this.isConnected) {
      this.socket.emit("set_away");
    }
  }

  setOffline() {
    if (this.socket && this.isConnected) {
      this.socket.emit("set_offline");
    }
  }

  // Batch operations
  createGroups(groupsData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("create_groups", groupsData);
    }
  }

  sendBulkMessages(messages) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_bulk_messages", messages);
    }
  }

  // Subscription methods
  subscribeToGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("subscribe_group", groupId);
    }
  }

  unsubscribeFromGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("unsubscribe_group", groupId);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
