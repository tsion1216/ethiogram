"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "ሰላም! እንዴት ነህ? 🇪🇹", time: "10:30 AM", sender: "them" },
    { id: 2, text: "ደህና ነኝ! አመሰግናለሁ 🇪🇹", time: "10:31 AM", sender: "me" },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "me",
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-t-2xl shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-4xl">🇪🇹</span>
            Ethiogram
          </h1>
          <p className="text-blue-100 mt-1">ኢትዮጵያዊ የመልእክት መረብ</p>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row h-[70vh]">
            {/* Sidebar - Left */}
            <div className="md:w-1/4 bg-gray-50 border-r p-4">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ውይይቶችን ይፈልጉ..."
                    className="w-full p-3 pl-10 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              {/* Contact List */}
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition-all">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        አ
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">Abebe Bekele</p>
                      <p className="text-sm text-green-600">በመስመር ላይ</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      ጥ
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Tigist Worku</p>
                      <p className="text-sm text-gray-500">ከ 2 ሰዓት በፊት</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area - Right */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                    አ
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Abebe Bekele</h2>
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      በመስመር ላይ
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    📞
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    🎥
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-blue-50/50 to-white">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                          msg.sender === "me"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                            : "bg-white border rounded-bl-none shadow-sm"
                        }`}
                      >
                        <p className="text-lg">{msg.text}</p>
                        <div
                          className={`flex justify-between items-center mt-2 ${
                            msg.sender === "me"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">{msg.time}</span>
                          {msg.sender === "me" && (
                            <span className="text-xs">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full text-xl">
                    😊
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="መልእክት ይጻፉ..."
                    className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    <span className="hidden md:inline">Send</span>
                    <span className="md:hidden">📤</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">Ethiogram - ሰዎችን በኢትዮጵያዊ መንገድ የሚያገናኝ 🇪🇹</p>
          <p className="text-xs mt-1">Made with ❤️ in Ethiopia</p>
        </div>
      </div>
    </div>
  );
}
