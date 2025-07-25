import { Search} from "lucide-react";

const ConversationList = () => {
  const conversations = [
    {
      id: 1,
      name: "Sarah Baker",
      lastMessage: "Thanks for the cake recipe!",
      time: "2m ago",
      unread: 2,
      avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 2,
      name: "Cake Lovers Group",
      lastMessage: "New chocolate cake tutorial posted",
      time: "1h ago",
      unread: 0,
      avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 3,
      name: "Mike Johnson",
      lastMessage: "Can you make a custom cake for my wedding?",
      time: "3h ago",
      unread: 1,
      avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 4,
      name: "Mike Johnson",
      lastMessage: "Can you make a custom cake for my wedding?",
      time: "3h ago",
      unread: 1,
      avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    // {
    //   id: 5,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 6,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 7,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 8,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
  ];

  return (
    <div className="min-w-[180px] w-1/5 lg:w-1/4 flex flex-col bg-white rounded-l-xl shadow-sm border border-gray-100">
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

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer h-auto"
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
  );
};

export default ConversationList;
