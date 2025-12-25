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
    origin: "http://localhost:3000", // Your Next.js frontend
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users = new Map();
// Store messages (in production, use database)
const messages = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins chat
  socket.on("user_joined", (userData) => {
    users.set(socket.id, {
      id: socket.id,
      ...userData,
      isOnline: true,
      lastSeen: new Date(),
    });

    console.log(`${userData.name} joined the chat`);

    // Broadcast to all other users
    socket.broadcast.emit("user_online", {
      id: socket.id,
      ...userData,
      isOnline: true,
    });

    // Send online users list to the new user
    const onlineUsers = Array.from(users.values())
      .filter((u) => u.isOnline)
      .map(({ id, name, avatar }) => ({ id, name, avatar }));

    socket.emit("online_users", onlineUsers);
  });

  // Send message
  socket.on("send_message", (messageData) => {
    const user = users.get(socket.id);

    const message = {
      id: Date.now().toString(),
      text: messageData.text,
      senderId: socket.id,
      senderName: user?.name || "Anonymous",
      timestamp: new Date().toISOString(),
      isFile: messageData.isFile || false,
      fileData: messageData.fileData || null,
      isVoice: messageData.isVoice || false,
      voiceData: messageData.voiceData || null,
    };

    // Store message
    if (!messages.has(messageData.chatId)) {
      messages.set(messageData.chatId, []);
    }
    messages.get(messageData.chatId).push(message);

    // Broadcast to all users in the chat
    io.to(messageData.chatId).emit("receive_message", message);

    console.log(`Message from ${user?.name}: ${message.text}`);
  });

  // Typing indicator
  socket.on("typing", ({ chatId, isTyping }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(chatId).emit("user_typing", {
        userId: socket.id,
        userName: user.name,
        isTyping,
      });
    }
  });

  // Join specific chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);

    // Send chat history
    const chatHistory = messages.get(chatId) || [];
    socket.emit("chat_history", chatHistory);
  });

  // Leave chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });

  // User is typing
  socket.on("start_typing", (chatId) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(chatId).emit("user_typing", {
        userId: socket.id,
        userName: user.name,
        isTyping: true,
      });
    }
  });

  socket.on("stop_typing", (chatId) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(chatId).emit("user_typing", {
        userId: socket.id,
        userName: user.name,
        isTyping: false,
      });
    }
  });

  // Read receipt
  socket.on("message_read", ({ messageId, chatId }) => {
    socket.to(chatId).emit("message_status", {
      messageId,
      status: "read",
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      users.set(socket.id, { ...user, isOnline: false });

      socket.broadcast.emit("user_offline", {
        id: socket.id,
        name: user.name,
      });

      console.log(`${user.name} disconnected`);
    }
  });
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    users: users.size,
    uptime: process.uptime(),
  });
});

app.get("/api/users/online", (req, res) => {
  const onlineUsers = Array.from(users.values())
    .filter((u) => u.isOnline)
    .map(({ id, name, avatar }) => ({ id, name, avatar }));
  res.json(onlineUsers);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Ethiogram backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time chat`);
});
