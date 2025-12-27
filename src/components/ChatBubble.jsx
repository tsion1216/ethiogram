"use client";
import { convertToEthiopian } from "@/lib/ethiopianCalendar";
import { useState } from "react";
import {
  FiSmile,
  FiImage,
  FiFileText,
  FiVideo,
  FiDownload,
  FiPlay,
  FiMusic,
} from "react-icons/fi";
import { MdAudiotrack } from "react-icons/md";

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

  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-2 group`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex flex-col items-end max-w-full">
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

              {/* ⬇️ ADD VOICE MESSAGE CODE RIGHT HERE ⬇️ */}
              {/* Voice Message */}
              {message.isVoice ? (
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
              ) : null}
              {/* ⬆️ END OF VOICE MESSAGE CODE ⬆️ */}

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

          {/* Message Actions */}
          {showMenu && (
            <div
              className={`absolute -top-6 ${
                isSent ? "right-0" : "left-0"
              } flex space-x-1 ${
                isSent ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              } border rounded-full shadow-sm px-2 py-1`}
            >
              {isSent && canEdit && !message.isFile && (
                <>
                  <button
                    onClick={() => onEdit(message.id, message.text)}
                    className={`text-xs px-2 hover:opacity-80 ${
                      isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(message.id)}
                    className={`text-xs px-2 ${
                      isSent
                        ? "text-red-200 hover:text-red-100 hover:bg-blue-600"
                        : "text-red-600 hover:text-red-700 hover:bg-gray-100"
                    }`}
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => onReply(message)}
                className={`text-xs px-2 hover:opacity-80 ${
                  isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                }`}
              >
                Reply
              </button>
              <button
                onClick={toggleReactionMenu}
                className={`text-xs px-2 hover:opacity-80 ${
                  isSent ? "hover:bg-blue-600" : "hover:bg-gray-100"
                }`}
              >
                <FiSmile className="inline w-3 h-3" />
              </button>
            </div>
          )}

          {/* Message Footer */}
          <div
            className={`flex justify-between items-center mt-2 ${
              isSent ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span className="text-[11px]">
              {
                time.includes("AM") || time.includes("PM")
                  ? convertToEthiopian(
                      new Date(`${new Date().toDateString()} ${time}`)
                    ).formatted
                  : time // Fallback for non-time formats
              }
            </span>
            <div className="flex items-center">
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
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                } rounded-full px-2 py-1 mr-1 mb-1 flex items-center`}
              >
                <span className="mr-1">{emoji}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
