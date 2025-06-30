import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  generatePosts,
  generateTrendingTopics,
  generateSuggestionGroups,
  generateUpcomingEvents,
} from "../data/mockData";
import { Link } from "react-router-dom";

const POSTS_PER_LOAD = 10;

const Home = () => {
  const [postCount, setPostCount] = useState(POSTS_PER_LOAD);
  const [posts, setPosts] = useState(() => generatePosts(postCount));
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  // Tự động tải thêm bài viết khi cuộn xuống cuối trang
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          setTimeout(() => {
            const newCount = postCount + POSTS_PER_LOAD;
            setPostCount(newCount);
            setPosts(generatePosts(newCount));
            setLoading(false);
          }, 500); // Thêm delay nhỏ để tránh tải quá nhanh
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [postCount, loading]);

  const trendingTopics = generateTrendingTopics(5);
  const suggestionGroups = generateSuggestionGroups(4);
  const upcomingEvents = generateUpcomingEvents(4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex gap-6 max-w-6xl w-full">
            {/* Main Content */}
            <div className="flex-1 max-w-xl">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h1 className="text-2xl font-bold text-pink-600">
                  Community Feed
                </h1>
                <div className="flex items-center space-x-2 bg-white rounded-xl border px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">Search posts</span>
                </div>
              </div>

              <div className="min-w-[275px] space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Link to={`/user/${post.user.id}`}>
                            <img
                              src={post.user.avatar || "/placeholder.svg"}
                              alt={post.user.name}
                              className="w-11 h-11 rounded-full hover:opacity-80 transition"
                            />
                          </Link>
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/user/${post.user.id}`}
                                className="font-semibold text-gray-800 hover:text-pink-500 transition"
                              >
                                {post.user.name}
                              </Link>
                              {post.user.badge && (
                                <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {post.user.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {post.timeAgo}
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Cake post"
                        className="w-full h-full object-cover rounded-lg mb-4"
                      />

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
                            <Share className="w-5 h-5" />
                          </button>
                        </div>
                        <button className="text-gray-600 hover:text-yellow-500">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-left">
                        <p className="text-black text-sm">{post.description}</p>
                        <span className="text-gray-500 text-sm">
                          {post.timeAgo}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm text-left">
                        View comments
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                ref={observerTarget}
                className="h-10 flex items-center justify-center"
              >
                {loading && (
                  <div className="text-pink-500">Đang tải thêm bài viết...</div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-45 lg:w-60 xl:w-80 space-y-4">
              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-pink-600 font-medium">
                        {topic.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {topic.posts}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="text-pink-500 text-sm mt-2 hover:text-pink-600">
                  View all topics
                </button>
              </div>

              {/* Suggestion Groups */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Suggestion Groups
                </h3>
                <div className="space-y-2">
                  {suggestionGroups.map((group, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 text-xs font-bold">
                          CG
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">
                          {group.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {group.members}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-pink-500 text-sm mt-2 hover:text-pink-600">
                  View all groups
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Upcoming Events
                </h3>
                <div className="space-y-2">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-pink-200 pl-3"
                    >
                      <div className="font-medium text-gray-800 text-sm">
                        {event.name}
                      </div>
                      <div className="text-gray-500 text-xs">{event.date}</div>
                    </div>
                  ))}
                </div>
                <button className="text-pink-500 text-sm mt-2 hover:text-pink-600">
                  View all events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
