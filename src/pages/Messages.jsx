import { Search, Phone, Video, MoreHorizontal } from "lucide-react";

const Messages = () => {
  const conversations = [
    {
      id: 1,
      name: "Sarah Baker",
      lastMessage: "Thanks for the cake recipe!",
      time: "2m ago",
      unread: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Cake Lovers Group",
      lastMessage: "New chocolate cake tutorial posted",
      time: "1h ago",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Mike Johnson",
      lastMessage: "Can you make a custom cake for my wedding?",
      time: "3h ago",
      unread: 1,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className="w-1/3 bg-white rounded-l-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={conversation.avatar || "/placeholder.svg"}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-r-xl shadow-sm border-t border-r border-b border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/placeholder.svg?height=40&width=40"
                alt="Sarah Baker"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-800">Sarah Baker</h3>
                <span className="text-sm text-green-500">Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Hi! I loved your chocolate cake recipe. Could you share more
                    details about the frosting?
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    10:30 AM
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Of course! I use a Swiss meringue buttercream. The key is to
                    whip the egg whites to soft peaks first.
                  </p>
                  <span className="text-xs text-pink-100 mt-1 block">
                    10:32 AM
                  </span>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Thanks for the cake recipe!
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    10:35 AM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
