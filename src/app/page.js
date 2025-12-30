"use client";

import { useState, useRef, useEffect } from "react";
import socketService from "@/lib/socket";
import {
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSmile,
  FiPaperclip,
  FiSend,
  FiX,
  FiUsers,
  FiPlus,
  FiSettings,
  FiLock,
  FiGlobe,
  FiUserPlus,
  FiShield,
  FiBell,
  FiArchive,
  FiLogOut,
  FiMail,
  FiUser,
} from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import dynamic from "next/dynamic";

// Dynamically import EmojiPicker
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <p className="p-4">Loading emojis...</p>,
});

// Import your components
import ChatBubble from "@/components/ChatBubble";
import ContactItem from "@/components/ContactItem";
import FileUpload from "@/components/FileUpload";
import VoiceRecorder from "@/components/VoiceRecorder";
import { FaMicrophone } from "react-icons/fa";
import EthiopianDateDisplay from "@/components/EthiopianDateDisplay";
import GroupSettingsModal from "@/components/GroupSettingsModal";
import CreateGroupModal from "@/components/CreateGroupModal";
import AddMembersModal from "@/components/AddMembersModal";
import GroupInfoSidebar from "@/components/GroupInfoSidebar";

// Import Auth Components (create these files)
import AuthModal from "@/components/AuthModal";
import UserProfileModal from "@/components/UserProfileModal";
import { auth } from "@/lib/auth";
import AddContactModal from "@/components/AddContactModal";
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Chat States
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Contact and Chat States
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeChatType, setActiveChatType] = useState("group");

  // Group chat states
  const [activeChat, setActiveChat] = useState({
    id: "ethiogram-main",
    type: "group",
    name: "Ethiogram Main Group",
    description: "Main public group for all Ethiogram users",
    members: 127,
    isOnline: true,
    isAdmin: true,
    isPublic: true,
    createdAt: "2024-01-01",
  });

  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showAddContact, setShowAddContact] = useState(false);

  // Sample groups data
  const [groups, setGroups] = useState([
    {
      id: "group-1",
      name: "Ethiogram Main",
      type: "group",
      description: "Main public group for all users",
      lastMessage: "Welcome to Ethiogram! 🇪🇹",
      time: "2 min",
      unread: 3,
      members: 127,
      isOnline: true,
      isPublic: true,
      isAdmin: true,
      avatar: "🇪🇹",
      pinned: true,
      muted: false,
    },
    {
      id: "group-2",
      name: "Addis Tech Hub",
      type: "group",
      description: "Ethiopian developers community",
      lastMessage: "ሰላም ወንድሞች! 🚀",
      time: "1 hr",
      unread: 12,
      members: 45,
      isOnline: true,
      isPublic: true,
      isAdmin: false,
      avatar: "💻",
      pinned: true,
      muted: true,
    },
    {
      id: "group-3",
      name: "Family Group",
      type: "group",
      description: "Family announcements and updates",
      lastMessage: "ቤተክርስቲያን እንደምን ነው?",
      time: "ትላንት",
      unread: 0,
      members: 8,
      isOnline: true,
      isPublic: false,
      isAdmin: true,
      avatar: "👨‍👩‍👧‍👦",
      pinned: false,
      muted: false,
    },
    {
      id: "group-4",
      name: "Work Team",
      type: "group",
      description: "Office coordination and updates",
      lastMessage: "Meeting at 2 PM tomorrow",
      time: "3 hr",
      unread: 5,
      members: 15,
      isOnline: false,
      isPublic: false,
      isAdmin: true,
      avatar: "💼",
      pinned: false,
      muted: false,
    },
  ]);

  // Sample contacts for adding to groups
  const [allContacts, setAllContacts] = useState([
    { id: "user-1", name: "Abebe Bekele", isOnline: true, avatar: "A" },
    { id: "user-2", name: "Tigist Worku", isOnline: true, avatar: "T" },
    { id: "user-3", name: "Kaleb Getachew", isOnline: false, avatar: "K" },
    { id: "user-4", name: "Meron Abebe", isOnline: true, avatar: "M" },
    { id: "user-5", name: "Dawit Alemu", isOnline: true, avatar: "D" },
    { id: "user-6", name: "Selamawit Tesfaye", isOnline: false, avatar: "S" },
  ]);

  // Update your contacts array to include ids and group info
  const contacts = [
    {
      id: "private-1",
      name: "Abebe Bekele",
      lastMessage: "ሰላም! እንዴት ነህ?",
      time: "2 min",
      unread: 2,
      isOnline: true,
      isGroup: false,
    },
    {
      id: "private-2",
      name: "Tigist Worku",
      lastMessage: "መልካም ቀን!",
      time: "1 hr",
      unread: 0,
      isOnline: true,
      isGroup: false,
    },
    {
      id: "group-1",
      name: "Ethiogram Main",
      lastMessage: "Welcome everyone!",
      time: "2 min",
      unread: 3,
      isOnline: true,
      isGroup: true,
      groupMembers: 127,
    },
    {
      id: "group-2",
      name: "Addis Tech Hub",
      lastMessage: "ሰላም ወንድሞች! 🚀",
      time: "1 hr",
      unread: 12,
      isOnline: true,
      isGroup: true,
      groupMembers: 45,
    },
  ];

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // ==================== AUTHENTICATION FUNCTIONS ====================

  // Check authentication on component mount
  useEffect(() => {
    setIsClient(true);

    // Check if user is already logged in
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
      initializeSocketConnection(user);
    } else {
      // Show auth modal if not logged in
      setShowAuthModal(true);
    }
    setIsLoading(false);
  }, []);

  // Initialize socket connection with user data
  const initializeSocketConnection = (user) => {
    const socket = socketService.connect({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      userId: user.id,
    });

    socketRef.current = socket;
    setupSocketListeners(socket);

    // Join active chat
    socket.emit("join_chat", activeChat.id);
  };

  // Login handler
  const handleLogin = async (credentials) => {
    try {
      const user = await auth.login(credentials.email, credentials.password);
      setCurrentUser(user);
      setShowAuthModal(false);

      // Initialize socket connection with authenticated user
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      initializeSocketConnection(user);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  // Signup handler
  const handleSignup = async (userData) => {
    try {
      const user = await auth.signup(userData);
      setCurrentUser(user);
      setShowAuthModal(false);

      // Initialize socket connection with new user
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      initializeSocketConnection(user);
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };
  const handleAddContact = (newContact) => {
    // Use 'contact' instead of 'contacts'
    setContact((prev) => [...prev, newContact]);

    setAllContacts((prev) => [
      ...prev,
      {
        id: newContact.id,
        name: newContact.name,
        isOnline: newContact.isOnline,
        avatar: newContact.name.charAt(0),
      },
    ]);

    console.log("New contact added:", newContact);
  };

  // Logout handler
  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setShowAuthModal(true);

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Profile update handler
  const handleProfileUpdate = async (profileData) => {
    try {
      const updatedUser = await auth.updateProfile(profileData);
      setCurrentUser(updatedUser);
      setShowProfileModal(false);

      // Update socket connection with new profile
      if (socketRef.current) {
        socketRef.current.emit("update_profile", profileData);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  // ==================== CONTACT CLICK FUNCTIONS ====================

  // Function to handle contact click
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setActiveChatType(contact.isGroup ? "group" : "private");

    // Update active chat
    setActiveChat({
      id: contact.id,
      type: contact.isGroup ? "group" : "private",
      name: contact.name,
      isOnline: contact.isOnline,
      avatar: contact.isGroup ? "👥" : contact.name.charAt(0),
      members: contact.groupMembers || 1,
      isGroup: contact.isGroup || false,
      isPublic: contact.isPublic || false,
      isAdmin: contact.isAdmin || false,
    });

    // Load messages for this contact
    loadMessagesForChat(contact.id);
  };

  // Function to load messages for a specific chat
  const loadMessagesForChat = (chatId) => {
    const demoMessages = {
      "private-1": [
        {
          id: "1-abc123",
          text: "ሰላም! እንዴት ነህ? 🇪🇹 ዛሬ እንዴት አለህ?",
          time: "10:30 AM",
          sender: "them",
          status: "read",
          canEdit: false,
          reactions: { "😂": 1, "❤️": 1 },
        },
        {
          id: "2-def456",
          text: "ደህና ነኝ! አመሰግናለሁ 🇪🇹 አንተስ?",
          time: "10:31 AM",
          sender: "me",
          status: "read",
          canEdit: true,
          reactions: { "👍": 2 },
        },
      ],
      "private-2": [
        {
          id: "3-ghi789",
          text: "መልካም ቀን! ትናንት ምን አደረግክ?",
          time: "9:15 AM",
          sender: "them",
          status: "read",
          canEdit: false,
        },
      ],
      "group-1": [
        {
          id: "4-jkl012",
          text: "Welcome to Ethiogram! 🇪🇹",
          time: "Yesterday",
          sender: "system",
          status: "read",
          canEdit: false,
          isAnnouncement: true,
        },
      ],
    };

    setMessages(demoMessages[chatId] || []);
  };

  // ==================== SOCKET FUNCTIONS ====================

  const setupSocketListeners = (socket) => {
    // Listen for incoming messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
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
          isAnnouncement: newMessage.isAnnouncement,
          fileData: newMessage.fileData,
          voiceData: newMessage.voiceData,
          timestamp: newMessage.timestamp,
        },
      ]);
    });

    // Listen for group events
    socket.on("group_created", (group) => {
      console.log("New group created:", group);
      setGroups((prev) => [group, ...prev]);
    });

    socket.on("user_joined_group", ({ groupId, user }) => {
      console.log(`${user.name} joined group ${groupId}`);
    });

    socket.on("user_left_group", ({ groupId, user }) => {
      console.log(`${user.name} left group ${groupId}`);
    });

    socket.on("group_updated", (updatedGroup) => {
      console.log("Group updated:", updatedGroup);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        )
      );
      if (activeChat.id === updatedGroup.id) {
        setActiveChat(updatedGroup);
      }
    });

    socket.on("announcement", ({ groupId, message, adminName }) => {
      if (activeChat.id === groupId) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: `📢 ${adminName}: ${message}`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: "system",
            isAnnouncement: true,
            status: "read",
          },
        ]);
      }
    });

    // Listen for typing indicators
    socket.on("user_typing", ({ userId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return [
            ...prev.filter((u) => u.id !== userId),
            { id: userId, name: userName },
          ];
        } else {
          return prev.filter((u) => u.id !== userId);
        }
      });
    });

    // Listen for user status changes
    socket.on("user_online", (user) => {
      console.log(`${user.name} came online`);
    });

    socket.on("user_offline", (user) => {
      console.log(`${user.name} went offline`);
    });
  };

  // ==================== CHAT FUNCTIONS ====================

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

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFilesSelected = (files) => {
    const fileMessages = files.map((fileObj, index) => ({
      id: generateUniqueId(),
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

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleSend = () => {
    if (message.trim() && socketRef.current) {
      const messageData = {
        text: replyingTo
          ? `Replying to: ${replyingTo.text}\n${message}`
          : message,
        chatId: activeChat.id,
        isFile: false,
        isVoice: false,
        isAnnouncement: false,
      };

      socketRef.current.emit("send_message", messageData);

      const newMessage = {
        id: generateUniqueId(),
        text: messageData.text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "me",
        status: "sent",
        canEdit: true,
        isFile: false,
        isVoice: false,
        isAnnouncement: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setReplyingTo(null);
      setShowEmojiPicker(false);

      socketRef.current.emit("stop_typing", activeChat.id);
    }
  };

  const sendAnnouncement = () => {
    if (message.trim() && socketRef.current && activeChat.isAdmin) {
      const announcementData = {
        text: message,
        chatId: activeChat.id,
        isAnnouncement: true,
      };

      socketRef.current.emit("send_announcement", announcementData);

      const newMessage = {
        id: generateUniqueId(),
        text: `📢 Announcement: ${message}`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "me",
        status: "sent",
        canEdit: true,
        isAnnouncement: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  const handleVoiceRecordingComplete = (audioBlob) => {
    const voiceMessage = {
      id: generateUniqueId(),
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
      duration: Math.floor(audioBlob.size / 16000),
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

  // ==================== GROUP MANAGEMENT FUNCTIONS ====================

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: generateUniqueId(),
      ...groupData,
      lastMessage: "Group created",
      time: "now",
      unread: 0,
      members: groupData.members.length,
      isOnline: true,
      isAdmin: true,
      pinned: false,
      muted: false,
    };

    if (socketRef.current) {
      socketRef.current.emit("create_group", newGroup);
    }

    setGroups([newGroup, ...groups]);
    setActiveChat(newGroup);
    setShowCreateGroup(false);
  };

  const handleAddMembers = (selectedMembers) => {
    if (socketRef.current && activeChat) {
      socketRef.current.emit("add_members", {
        groupId: activeChat.id,
        members: selectedMembers,
      });

      const updatedGroup = {
        ...activeChat,
        members: activeChat.members + selectedMembers.length,
      };
      setActiveChat(updatedGroup);
      setGroups((prev) =>
        prev.map((group) => (group.id === activeChat.id ? updatedGroup : group))
      );
    }
    setShowAddMembers(false);
  };

  const handleLeaveGroup = (groupId) => {
    if (socketRef.current) {
      socketRef.current.emit("leave_group", groupId);
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      if (activeChat.id === groupId) {
        setActiveChat(groups.find((g) => g.id !== groupId) || groups[0]);
      }
    }
  };

  const handleMuteGroup = (groupId, muted) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, muted } : group))
    );
  };

  const handlePinGroup = (groupId, pinned) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, pinned } : group))
    );
  };

  const handleGroupSettingsUpdate = (updatedSettings) => {
    const updatedGroup = { ...activeChat, ...updatedSettings };
    if (socketRef.current) {
      socketRef.current.emit("update_group", updatedGroup);
    }
    setActiveChat(updatedGroup);
    setGroups((prev) =>
      prev.map((group) => (group.id === activeChat.id ? updatedGroup : group))
    );
    setShowGroupSettings(false);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages([]);
    setShowGroupInfo(false);
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading Ethiogram...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-amharic">
      {/* Header */}
      <header className="bg-gradient-to-r from-ethio-green via-ethio-yellow to-ethio-red text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:opacity-90"
              onClick={() => currentUser && setShowProfileModal(true)}
            >
              <span className="text-3xl">{currentUser?.avatar || "🇪🇹"}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ethiogram</h1>
              <p className="text-sm opacity-90">
                {currentUser
                  ? `Welcome, ${currentUser.name}`
                  : "ኢትዮጵያዊ የመልእክት መረብ"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
              >
                Login / Signup
              </button>
            )}

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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-700">ውይይቶች</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="p-2 hover:bg-gray-200 rounded-full"
                      title="Add contact"
                    >
                      <FiUser className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="p-2 hover:bg-gray-200 rounded-full"
                      title="Create group"
                    >
                      <FiUsers className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Contacts Area */}
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(75vh - 200px)" }}
                >
                  {/* Pinned Groups */}
                  <div className="mb-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      📌 Pinned
                    </h3>
                    <div className="space-y-1">
                      {groups
                        .filter((group) => group.pinned)
                        .map((group) => (
                          <div key={group.id} className="contact-item">
                            <ContactItem
                              id={group.id}
                              name={group.name}
                              lastMessage={group.lastMessage}
                              time={group.time}
                              unread={group.unread}
                              isOnline={group.isOnline}
                              isGroup={true}
                              groupMembers={group.members}
                              onClick={handleContactClick}
                              isActive={activeChat.id === group.id}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* All Contacts & Groups */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      👥 All Chats ({contacts.length + groups.length})
                    </h3>
                    <div className="space-y-1">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="contact-item">
                          <ContactItem
                            id={contact.id}
                            name={contact.name}
                            lastMessage={contact.lastMessage}
                            time={contact.time}
                            unread={contact.unread}
                            isOnline={contact.isOnline}
                            isGroup={contact.isGroup}
                            groupMembers={contact.groupMembers}
                            onClick={handleContactClick}
                            isActive={activeChat.id === contact.id}
                          />
                        </div>
                      ))}
                      {groups
                        .filter((group) => !group.pinned)
                        .map((group) => (
                          <div key={group.id} className="contact-item">
                            <ContactItem
                              id={group.id}
                              name={group.name}
                              lastMessage={group.lastMessage}
                              time={group.time}
                              unread={group.unread}
                              isOnline={group.isOnline}
                              isGroup={true}
                              groupMembers={group.members}
                              onClick={handleContactClick}
                              isActive={activeChat.id === group.id}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile at bottom - stays fixed */}
              <div className="mt-auto p-4 border-t">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-ethio-yellow to-ethio-red rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser?.name?.charAt(0) || "እ"}
                  </div>
                  <div>
                    <p className="font-medium">{currentUser?.name || "እርስዎ"}</p>
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
                      {activeChat.avatar || "👥"}
                    </div>
                    {activeChat.type !== "group" && activeChat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-bold text-lg">{activeChat.name}</h2>
                      {activeChat.type === "group" && (
                        <>
                          {activeChat.isPublic ? (
                            <FiGlobe
                              className="w-4 h-4 text-gray-500"
                              title="Public group"
                            />
                          ) : (
                            <FiLock
                              className="w-4 h-4 text-gray-500"
                              title="Private group"
                            />
                          )}
                          {activeChat.isAdmin && (
                            <FiShield
                              className="w-4 h-4 text-blue-500"
                              title="Admin"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {activeChat.type === "group" ? (
                        <>
                          <span className="text-green-600">
                            {typingUsers.length > 0 ? (
                              <span className="flex items-center">
                                <span className="mr-2">
                                  {typingUsers.map((u) => u.name).join(", ")}{" "}
                                  {typingUsers.length === 1 ? "is" : "are"}{" "}
                                  typing
                                </span>
                                <span className="flex">
                                  <span className="typing-dot w-1 h-1 bg-green-600 rounded-full mx-0.5"></span>
                                  <span className="typing-dot w-1 h-1 bg-green-600 rounded-full mx-0.5"></span>
                                  <span className="typing-dot w-1 h-1 bg-green-600 rounded-full mx-0.5"></span>
                                </span>
                              </span>
                            ) : (
                              `${activeChat.members} አባላት`
                            )}
                          </span>
                          {activeChat.description && (
                            <span className="ml-2">
                              • {activeChat.description}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-green-600">
                          {typingUsers.length > 0
                            ? "Typing..."
                            : activeChat.isOnline
                            ? "በመስመር ላይ"
                            : "Offline"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {activeChat.type === "group" && (
                    <>
                      <button
                        onClick={() => setShowAddMembers(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Add members"
                      >
                        <FiUserPlus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowGroupSettings(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Group settings"
                      >
                        <FiSettings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowGroupInfo(!showGroupInfo)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Group info"
                      >
                        <FiUsers className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {activeChat.type !== "group" && (
                    <>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiPhone className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiVideo className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add Group Info Sidebar */}
              {showGroupInfo && activeChat.type === "group" && (
                <GroupInfoSidebar
                  group={activeChat}
                  onClose={() => setShowGroupInfo(false)}
                  onLeave={() => handleLeaveGroup(activeChat.id)}
                  onMute={() =>
                    handleMuteGroup(activeChat.id, !activeChat.muted)
                  }
                  onPin={() =>
                    handlePinGroup(activeChat.id, !activeChat.pinned)
                  }
                />
              )}

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
                        isAnnouncement={msg.isAnnouncement}
                        senderName={msg.senderName}
                        isGroupChat={activeChat.type === "group"}
                        isAdminMessage={msg.senderId === activeChat.admin}
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
                  {/* Admin announcement button */}
                  {activeChat.isAdmin && activeChat.type === "group" && (
                    <div className="mb-2">
                      <button
                        onClick={sendAnnouncement}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <FiBell className="w-4 h-4" />
                        <span>Send as announcement</span>
                      </button>
                    </div>
                  )}

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
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                    >
                      <FiPaperclip className="w-5 h-5 text-gray-500" />
                    </button>
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
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (socketRef.current) {
                            if (typingTimeoutRef.current) {
                              clearTimeout(typingTimeoutRef.current);
                            }
                            socketRef.current.emit(
                              "start_typing",
                              activeChat.id
                            );
                            typingTimeoutRef.current = setTimeout(() => {
                              socketRef.current.emit(
                                "stop_typing",
                                activeChat.id
                              );
                            }, 1000);
                          }
                        }}
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

        {/* Modals */}
        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
          contacts={allContacts}
        />

        <AddMembersModal
          isOpen={showAddMembers}
          onClose={() => setShowAddMembers(false)}
          onAdd={handleAddMembers}
          contacts={allContacts}
          existingMembers={[]}
        />

        <GroupSettingsModal
          isOpen={showGroupSettings}
          onClose={() => setShowGroupSettings(false)}
          onSave={handleGroupSettingsUpdate}
          group={activeChat}
        />
        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={showAddContact}
          onClose={() => setShowAddContact(false)}
          onAddContact={handleAddContact}
          existingContacts={contacts}
        />
        {/* Auth and Profile Modals */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => currentUser && setShowAuthModal(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />

        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={currentUser}
          onUpdate={handleProfileUpdate}
        />

        {/* Stats Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            Ethiogram -{" "}
            <span className="text-ethio-green">{groups.length}</span> ቡድኖች |{" "}
            <span className="text-ethio-blue">{activeChat.members}</span> አባላት
            በአሁኑ ቡድን
          </p>
          <p className="mt-1 text-xs">
            © 2024 Ethiogram - ሁሉም መብቶች የተጠበቁ ናቸው 🇪🇹
          </p>
        </div>
      </main>
    </div>
  );
}
