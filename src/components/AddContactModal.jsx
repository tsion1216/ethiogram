"use client";

import { useState } from "react";
import {
  FiX,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiCheck,
} from "react-icons/fi";

const AddContactModal = ({
  isOpen,
  onClose,
  onAddContact,
  existingContacts = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    userId: "",
  });
  const [step, setStep] = useState(1); // 1: Search, 2: Add new

  if (!isOpen) return null;

  const handleSearch = () => {
    // In real app, search in database
    // For demo, if not found, go to add new
    setStep(2);
  };

  const handleAddContact = () => {
    if (contactInfo.name.trim()) {
      const newContact = {
        id: `contact-${Date.now()}`,
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        isOnline: true,
        lastMessage: "Contact added",
        time: "now",
        unread: 0,
        isGroup: false,
      };
      onAddContact(newContact);
      setContactInfo({ name: "", email: "", phone: "", userId: "" });
      setSearchTerm("");
      setStep(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {step === 1 ? "Add Contact" : "New Contact"}
              </h2>
              <p className="text-sm text-gray-500">
                {step === 1
                  ? "Search by name, email or phone"
                  : "Add contact details"}
              </p>
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
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                  placeholder="Search by name, email or phone..."
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="text-center py-8">
                <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  Search for users on Ethiogram
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-telegram-primary text-white rounded-lg hover:bg-blue-600"
                >
                  Add New Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-ethio-green to-ethio-blue rounded-full flex items-center justify-center text-white text-3xl">
                  {contactInfo.name.charAt(0) || "👤"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                    placeholder="Contact name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-primary"
                    placeholder="+251 9XX XXX XXX"
                  />
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
                    onClick={handleAddContact}
                    disabled={!contactInfo.name.trim()}
                    className={`px-4 py-2 rounded-lg ${
                      contactInfo.name.trim()
                        ? "bg-telegram-primary text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Add Contact
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
