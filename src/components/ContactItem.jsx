const ContactItem = ({
  id, // Add id prop
  name,
  lastMessage,
  time,
  unread,
  isOnline,
  onClick, // Add onClick prop
  isActive, // Add active state
  isGroup, // Add group indicator
  groupMembers, // For groups only
}) => {
  return (
    <div
      onClick={() => onClick && onClick({ id, name, isOnline, isGroup })} // Handle click
      className={`flex items-center p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors ${
        isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-ethio-green to-ethio-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
          {isGroup ? "👥" : name.charAt(0)}
        </div>
        {isOnline && !isGroup && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
        {isGroup && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-telegram-primary text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
            {groupMembers || 0}
          </div>
        )}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 truncate">
            {name}
            {isGroup && (
              <span className="ml-2 text-xs text-gray-500">Group</span>
            )}
          </h3>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
      </div>
      {unread > 0 && (
        <div className="ml-2">
          <span className="bg-ethio-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactItem;
