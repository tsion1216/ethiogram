"use client";

const MessageMenu = ({ messageId, messageText, onDelete, onEdit, onReply }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg border w-32">
      <button
        onClick={onReply}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Reply
      </button>
      <button
        onClick={onEdit}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
      >
        Delete
      </button>
    </div>
  );
};

export default MessageMenu;
