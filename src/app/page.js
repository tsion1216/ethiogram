"use client";

import { useEffect, useRef } from "react";
import socketService from "@/lib/socket";
import { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSmile,
  FiPaperclip,
  FiSend,
  FiX,
  FiImage, // Added here
  FiFileText, // Added here
  FiMusic, // Added here
} from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import dynamic from "next/dynamic";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <p className="p-4">Loading emojis...</p>,
});

// Import your components
import ChatBubble from "@/components/ChatBubble";
import ContactItem from "@/components/ContactItem";
import FileUpload from "@/components/FileUpload";
import { MdAudiotrack } from "react-icons/md"; // Only non-Fi icon remains

import VoiceRecorder from "@/components/VoiceRecorder";
import { FaMicrophone } from "react-icons/fa";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "ሰላም! እንዴት ነህ? 🇪🇹 ዛሬ እንዴት አለህ?",
      time: "10:30 AM",
      sender: "them",
      status: "read",
      canEdit: false,
      reactions: { "😂": 1, "❤️": 1 },
    },
    {
      id: 2,
      text: "ደህና ነኝ! አመሰግናለሁ 🇪🇹 አንተስ?",
      time: "10:31 AM",
      sender: "me",
      status: "read",
      canEdit: true,
      reactions: { "👍": 2 },
    },
  ]);

  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState(null);
  // Add AFTER your existing states like [message, setMessage], [messages, setMessages], etc.
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  // Add this function AFTER your state declarations but BEFORE the contacts array
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  // Add after your state declarations
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect to socket server
  useEffect(() => {
    // Connect to socket server with user data
    const socket = socketService.connect({
      name: "You", // Replace with actual user name later
      avatar: "🇪🇹",
    });

    socketRef.current = socket;

    // Listen for incoming messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: newMessage.id,
          text: newMessage.text,
          time: new Date(newMessage.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: newMessage.senderId === socket.id ? "me" : "them",
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          status: "delivered",
          canEdit: newMessage.senderId === socket.id,
          isFile: newMessage.isFile,
          isVoice: newMessage.isVoice,
          fileData: newMessage.fileData,
          voiceData: newMessage.voiceData,
          timestamp: newMessage.timestamp,
        },
      ]);
    });

    // Listen for online users
    socket.on("online_users", (users) => {
      console.log("Online users:", users);
      // Update your contacts list with online status
    });

    // Listen for typing indicators
    socket.on("user_typing", ({ userId, userName, isTyping }) => {
      console.log(`${userName} is ${isTyping ? "typing..." : "not typing"}`);
      // Update UI to show typing indicator
    });

    // Listen for user status changes
    socket.on("user_online", (user) => {
      console.log(`${user.name} came online`);
    });

    socket.on("user_offline", (user) => {
      console.log(`${user.name} went offline`);
    });

    // Join the main chat room
    socket.emit("join_chat", "ethiogram-main");

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  const contacts = [
    {
      id: 1,
      name: "Abebe Bekele",
      lastMessage: "ሰላም! እንዴት ነህ?",
      time: "2 min",
      unread: 2,
      isOnline: true,
    },
    {
      id: 2,
      name: "Tigist Worku",
      lastMessage: "መልካም ቀን!",
      time: "1 hr",
      unread: 0,
      isOnline: true,
    },
    {
      id: 3,
      name: "Kaleb Getachew",
      lastMessage: "ነገ ስለስብሰባው",
      time: "3 hr",
      unread: 5,
      isOnline: false,
    },
    {
      id: 4,
      name: "Meron Abebe",
      lastMessage: "ቤተክርስቲያን እንደምን ነው?",
      time: "ትላንት",
      unread: 0,
      isOnline: true,
    },
  ];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Emoji handler
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Add AFTER handleEmojiClick function
  const handleFilesSelected = (files) => {
    // Convert files to messages
    const fileMessages = files.map((fileObj, index) => ({
      id: messages.length + index + 1,
      text: `📎 ${fileObj.name}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "me",
      status: "sent",
      canEdit: false,
      isFile: true,
      fileName: fileObj.name,
      fileSize: fileObj.size,
      fileType: fileObj.type,
      filePreview: fileObj.preview,
    }));

    setMessages([...messages, ...fileMessages]);
    setUploadedFiles([...uploadedFiles, ...files.map((f) => f.file)]);
    setShowFileUpload(false);
  };

  // Add reaction to message
  const addReaction = (messageId, emoji) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || {};
          const currentCount = currentReactions[emoji] || 0;
          return {
            ...msg,
            reactions: {
              ...currentReactions,
              [emoji]: currentCount + 1,
            },
          };
        }
        return msg;
      })
    );
    setActiveReactionMenu(null);
  };

  // Quick reactions
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  // Message handling functions
  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: replyingTo
          ? `Replying to: ${replyingTo.text}\n${message}`
          : message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "me",
        status: "sent",
        canEdit: true,
        reactions: {},
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      setReplyingTo(null);
      setShowEmojiPicker(false);
    }
  };
  const handleVoiceRecordingComplete = (audioBlob) => {
    const voiceMessage = {
      id: messages.length + 1,
      text: "🎤 ድምጽ መልእክት",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "me",
      status: "sent",
      canEdit: false,
      isVoice: true,
      audioBlob: audioBlob,
      audioURL: URL.createObjectURL(audioBlob),
      duration: Math.floor(audioBlob.size / 16000), // Rough estimate
    };

    setMessages([...messages, voiceMessage]);
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  const startEditMessage = (id, currentText) => {
    setEditingMessage({ id, text: currentText });
    setMessage(currentText);
    setShowEmojiPicker(false);
  };

  const finishEditMessage = () => {
    if (editingMessage && message.trim()) {
      setMessages(
        messages.map((msg) =>
          msg.id === editingMessage.id ? { ...msg, text: message } : msg
        )
      );
      setEditingMessage(null);
      setMessage("");
    }
  };

  const startReply = (messageToReply) => {
    setReplyingTo(messageToReply);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-amharic">
      {/* Header */}
      <header className="bg-gradient-to-r from-ethio-green via-ethio-yellow to-ethio-red text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl">🇪🇹</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ethiogram</h1>
              <p className="text-sm opacity-90">ኢትዮጵያዊ የመልእክት መረብ</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ፈልግ..."
                className="pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm rounded-full placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-chat overflow-hidden">
          <div className="flex h-[75vh]">
            {/* Sidebar */}
            <div className="w-1/4 border-r bg-gray-50 flex flex-col">
              <div className="p-4">
                <h2 className="font-semibold text-gray-700 mb-4">ውይይቶች</h2>
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="contact-item">
                      <ContactItem {...contact} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-4 border-t">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-ethio-yellow to-ethio-red rounded-full flex items-center justify-center text-white font-bold">
                    እ
                  </div>
                  <div>
                    <p className="font-medium">እርስዎ</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <FaRegCircle className="w-2 h-2 mr-1" />
                      በመስመር ላይ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-ethio-green to-ethio-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                      አ
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Abebe Bekele</h2>
                    <p className="text-sm text-green-600">
                      በመስመር ላይ - አሁን ይጽፋል...
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiVideo className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-telegram-bg to-white">
                <div className="max-w-3xl mx-auto">
                  {/* Reply Banner */}
                  {replyingTo && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Replying to:
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {replyingTo.text}
                          </p>
                        </div>
                        <button
                          onClick={cancelReply}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((msg) => (
                    <div key={msg.id} className="mb-4 group">
                      <ChatBubble
                        message={msg}
                        time={msg.time}
                        isSent={msg.sender === "me"}
                        status={msg.status}
                        canEdit={msg.canEdit}
                        onDelete={deleteMessage}
                        onEdit={startEditMessage}
                        onReply={startReply}
                        onReact={(emoji) => addReaction(msg.id, emoji)}
                        reactions={msg.reactions}
                        showReactionMenu={activeReactionMenu === msg.id}
                        toggleReactionMenu={() =>
                          setActiveReactionMenu(
                            activeReactionMenu === msg.id ? null : msg.id
                          )
                        }
                      />

                      {/* Quick Reactions Menu */}
                      {activeReactionMenu === msg.id && (
                        <div className="flex justify-center mt-1">
                          <div className="bg-white border rounded-full shadow-lg px-2 py-1 flex space-x-1">
                            {quickReactions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="text-lg hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input Area */}
              <div className="p-4 border-t bg-white relative">
                <div className="max-w-3xl mx-auto">
                  {/* Edit Mode Banner */}
                  {editingMessage && (
                    <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-yellow-700">
                          Editing message...
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={finishEditMessage}
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingMessage(null);
                              setMessage("");
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-16 right-4 z-50"
                    >
                      <div className="bg-white rounded-xl shadow-xl border overflow-hidden">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          searchDisabled={false}
                          skinTonesDisabled={true}
                          height={350}
                          width={300}
                          previewConfig={{
                            showPreview: false,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {showVoiceRecorder && (
                    <div className="absolute bottom-16 left-20 z-50">
                      <VoiceRecorder
                        onRecordingComplete={handleVoiceRecordingComplete}
                        onClose={() => setShowVoiceRecorder(false)}
                      />
                    </div>
                  )}
                  {/* Input Row */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setShowFileUpload(!showFileUpload);
                        setShowEmojiPicker(false); // Close emoji picker if open
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                    >
                      <FiPaperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    {/* Add this button in your input area, next to the paperclip button */}
                    <button
                      onClick={() => {
                        setShowVoiceRecorder(!showVoiceRecorder);
                        setShowEmojiPicker(false);
                        setShowFileUpload(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FaMicrophone className="w-5 h-5 text-gray-500" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (editingMessage ? finishEditMessage() : handleSend())
                        }
                        placeholder={
                          editingMessage
                            ? "Edit your message..."
                            : replyingTo
                            ? "Type your reply..."
                            : "መልእክት ይጻፉ..."
                        }
                        className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                      />
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <FiSmile className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    {/* Add this RIGHT AFTER the EmojiPicker component */}
                    {showFileUpload && (
                      <div className="absolute bottom-16 left-4 z-50">
                        <FileUpload
                          onFilesSelected={handleFilesSelected}
                          onClose={() => setShowFileUpload(false)}
                        />
                      </div>
                    )}

                    <button
                      onClick={editingMessage ? finishEditMessage : handleSend}
                      disabled={!message.trim()}
                      className={`p-3 rounded-full transition-colors ${
                        message.trim()
                          ? "bg-telegram-primary text-white hover:bg-blue-600"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            Ethiogram - <span className="text-ethio-green">3</span> ተጠቃሚዎች በመስመር
            ላይ | <span className="text-ethio-blue">127</span> መልእክቶች ዛሬ
          </p>
          <p className="mt-1 text-xs">
            © 2024 Ethiogram - ሁሉም መብቶች የተጠበቁ ናቸው 🇪🇹
          </p>
        </div>
      </main>
    </div>
  );
}
