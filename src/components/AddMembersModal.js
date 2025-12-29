"use client";

import { useState } from "react";
import { FiX, FiSearch, FiUser, FiCheck } from "react-icons/fi";

export default function AddMembersModal({
  isOpen,
  onClose,
  onAdd,
  contacts,
  existingMembers,
}) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Filter out already existing members
  const availableContacts = contacts.filter(
    (contact) =>
      !existingMembers.some((m) => m.id === contact.id) &&
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMember = (member) => {
    if (selectedMembers.some((m) => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSubmit = () => {
    onAdd(selectedMembers);
    setSelectedMembers([]);
    setSearchTerm("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add Members</h2>
              <p className="text-sm text-gray-500">
                Select contacts to add to the group
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

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

            {/* Selected Count */}
            {selectedMembers.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  {selectedMembers.length} member
                  {selectedMembers.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            {/* Contacts List */}
            <div className="max-h-80 overflow-y-auto">
              {availableContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No contacts found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMembers.some((m) => m.id === contact.id)
                          ? "bg-telegram-primary bg-opacity-10 border border-telegram-primary"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectMember(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-ethio-yellow to-ethio-red rounded-full flex items-center justify-center text-white font-bold">
                            {contact.avatar}
                          </div>
                          {contact.isOnline && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">
                            {contact.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      {selectedMembers.some((m) => m.id === contact.id) ? (
                        <div className="w-6 h-6 bg-telegram-primary rounded-full flex items-center justify-center">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedMembers.length === 0}
                className={`px-4 py-2 rounded-lg ${
                  selectedMembers.length > 0
                    ? "bg-telegram-primary text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Add{" "}
                {selectedMembers.length > 0
                  ? `${selectedMembers.length} Members`
                  : "Members"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
