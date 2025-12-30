const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/ethiogram", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB");
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

// In-memory for active connections
const activeSockets = new Map();

io.on("connection", async (socket) => {
  console.log(`🔗 New connection: ${socket.id}`);

  // User joined
  socket.on("user_joined", async (userData) => {
    try {
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

      activeSockets.set(socket.id, {
        socketId: socket.id,
        userId: user.userId,
      });

      // Get user's groups from database
      const userGroups = await Group.find({ members: user.userId });

      // Send groups to user
      socket.emit("user_groups", userGroups);

      // Broadcast to others
      socket.broadcast.emit("user_online", {
        userId: user.userId,
        name: user.name,
        avatar: user.avatar,
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

      const group = new Group({
        id: groupData.id,
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
      });

      await group.save();

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

      const groups = await Group.find({ members: socketData.userId });
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

      const message = new Message({
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
      });

      await message.save();

      // Broadcast message
      io.to(messageData.chatId).emit("receive_message", messageData);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Get Chat History
  socket.on("get_chat_history", async (chatId) => {
    try {
      const messages = await Message.find({ chatId })
        .sort({ timestamp: 1 })
        .limit(100);

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
        // Update user status in database
        await User.findOneAndUpdate(
          { userId: socketData.userId },
          {
            isOnline: false,
            lastSeen: new Date(),
            status: "offline",
          }
        );

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
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.groupId });
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
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Ethiogram backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server with MongoDB persistence`);
});
