const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection - FIXED VERSION (remove deprecated options)
mongoose
  .connect("mongodb://localhost:27017/ethiogram")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log(
      "⚠️  If you don't have MongoDB installed, install it or run with in-memory storage"
    );
    // Exit or continue without DB based on your preference
    // process.exit(1); // Uncomment to exit if DB connection fails
  });

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  phone: String,
  avatar: String,
  isOnline: Boolean,
  lastSeen: Date,
  joinedAt: Date,
  status: String,
});

const groupSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  avatar: String,
  type: String,
  isPublic: Boolean,
  admin: String, // userId of admin
  members: [String], // array of userIds
  createdAt: Date,
  settings: {
    allowInvites: Boolean,
    allowPinnedMessages: Boolean,
    allowReactions: Boolean,
    slowMode: Boolean,
    slowModeDuration: Number,
    announcementOnly: Boolean,
  },
  pinned: Boolean,
  muted: Boolean,
});

const messageSchema = new mongoose.Schema({
  id: String,
  text: String,
  senderId: String,
  senderName: String,
  senderAvatar: String,
  timestamp: Date,
  chatId: String, // groupId or private-chat-id
  isFile: Boolean,
  isVoice: Boolean,
  isAnnouncement: Boolean,
  fileName: String,
  fileSize: Number,
  fileType: String,
  fileUrl: String,
  voiceDuration: Number,
  voiceUrl: String,
  reactions: Object,
  editedAt: Date,
  isEdited: Boolean,
});

// Create models
const User = mongoose.model("User", userSchema);
const Group = mongoose.model("Group", groupSchema);
const Message = mongoose.model("Message", messageSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// In-memory for active connections (fallback if DB fails)
const activeSockets = new Map();
const inMemoryUsers = new Map();
const inMemoryGroups = new Map();
const inMemoryMessages = new Map();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

io.on("connection", async (socket) => {
  console.log(`🔗 New connection: ${socket.id}`);

  // User joined
  socket.on("user_joined", async (userData) => {
    try {
      if (isMongoConnected()) {
        // Save or update user in database
        let user = await User.findOne({ userId: userData.userId });

        if (!user) {
          user = new User({
            userId: userData.userId,
            name: userData.name,
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar || "🇪🇹",
            isOnline: true,
            lastSeen: new Date(),
            joinedAt: new Date(),
            status: "online",
          });
        } else {
          user.isOnline = true;
          user.lastSeen = new Date();
          user.status = "online";
          if (userData.name) user.name = userData.name;
          if (userData.avatar) user.avatar = userData.avatar;
        }

        await user.save();
      } else {
        // Use in-memory storage if MongoDB not connected
        inMemoryUsers.set(userData.userId, {
          userId: userData.userId,
          name: userData.name,
          email: userData.email || "",
          phone: userData.phone || "",
          avatar: userData.avatar || "🇪🇹",
          isOnline: true,
          lastSeen: new Date(),
          joinedAt: new Date(),
          status: "online",
        });
      }

      activeSockets.set(socket.id, {
        socketId: socket.id,
        userId: userData.userId,
      });

      // Get user's groups
      let userGroups = [];
      if (isMongoConnected()) {
        userGroups = await Group.find({ members: userData.userId });
      } else {
        // Get from in-memory
        userGroups = Array.from(inMemoryGroups.values()).filter((group) =>
          group.members.includes(userData.userId)
        );
      }

      // Send groups to user
      socket.emit("user_groups", userGroups);

      // Broadcast to others
      socket.broadcast.emit("user_online", {
        userId: userData.userId,
        name: userData.name,
        avatar: userData.avatar,
        isOnline: true,
      });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  });

  // Create Group
  socket.on("create_group", async (groupData) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) return;

      const group = {
        id: groupData.id || `group-${Date.now()}`,
        name: groupData.name,
        description: groupData.description || "",
        avatar: groupData.avatar || "👥",
        type: groupData.type || "group",
        isPublic: groupData.isPublic !== false,
        admin: socketData.userId,
        members: [socketData.userId, ...(groupData.members || [])],
        createdAt: new Date(),
        settings: groupData.settings || {
          allowInvites: true,
          allowPinnedMessages: true,
          allowReactions: true,
          slowMode: false,
          slowModeDuration: 5,
          announcementOnly: false,
        },
        pinned: false,
        muted: false,
      };

      if (isMongoConnected()) {
        // Save to MongoDB
        const dbGroup = new Group(group);
        await dbGroup.save();
      } else {
        // Save to in-memory
        inMemoryGroups.set(group.id, group);
      }

      // Notify creator
      socket.emit("group_created", group);

      // Notify added members
      group.members.forEach((memberId) => {
        const memberSocket = findSocketByUserId(memberId);
        if (memberSocket && memberId !== socketData.userId) {
          memberSocket.emit("added_to_group", {
            group,
            addedBy: socketData.userId,
          });
        }
      });
    } catch (error) {
      console.error("Error creating group:", error);
      socket.emit("group_error", { error: error.message });
    }
  });

  // Get User Groups
  socket.on("get_user_groups", async () => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) return;

      let groups = [];
      if (isMongoConnected()) {
        groups = await Group.find({ members: socketData.userId });
      } else {
        // Get from in-memory
        groups = Array.from(inMemoryGroups.values()).filter((group) =>
          group.members.includes(socketData.userId)
        );
      }

      socket.emit("user_groups", groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  });

  // Save Message
  socket.on("send_message", async (messageData) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) return;

      const message = {
        id: messageData.id,
        text: messageData.text,
        senderId: socketData.userId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar,
        timestamp: new Date(messageData.timestamp),
        chatId: messageData.chatId,
        isFile: messageData.isFile || false,
        isVoice: messageData.isVoice || false,
        isAnnouncement: messageData.isAnnouncement || false,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
        fileType: messageData.fileType,
        fileUrl: messageData.fileUrl,
        voiceDuration: messageData.voiceDuration,
        voiceUrl: messageData.voiceUrl,
        reactions: {},
      };

      if (isMongoConnected()) {
        // Save to MongoDB
        const dbMessage = new Message(message);
        await dbMessage.save();
      } else {
        // Save to in-memory
        if (!inMemoryMessages.has(message.chatId)) {
          inMemoryMessages.set(message.chatId, []);
        }
        inMemoryMessages.get(message.chatId).push(message);
      }

      // Broadcast message
      io.to(messageData.chatId).emit("receive_message", messageData);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Get Chat History
  socket.on("get_chat_history", async (chatId) => {
    try {
      let messages = [];
      if (isMongoConnected()) {
        messages = await Message.find({ chatId })
          .sort({ timestamp: 1 })
          .limit(100);
      } else {
        // Get from in-memory
        messages = inMemoryMessages.get(chatId) || [];
        messages.sort((a, b) => a.timestamp - b.timestamp);
      }

      socket.emit("chat_history", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

  // Disconnect
  socket.on("disconnect", async () => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (socketData) {
        if (isMongoConnected()) {
          // Update user status in database
          await User.findOneAndUpdate(
            { userId: socketData.userId },
            {
              isOnline: false,
              lastSeen: new Date(),
              status: "offline",
            }
          );
        } else {
          // Update in-memory
          const user = inMemoryUsers.get(socketData.userId);
          if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            user.status = "offline";
          }
        }

        activeSockets.delete(socket.id);

        // Notify others
        socket.broadcast.emit("user_offline", {
          userId: socketData.userId,
        });
      }
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
});

// Helper function
const findSocketByUserId = (userId) => {
  for (const [socketId, data] of activeSockets.entries()) {
    if (data.userId === userId) {
      return io.sockets.sockets.get(socketId);
    }
  }
  return null;
};

// API Routes for persistent data
app.get("/api/groups", async (req, res) => {
  try {
    let groups = [];
    if (isMongoConnected()) {
      groups = await Group.find();
    } else {
      groups = Array.from(inMemoryGroups.values());
    }
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/groups/:groupId", async (req, res) => {
  try {
    let group = null;
    if (isMongoConnected()) {
      group = await Group.findOne({ id: req.params.groupId });
    } else {
      group = inMemoryGroups.get(req.params.groupId);
    }

    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ error: "Group not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/:chatId", async (req, res) => {
  try {
    let messages = [];
    if (isMongoConnected()) {
      messages = await Message.find({ chatId: req.params.chatId })
        .sort({ timestamp: 1 })
        .limit(100);
    } else {
      messages = inMemoryMessages.get(req.params.chatId) || [];
      messages.sort((a, b) => a.timestamp - b.timestamp);
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    let users = [];
    if (isMongoConnected()) {
      users = await User.find({ isOnline: true });
    } else {
      users = Array.from(inMemoryUsers.values()).filter((u) => u.isOnline);
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mongoConnected: isMongoConnected(),
    activeUsers: activeSockets.size,
    inMemoryGroups: inMemoryGroups.size,
    inMemoryMessages: Array.from(inMemoryMessages.values()).flat().length,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Ethiogram backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(
    `🗄️  MongoDB: ${
      isMongoConnected()
        ? "Connected"
        : "Not connected (using in-memory storage)"
    }`
  );
});
