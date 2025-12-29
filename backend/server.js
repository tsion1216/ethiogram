const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Data Stores
const users = new Map(); // socket.id -> user data
const groups = new Map(); // group.id -> group data
const messages = new Map(); // chatId -> [messages]
const typingUsers = new Map(); // chatId -> Set of typing users
const userGroups = new Map(); // user.id -> [group.id]

// Helper Functions
const generateGroupId = () =>
  `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () =>
  `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Get user by socket ID
const getUser = (socketId) => users.get(socketId);

// Get user by user ID
const getUserById = (userId) => {
  return Array.from(users.values()).find((user) => user.userId === userId);
};

// Get socket by user ID
const getSocketByUserId = (userId) => {
  const user = getUserById(userId);
  return user ? io.sockets.sockets.get(user.socketId) : null;
};

// Check if user is group admin
const isGroupAdmin = (groupId, userId) => {
  const group = groups.get(groupId);
  return group && group.admin === userId;
};

// Check if user is in group
const isUserInGroup = (groupId, userId) => {
  const group = groups.get(groupId);
  return group && group.members.includes(userId);
};

// Get online users in a group
const getOnlineGroupMembers = (groupId) => {
  const group = groups.get(groupId);
  if (!group) return [];

  return group.members
    .map((memberId) => getUserById(memberId))
    .filter((user) => user && user.isOnline);
};

// Get user's groups
const getUserGroups = (userId) => {
  return Array.from(groups.values()).filter((group) =>
    group.members.includes(userId)
  );
};

// Main Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`🔗 New connection: ${socket.id}`);

  // ========== USER MANAGEMENT ==========
  socket.on("user_joined", (userData) => {
    const user = {
      socketId: socket.id,
      userId: userData.id || socket.id,
      name: userData.name || "Anonymous",
      avatar: userData.avatar || "👤",
      isOnline: true,
      lastSeen: new Date(),
      joinedAt: new Date(),
      status: "online",
      groups: [],
    };

    users.set(socket.id, user);

    console.log(`👤 User joined: ${user.name} (${user.userId})`);

    // Notify all users
    socket.broadcast.emit("user_online", {
      id: user.userId,
      name: user.name,
      avatar: user.avatar,
      isOnline: true,
    });

    // Send online users list
    const onlineUsers = Array.from(users.values())
      .filter((u) => u.isOnline)
      .map(({ userId, name, avatar, status }) => ({
        id: userId,
        name,
        avatar,
        status,
      }));

    io.emit("online_users", onlineUsers);
  });

  socket.on("update_profile", (profileData) => {
    const user = getUser(socket.id);
    if (user) {
      Object.assign(user, profileData);
      io.emit("profile_updated", {
        userId: user.userId,
        ...profileData,
      });
    }
  });

  socket.on("set_status", (status) => {
    const user = getUser(socket.id);
    if (user) {
      user.status = status;
      socket.broadcast.emit("user_status_changed", {
        userId: user.userId,
        name: user.name,
        status,
      });
    }
  });

  // ========== GROUP MANAGEMENT ==========
  socket.on("create_group", (groupData) => {
    const user = getUser(socket.id);
    if (!user) return;

    const groupId = generateGroupId();
    const group = {
      id: groupId,
      name: groupData.name,
      description: groupData.description || "",
      avatar: groupData.avatar || "👥",
      type: groupData.type || "group",
      isPublic: groupData.isPublic !== false,
      admin: user.userId,
      members: [user.userId],
      createdAt: new Date().toISOString(),
      settings: {
        allowInvites: true,
        allowPinnedMessages: true,
        allowReactions: true,
        slowMode: false,
        slowModeDuration: 5,
        announcementOnly: false,
        ...groupData.settings,
      },
    };

    groups.set(groupId, group);

    // Join group room
    socket.join(groupId);

    // Add to user's groups
    if (!userGroups.has(user.userId)) {
      userGroups.set(user.userId, []);
    }
    userGroups.get(user.userId).push(groupId);

    console.log(`👥 Group created: ${group.name} by ${user.name}`);

    // Notify creator
    socket.emit("group_created", group);

    // Add initial members if provided
    if (groupData.members && Array.isArray(groupData.members)) {
      groupData.members.forEach((member) => {
        const memberSocket = getSocketByUserId(member.id);
        if (memberSocket) {
          group.members.push(member.id);
          memberSocket.join(groupId);

          if (!userGroups.has(member.id)) {
            userGroups.set(member.id, []);
          }
          userGroups.get(member.id).push(groupId);

          memberSocket.emit("added_to_group", {
            group,
            addedBy: user.name,
          });
        }
      });
    }

    // Initialize messages store for group
    if (!messages.has(groupId)) {
      messages.set(groupId, []);
    }
  });

  socket.on("join_group", (groupId) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group) return;

    if (!group.members.includes(user.userId)) {
      group.members.push(user.userId);
    }

    socket.join(groupId);

    if (!userGroups.has(user.userId)) {
      userGroups.set(user.userId, []);
    }
    if (!userGroups.get(user.userId).includes(groupId)) {
      userGroups.get(user.userId).push(groupId);
    }

    console.log(`➕ ${user.name} joined group: ${group.name}`);

    // Notify group members
    io.to(groupId).emit("user_joined_group", {
      groupId,
      user: {
        id: user.userId,
        name: user.name,
        avatar: user.avatar,
      },
    });
  });

  socket.on("leave_group", (groupId) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group) return;

    group.members = group.members.filter((id) => id !== user.userId);
    socket.leave(groupId);

    const userGroupList = userGroups.get(user.userId) || [];
    userGroups.set(
      user.userId,
      userGroupList.filter((id) => id !== groupId)
    );

    console.log(`➖ ${user.name} left group: ${group.name}`);

    io.to(groupId).emit("user_left_group", {
      groupId,
      user: {
        id: user.userId,
        name: user.name,
      },
    });

    // If user was admin and no members left, delete group
    if (group.admin === user.userId && group.members.length === 0) {
      groups.delete(groupId);
      io.emit("group_deleted", groupId);
    }
  });

  socket.on("add_members", ({ groupId, memberIds }) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "add_members",
        reason: "Not admin",
      });
      return;
    }

    memberIds.forEach((memberId) => {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);

        const memberSocket = getSocketByUserId(memberId);
        if (memberSocket) {
          memberSocket.join(groupId);

          if (!userGroups.has(memberId)) {
            userGroups.set(memberId, []);
          }
          userGroups.get(memberId).push(groupId);

          memberSocket.emit("added_to_group", {
            group,
            addedBy: user.name,
          });
        }
      }
    });

    io.to(groupId).emit("members_added", {
      groupId,
      members: memberIds,
      addedBy: user.name,
    });
  });

  socket.on("remove_member", ({ groupId, memberId }) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "remove_member",
        reason: "Not admin",
      });
      return;
    }

    group.members = group.members.filter((id) => id !== memberId);

    const memberSocket = getSocketByUserId(memberId);
    if (memberSocket) {
      memberSocket.leave(groupId);

      const memberGroupList = userGroups.get(memberId) || [];
      userGroups.set(
        memberId,
        memberGroupList.filter((id) => id !== groupId)
      );

      memberSocket.emit("removed_from_group", {
        groupId,
        removedBy: user.name,
        reason: "Removed by admin",
      });
    }

    io.to(groupId).emit("user_removed_from_group", {
      groupId,
      user: { id: memberId },
      removedBy: user.name,
    });
  });

  socket.on("update_group_settings", ({ groupId, settings }) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "update_group_settings",
        reason: "Not admin",
      });
      return;
    }

    group.settings = { ...group.settings, ...settings };

    io.to(groupId).emit("group_settings_updated", {
      groupId,
      settings: group.settings,
      updatedBy: user.name,
    });
  });

  socket.on("get_group_members", (groupId) => {
    const group = groups.get(groupId);
    if (group) {
      const members = group.members.map((memberId) => {
        const member = getUserById(memberId);
        return {
          id: memberId,
          name: member ? member.name : "Unknown",
          avatar: member ? member.avatar : "👤",
          isOnline: member ? member.isOnline : false,
          isAdmin: group.admin === memberId,
        };
      });

      socket.emit("group_members", {
        groupId,
        members,
      });
    }
  });

  socket.on("get_group_info", (groupId) => {
    const group = groups.get(groupId);
    if (group) {
      socket.emit("group_info", group);
    }
  });

  socket.on("add_admin", ({ groupId, memberId }) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "add_admin",
        reason: "Not admin",
      });
      return;
    }

    // You can implement multiple admins by having an admins array
    // For simplicity, we'll keep single admin for now
    socket.emit("group_error", {
      groupId,
      error: "Single admin system - use transfer_admin instead",
    });
  });

  socket.on("transfer_admin", ({ groupId, newAdminId }) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "transfer_admin",
        reason: "Not admin",
      });
      return;
    }

    const oldAdmin = group.admin;
    group.admin = newAdminId;

    io.to(groupId).emit("admin_transferred", {
      groupId,
      oldAdmin,
      newAdmin: newAdminId,
      transferredBy: user.name,
    });
  });

  // ========== MESSAGE HANDLING ==========
  socket.on("send_message", (messageData) => {
    const user = getUser(socket.id);
    if (!user) return;

    const messageId = generateMessageId();
    const message = {
      id: messageId,
      text: messageData.text,
      senderId: user.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      chatId: messageData.chatId,
      isFile: messageData.isFile || false,
      isVoice: messageData.isVoice || false,
      isAnnouncement: messageData.isAnnouncement || false,
      fileData: messageData.fileData || null,
      voiceData: messageData.voiceData || null,
      reactions: {},
    };

    // Store message
    if (!messages.has(messageData.chatId)) {
      messages.set(messageData.chatId, []);
    }
    messages.get(messageData.chatId).push(message);

    // Broadcast to chat
    io.to(messageData.chatId).emit("receive_message", message);

    // Confirm to sender
    socket.emit("message_sent", { messageId, timestamp: message.timestamp });

    console.log(
      `📩 Message from ${user.name} in ${
        messageData.chatId
      }: ${message.text.substring(0, 50)}...`
    );
  });

  socket.on("send_announcement", (announcementData) => {
    const user = getUser(socket.id);
    const group = groups.get(announcementData.groupId);

    if (!user || !group || group.admin !== user.userId) {
      socket.emit("permission_denied", {
        action: "send_announcement",
        reason: "Not admin",
      });
      return;
    }

    const messageId = generateMessageId();
    const announcement = {
      id: messageId,
      text: announcementData.text,
      senderId: user.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      chatId: announcementData.groupId,
      isAnnouncement: true,
      reactions: {},
    };

    // Store announcement
    if (!messages.has(announcementData.groupId)) {
      messages.set(announcementData.groupId, []);
    }
    messages.get(announcementData.groupId).push(announcement);

    // Broadcast announcement
    io.to(announcementData.groupId).emit("announcement_sent", {
      groupId: announcementData.groupId,
      announcement,
      sender: {
        id: user.userId,
        name: user.name,
      },
    });

    console.log(`📢 Announcement from ${user.name} in group ${group.name}`);
  });

  socket.on("edit_message", ({ messageId, chatId, newText }) => {
    const user = getUser(socket.id);
    const chatMessages = messages.get(chatId);

    if (!user || !chatMessages) return;

    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (
      messageIndex !== -1 &&
      chatMessages[messageIndex].senderId === user.userId
    ) {
      chatMessages[messageIndex].text = newText;
      chatMessages[messageIndex].editedAt = new Date().toISOString();
      chatMessages[messageIndex].isEdited = true;

      io.to(chatId).emit("message_edited", {
        messageId,
        newText,
        editedBy: user.name,
        editedAt: chatMessages[messageIndex].editedAt,
      });
    }
  });

  socket.on("delete_message", ({ messageId, chatId }) => {
    const user = getUser(socket.id);
    const chatMessages = messages.get(chatId);

    if (!user || !chatMessages) return;

    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
      const message = chatMessages[messageIndex];

      // Allow deletion if user is sender or admin
      const group = groups.get(chatId);
      const canDelete =
        message.senderId === user.userId ||
        (group && group.admin === user.userId);

      if (canDelete) {
        chatMessages.splice(messageIndex, 1);
        io.to(chatId).emit("message_deleted", {
          messageId,
          deletedBy: user.name,
        });
      }
    }
  });

  socket.on("add_reaction", ({ messageId, chatId, emoji }) => {
    const user = getUser(socket.id);
    const chatMessages = messages.get(chatId);

    if (!user || !chatMessages) return;

    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
      const message = chatMessages[messageIndex];
      if (!message.reactions) message.reactions = {};
      if (!message.reactions[emoji]) message.reactions[emoji] = 0;
      message.reactions[emoji]++;

      io.to(chatId).emit("reaction_added", {
        messageId,
        emoji,
        user: {
          id: user.userId,
          name: user.name,
        },
        count: message.reactions[emoji],
      });
    }
  });

  socket.on("remove_reaction", ({ messageId, chatId, emoji }) => {
    const user = getUser(socket.id);
    const chatMessages = messages.get(chatId);

    if (!user || !chatMessages) return;

    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
      const message = chatMessages[messageIndex];
      if (message.reactions && message.reactions[emoji]) {
        message.reactions[emoji]--;
        if (message.reactions[emoji] <= 0) {
          delete message.reactions[emoji];
        }

        io.to(chatId).emit("reaction_removed", {
          messageId,
          emoji,
          user: {
            id: user.userId,
            name: user.name,
          },
        });
      }
    }
  });

  // ========== TYPING INDICATORS ==========
  socket.on("start_typing", (chatId) => {
    const user = getUser(socket.id);
    if (!user) return;

    if (!typingUsers.has(chatId)) {
      typingUsers.set(chatId, new Set());
    }
    typingUsers.get(chatId).add(user.userId);

    socket.to(chatId).emit("user_started_typing", {
      userId: user.userId,
      userName: user.name,
      chatId,
    });
  });

  socket.on("stop_typing", (chatId) => {
    const user = getUser(socket.id);
    if (!user) return;

    if (typingUsers.has(chatId)) {
      typingUsers.get(chatId).delete(user.userId);
      if (typingUsers.get(chatId).size === 0) {
        typingUsers.delete(chatId);
      }
    }

    socket.to(chatId).emit("user_stopped_typing", {
      userId: user.userId,
      userName: user.name,
      chatId,
    });
  });

  // ========== CHAT MANAGEMENT ==========
  socket.on("join_chat", ({ chatId, chatType }) => {
    const user = getUser(socket.id);
    if (!user) return;

    socket.join(chatId);
    console.log(`${user.name} joined chat: ${chatId}`);

    // Send chat history
    const chatHistory = messages.get(chatId) || [];
    socket.emit("chat_history", chatHistory);

    // Send typing users for this chat
    if (typingUsers.has(chatId)) {
      const typingUserIds = Array.from(typingUsers.get(chatId));
      const typingUsersInfo = typingUserIds
        .map((userId) => {
          const typingUser = getUserById(userId);
          return typingUser
            ? {
                id: typingUser.userId,
                name: typingUser.name,
              }
            : null;
        })
        .filter(Boolean);

      socket.emit("typing_users", {
        chatId,
        users: typingUsersInfo,
      });
    }
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);

    // Remove from typing users
    if (typingUsers.has(chatId)) {
      const user = getUser(socket.id);
      if (user) {
        typingUsers.get(chatId).delete(user.userId);
      }
    }
  });

  // ========== FILE & VOICE MESSAGES ==========
  socket.on("send_file", ({ chatId, fileData }) => {
    const user = getUser(socket.id);
    if (!user) return;

    const messageId = generateMessageId();
    const message = {
      id: messageId,
      text: `📎 ${fileData.name}`,
      senderId: user.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      chatId,
      isFile: true,
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type,
      fileUrl: fileData.url,
      reactions: {},
    };

    // Store and broadcast
    if (!messages.has(chatId)) {
      messages.set(chatId, []);
    }
    messages.get(chatId).push(message);

    io.to(chatId).emit("receive_message", message);
  });

  socket.on("send_voice_message", ({ chatId, audioData }) => {
    const user = getUser(socket.id);
    if (!user) return;

    const messageId = generateMessageId();
    const message = {
      id: messageId,
      text: "🎤 Voice message",
      senderId: user.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      chatId,
      isVoice: true,
      voiceDuration: audioData.duration,
      voiceUrl: audioData.url,
      reactions: {},
    };

    // Store and broadcast
    if (!messages.has(chatId)) {
      messages.set(chatId, []);
    }
    messages.get(chatId).push(message);

    io.to(chatId).emit("receive_message", message);
  });

  // ========== DISCONNECTION ==========
  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      user.status = "offline";

      console.log(`❌ User disconnected: ${user.name}`);

      // Notify all users
      socket.broadcast.emit("user_offline", {
        id: user.userId,
        name: user.name,
        avatar: user.avatar,
      });

      // Remove from all typing lists
      typingUsers.forEach((usersSet, chatId) => {
        usersSet.delete(user.userId);
        if (usersSet.size === 0) {
          typingUsers.delete(chatId);
        }
      });

      // Clean up after delay (in case of reconnection)
      setTimeout(() => {
        if (users.get(socket.id) && !users.get(socket.id).isOnline) {
          users.delete(socket.id);
        }
      }, 30000); // 30 seconds
    }
  });

  // ========== BULK OPERATIONS ==========
  socket.on("create_groups", (groupsData) => {
    const user = getUser(socket.id);
    if (!user) return;

    const createdGroups = groupsData.map((groupData) => {
      const groupId = generateGroupId();
      const group = {
        id: groupId,
        name: groupData.name,
        description: groupData.description || "",
        admin: user.userId,
        members: [user.userId],
        createdAt: new Date().toISOString(),
        ...groupData,
      };

      groups.set(groupId, group);
      return group;
    });

    socket.emit("groups_created", createdGroups);
  });

  // ========== PRESENCE ==========
  socket.on("set_online", () => {
    const user = getUser(socket.id);
    if (user) {
      user.isOnline = true;
      user.status = "online";
      socket.broadcast.emit("user_online", {
        id: user.userId,
        name: user.name,
        avatar: user.avatar,
        isOnline: true,
      });
    }
  });

  socket.on("set_away", () => {
    const user = getUser(socket.id);
    if (user) {
      user.status = "away";
      socket.broadcast.emit("user_status_changed", {
        userId: user.userId,
        name: user.name,
        status: "away",
      });
    }
  });

  socket.on("set_offline", () => {
    const user = getUser(socket.id);
    if (user) {
      user.status = "offline";
      socket.broadcast.emit("user_status_changed", {
        userId: user.userId,
        name: user.name,
        status: "offline",
      });
    }
  });

  // ========== SUBSCRIPTIONS ==========
  socket.on("subscribe_group", (groupId) => {
    const user = getUser(socket.id);
    const group = groups.get(groupId);

    if (user && group && group.members.includes(user.userId)) {
      socket.join(groupId);
      console.log(`${user.name} subscribed to group ${group.name}`);
    }
  });

  socket.on("unsubscribe_group", (groupId) => {
    socket.leave(groupId);
  });
});

// ========== API ROUTES ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    users: users.size,
    groups: groups.size,
    uptime: process.uptime(),
  });
});

app.get("/api/users/online", (req, res) => {
  const onlineUsers = Array.from(users.values())
    .filter((u) => u.isOnline)
    .map(({ userId, name, avatar, status }) => ({
      id: userId,
      name,
      avatar,
      status,
    }));
  res.json(onlineUsers);
});

app.get("/api/groups", (req, res) => {
  const groupsList = Array.from(groups.values()).map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    type: group.type,
    isPublic: group.isPublic,
    members: group.members.length,
    admin: group.admin,
    createdAt: group.createdAt,
  }));
  res.json(groupsList);
});

app.get("/api/groups/:groupId", (req, res) => {
  const group = groups.get(req.params.groupId);
  if (group) {
    res.json(group);
  } else {
    res.status(404).json({ error: "Group not found" });
  }
});

app.get("/api/groups/:groupId/members", (req, res) => {
  const group = groups.get(req.params.groupId);
  if (group) {
    const members = group.members.map((memberId) => {
      const member = getUserById(memberId);
      return {
        id: memberId,
        name: member ? member.name : "Unknown",
        avatar: member ? member.avatar : "👤",
        isOnline: member ? member.isOnline : false,
        isAdmin: group.admin === memberId,
      };
    });
    res.json(members);
  } else {
    res.status(404).json({ error: "Group not found" });
  }
});

app.get("/api/messages/:chatId", (req, res) => {
  const chatMessages = messages.get(req.params.chatId) || [];
  res.json(chatMessages);
});

app.get("/api/user/:userId/groups", (req, res) => {
  const userGroupsList = getUserGroups(req.params.userId);
  res.json(userGroupsList);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Ethiogram backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time chat`);
  console.log(`👥 Group chat features: ✅ ENABLED`);
});

module.exports = { io, users, groups, messages };
