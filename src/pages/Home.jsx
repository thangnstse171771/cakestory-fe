import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Search,
} from "lucide-react";

const Home = () => {
  const posts = [
    {
      id: 1,
      user: {
        name: "Name",
        avatar: "/placeholder.svg?height=40&width=40",
        badge: "Design",
      },
      image: "/placeholder.svg?height=300&width=400",
      likes: 1847,
      comments:
        "Thú nghiệm là chocolate meringue với lớp kem #chocolatecake #heartcake",
      timeAgo: "This comment",
    },
    {
      id: 2,
      user: {
        name: "LanAnhXinhYeu",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "/placeholder.svg?height=300&width=400",
      likes: 892,
      comments:
        "Thú nghiệm là lemon meringue với kem ngọt này, ngon! #lemoncake #heartcake",
      timeAgo: "This comment",
    },
  ];

  const trendingTopics = [
    { name: "#trending", posts: "1st posts" },
    { name: "#buttercream", posts: "89 posts" },
    { name: "#tutorial", posts: "67 posts" },
    { name: "#chocolatecake", posts: "64 posts" },
    { name: "#heartcake", posts: "32 posts" },
  ];

  const suggestionGroups = [
    { name: "Cake Decorating Beginner", members: "847 members" },
    { name: "Professional Bakers Network", members: "1.2k members" },
    { name: "Fondant Artistry", members: "956 members" },
    { name: "Cake Decorating Beginner", members: "847 members" },
  ];

  const upcomingEvents = [
    { name: "Virtual Cake Decorating Workshop", date: "Jan 15, 2024" },
    { name: "Baking Competition", date: "Jan 20, 2024" },
    { name: "Virtual Cake Decorating Workshop", date: "Jan 25, 2024" },
    { name: "Virtual Cake Decorating Workshop", date: "Jan 30, 2024" },
  ];

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-pink-600">Community Feed</h1>
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Search posts</span>
            </div>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.user.avatar || "/placeholder.svg"}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">
                            {post.user.name}
                          </span>
                          {post.user.badge && (
                            <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                              {post.user.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">
                          2 hours ago
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Cake post"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="text-gray-600 hover:text-yellow-500">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-700 text-sm">{post.comments}</p>
                  <span className="text-gray-500 text-xs">{post.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Trending Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-pink-600 font-medium">
                    {topic.name}
                  </span>
                  <span className="text-gray-500 text-sm">{topic.posts}</span>
                </div>
              ))}
            </div>
            <button className="text-pink-500 text-sm mt-3 hover:text-pink-600">
              View all topics
            </button>
          </div>

          {/* Suggestion Groups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Suggestion Groups
            </h3>
            <div className="space-y-3">
              {suggestionGroups.map((group, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 text-xs font-bold">CG</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">
                      {group.name}
                    </div>
                    <div className="text-gray-500 text-xs">{group.members}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-pink-500 text-sm mt-3 hover:text-pink-600">
              View all groups
            </button>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-2 border-pink-200 pl-3">
                  <div className="font-medium text-gray-800 text-sm">
                    {event.name}
                  </div>
                  <div className="text-gray-500 text-xs">{event.date}</div>
                </div>
              ))}
            </div>
            <button className="text-pink-500 text-sm mt-3 hover:text-pink-600">
              View all events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
