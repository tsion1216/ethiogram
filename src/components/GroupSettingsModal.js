"use client";

import { useState, useEffect } from "react";
import { FiX, FiGlobe, FiLock, FiShield, FiBell } from "react-icons/fi";

export default function GroupSettingsModal({ isOpen, onClose, onSave, group }) {
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    isPublic: true,
    allowInvites: true,
    allowPinnedMessages: true,
    allowReactions: true,
    slowMode: false,
    slowModeDuration: 5,
    announcementOnly: false,
  });

  useEffect(() => {
    if (group) {
      setSettings({
        name: group.name || "",
        description: group.description || "",
        isPublic: group.isPublic || true,
        allowInvites: true,
        allowPinnedMessages: true,
        allowReactions: true,
        slowMode: false,
        slowModeDuration: 5,
        announcementOnly: false,
      });
    }
  }, [group]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Group Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                placeholder="Group description"
                rows="3"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.isPublic ? (
                    <FiGlobe className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiLock className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium">Group Type</p>
                    <p className="text-sm text-gray-500">
                      {settings.isPublic
                        ? "Public - Anyone can join"
                        : "Private - Invite only"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isPublic}
                    onChange={(e) =>
                      setSettings({ ...settings, isPublic: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-telegram-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiShield className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Admin Only</p>
                    <p className="text-sm text-gray-500">
                      Only admins can send messages
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementOnly}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementOnly: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiBell className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Slow Mode</p>
                    <p className="text-sm text-gray-500">
                      Limit how often users can post
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.slowMode}
                    onChange={(e) =>
                      setSettings({ ...settings, slowMode: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {settings.slowMode && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay between messages (seconds)
                  </label>
                  <select
                    value={settings.slowModeDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        slowModeDuration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                  >
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-telegram-primary text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
