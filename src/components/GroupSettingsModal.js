"use client";

import {
  FiX,
  FiUsers,
  FiCalendar,
  FiLock,
  FiGlobe,
  FiBell,
  FiArchive,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

export default function GroupInfoSidebar({
  group,
  onClose,
  onLeave,
  onMute,
  onPin,
}) {
  const members = [
    { id: 1, name: "You", role: "admin", isOnline: true, avatar: "እ" },
    { id: 2, name: "Abebe Bekele", role: "admin", isOnline: true, avatar: "A" },
    {
      id: 3,
      name: "Tigist Worku",
      role: "member",
      isOnline: true,
      avatar: "T",
    },
    {
      id: 4,
      name: "Kaleb Getachew",
      role: "member",
      isOnline: false,
      avatar: "K",
    },
    { id: 5, name: "Meron Abebe", role: "member", isOnline: true, avatar: "M" },
  ];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l shadow-lg z-40">
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Group Info</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Group Info */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-ethio-green to-ethio-blue rounded-full flex items-center justify-center text-white text-3xl mb-3">
              {group.avatar || "👥"}
            </div>
            <h3 className="text-xl font-bold">{group.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{group.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              {group.isPublic ? (
                <>
                  <FiGlobe className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">Public Group</span>
                </>
              ) : (
                <>
                  <FiLock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-500">Private Group</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {group.members}
              </p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">127</p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Members</h3>
            <span className="text-sm text-gray-500">
              {members.length}/{group.members}
            </span>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-ethio-yellow to-ethio-red rounded-full flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      {member.role === "admin" && (
                        <FiShield className="w-3 h-3 mr-1 text-blue-500" />
                      )}
                      {member.role}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {member.isOnline ? "Online" : "Last seen 2h ago"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Group Actions */}
        <div className="p-4">
          <h3 className="font-medium text-gray-700 mb-3">Group Actions</h3>
          <div className="space-y-1">
            <button
              onClick={onMute}
              className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg text-left"
            >
              <div className="flex items-center space-x-3">
                <FiBell
                  className={`w-5 h-5 ${
                    group.muted ? "text-red-500" : "text-gray-500"
                  }`}
                />
                <span>
                  {group.muted ? "Unmute Notifications" : "Mute Notifications"}
                </span>
              </div>
            </button>

            <button
              onClick={onPin}
              className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg text-left"
            >
              <div className="flex items-center space-x-3">
                <FiArchive
                  className={`w-5 h-5 ${
                    group.pinned ? "text-yellow-500" : "text-gray-500"
                  }`}
                />
                <span>{group.pinned ? "Unpin Chat" : "Pin Chat"}</span>
              </div>
            </button>

            <button className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg text-left text-red-600">
              <div className="flex items-center space-x-3">
                <FiLogOut className="w-5 h-5" />
                <span>Leave Group</span>
              </div>
            </button>
          </div>
        </div>

        {/* Group Info Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiCalendar className="w-4 h-4" />
            <span>
              Created on {new Date(group.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
