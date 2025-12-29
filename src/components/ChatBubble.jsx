"use client";

// import { convertToEthiopian } from "@/lib/ethiopianCalendar";
import { useState } from "react";
import {
  FiSmile,
  FiImage,
  FiFileText,
  FiVideo,
  FiDownload,
  FiPlay,
  FiMusic,
  FiCheck,
  FiCornerUpLeft,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiBell,
  FiShield,
} from "react-icons/fi";
import { MdAudiotrack } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";

const ChatBubble = ({
  message,
  time,
  isSent,
  status,
  canEdit,
  onDelete,
  onEdit,
  onReply,
  onReact,
  reactions = {},
  showReactionMenu,
  toggleReactionMenu,
  isAnnouncement,
  senderName,
  isGroupChat,
  isAdminMessage,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusIcon = () => {
    if (!isSent) return null;
    switch (status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓✓";
      default:
        return "✓";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFileText className="w-6 h-6" />;

    if (fileType.startsWith("image/"))
      return <FiImage className="w-6 h-6 text-blue-500" />;
    if (fileType.startsWith("video/"))
      return <FiVideo className="w-6 h-6 text-purple-500" />;
    if (fileType.startsWith("audio/"))
      return <MdAudiotrack className="w-6 h-6 text-green-500" />;
    if (fileType.includes("pdf"))
      return <FiFileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <FiFileText className="w-6 h-6 text-blue-600" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return <FiFileText className="w-6 h-6 text-green-600" />;

    return <FiFileText className="w-6 h-6 text-gray-500" />;
  };

  const handleDownload = () => {
    if (message.filePreview) {
      const link = document.createElement("a");
      link.href = message.filePreview;
      link.download = message.fileName || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Announcement Message Component
  if (isAnnouncement) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 max-w-md w-full shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <FiBell className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-yellow-700 text-sm">
                    📢 Announcement
                  </span>
                  {isAdminMessage && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FiShield className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{time}</span>
              </div>
              {senderName && (
                <p className="text-sm font-medium text-gray-800 mb-2">
                  From: {senderName}
                </p>
              )}
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {message.text}
              </p>
              <div className="mt-3 pt-2 border-t border-yellow-200 flex justify-end">
                <button
                  onClick={() => onReply && onReply(message)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 flex items-center"
                >
                  <FiCornerUpLeft className="w-3 h-3 mr-1" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Message Component
  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-4 group`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex flex-col items-end max-w-full">
        {/* Sender name for group chats */}
        {!isSent && isGroupChat && senderName && (
          <div className="mb-1 ml-2 self-start">
            <span className="text-xs font-medium text-gray-700">
              {senderName}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
            isSent
              ? "bg-bubble-sent text-white rounded-br-none"
              : "bg-bubble-received border border-gray-200 rounded-bl-none shadow-message"
          }`}
        >
          {/* File Message Content */}
          {message.isFile ? (
            <div className={`${isSent ? "text-white" : "text-gray-800"}`}>
              {/* File Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSent ? "bg-blue-400/20" : "bg-gray-100"
                  }`}
                >
                  {getFileIcon(message.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{message.fileName}</p>
                  <p className="text-xs opacity-75">
                    {formatFileSize(message.fileSize)}
                    {message.fileType &&
                      ` • ${
                        message.fileType.split("/")[1]?.toUpperCase() || "FILE"
                      }`}
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              {message.fileType?.startsWith("image/") &&
                message.filePreview &&
                !imageError && (
                  <div className="mt-2 mb-3">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={message.filePreview}
                        alt={message.fileName}
                        className="w-full h-48 object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}

              {/* Video Preview */}
              {message.fileType?.startsWith("video/") && (
                <div className="mt-2 mb-3">
                  <div className="relative rounded-lg overflow-hidden bg-black/10">
                    <div className="w-full h-48 flex items-center justify-center">
                      <FiVideo className="w-12 h-12 text-gray-400" />
                    </div>
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                        <FiPlay className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Audio Preview */}
              {message.fileType?.startsWith("audio/") && (
                <div className="mt-2 mb-3">
                  <div className="bg-black/5 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <MdAudiotrack className="w-8 h-8 text-gray-600" />
                      <div className="flex-1">
                        <div className="h-1 bg-gray-300 rounded-full">
                          <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          1:30 / 4:20
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Message */}
              {message.isVoice && (
                <div className={`${isSent ? "text-white" : "text-gray-800"}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-3 rounded-full ${
                        isSent ? "bg-blue-400/20" : "bg-gray-100"
                      }`}
                    >
                      <FaMicrophone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">ድምጽ መልእክት</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="flex items-center space-x-2">
                          <FiPlay className="w-4 h-4" />
                          <span className="text-sm">Play</span>
                        </button>
                        <span className="text-xs opacity-75">
                          {message.duration || 0}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className={`w-full py-2 rounded-lg flex items-center justify-center space-x-2 ${
                  isSent
                    ? "bg-blue-400/30 hover:bg-blue-400/40"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <FiDownload className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>
          ) : (
            /* Regular Text Message */
            <p className="text-[15px] leading-relaxed">{message.text}</p>
          )}

          {/* Message Actions Menu */}
          {showMenu && (
            <div
              className={`absolute -top-8 ${
                isSent ? "right-0" : "left-0"
              } flex space-x-1 ${
                isSent ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              } border rounded-full shadow-lg px-3 py-2`}
            >
              {isSent && canEdit && !message.isFile && (
                <>
                  <button
                    onClick={() => onEdit(message.id, message.text)}
                    className={`p-1 rounded-full hover:opacity-80 ${
                      isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                    }`}
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(message.id)}
                    className={`p-1 rounded-full ${
                      isSent
                        ? "hover:bg-blue-600"
                        : "hover:bg-gray-100 text-red-600"
                    }`}
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => onReply(message)}
                className={`p-1 rounded-full hover:opacity-80 ${
                  isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                }`}
                title="Reply"
              >
                <FiCornerUpLeft className="w-4 h-4" />
              </button>
              <button
                onClick={toggleReactionMenu}
                className={`p-1 rounded-full hover:opacity-80 ${
                  isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                }`}
                title="Add reaction"
              >
                <FiSmile className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded-full hover:opacity-80 ${
                  isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                }`}
                title="More options"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Footer */}
          <div
            className={`flex justify-between items-center mt-2 ${
              isSent ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span className="text-[11px]">{time}</span>
            <div className="flex items-center">
              {isGroupChat && isSent && (
                <span className="text-[10px] mr-2 opacity-75">
                  You • {time}
                </span>
              )}
              {getStatusIcon() && (
                <span className="text-[11px] ml-2">{getStatusIcon()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div
            className={`mt-1 flex flex-wrap ${
              isSent ? "justify-end" : "justify-start"
            }`}
          >
            {Object.entries(reactions).map(([emoji, count]) => (
              <div
                key={emoji}
                className={`text-xs ${
                  isSent
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                } rounded-full px-3 py-1 mr-1 mb-1 flex items-center cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => onReact && onReact(emoji)}
              >
                <span className="mr-1">{emoji}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Reactions Popup (when showReactionMenu is true) */}
        {showReactionMenu && (
          <div
            className={`mt-2 ${
              isSent ? "self-end" : "self-start"
            } bg-white border rounded-full shadow-lg px-3 py-2 flex space-x-2 z-10`}
          >
            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact && onReact(emoji);
                  toggleReactionMenu && toggleReactionMenu();
                }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
