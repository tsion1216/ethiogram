import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userData) {
    if (!this.socket) {
      this.socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        console.log("Connected to chat server");
        this.isConnected = true;

        // Register user
        this.socket.emit("user_joined", userData);
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from chat server");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
