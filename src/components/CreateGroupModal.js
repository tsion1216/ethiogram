"use client";

import { useState } from "react";
import { FiX, FiSearch, FiUser, FiGlobe, FiLock } from "react-icons/fi";

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
  contacts,
}) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedMembers.some((m) => m.id === contact.id)
  );

  const handleSelectMember = (member) => {
    setSelectedMembers([...selectedMembers, member]);
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const handleSubmit = () => {
    onCreate({
      name: groupName,
      description,
      isPublic,
      members: selectedMembers,
      avatar: "👥",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {step === 1 ? "Create New Group" : "Add Members"}
              </h2>
              <p className="text-sm text-gray-500">Step {step} of 2</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-ethio-green to-ethio-blue rounded-full flex items-center justify-center text-white text-3xl">
                  👥
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                  placeholder="What's this group about?"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      isPublic
                        ? "border-telegram-primary bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <FiGlobe className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-gray-500">Anyone can join</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      !isPublic
                        ? "border-telegram-primary bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <FiLock className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-gray-500">Invite only</p>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!groupName.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    groupName.trim()
                      ? "bg-telegram-primary text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next: Add Members
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                  placeholder="Search contacts..."
                />
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected Members ({selectedMembers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
                      >
                        <span className="mr-2">{member.name}</span>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Contacts */}
              <div className="max-h-60 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Available Contacts
                </p>
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleSelectMember(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-ethio-yellow to-ethio-red rounded-full flex items-center justify-center text-white font-bold">
                          {contact.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">
                            {contact.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-200 rounded-full">
                        <FiUser className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <div className="space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-telegram-primary text-white rounded-lg hover:bg-blue-600"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
