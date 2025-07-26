import React, { useState, useEffect, useRef, use } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import {
  generateTrendingTopics,
  generateSuggestionGroups,
  generateUpcomingEvents,
} from "../data/mockData";
import { Link, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { authAPI } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import PostDetail from "./MyPost/PostDetail";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import InfiniteScroll from "react-infinite-scroll-component";
// import { toast } from "react-toastify";
dayjs.extend(relativeTime);

const Home = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const location = useLocation();
  const [likesData, setLikesData] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const videoRefs = useRef([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // Reset pagination state when navigating to Home
  useEffect(() => {
    if (location.pathname === "/home") {
      setPosts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchLikesForPosts = async () => {
      const initialLikes = {};
      for (const post of posts) {
        try {
          const res = await authAPI.getLikesByPostId(post.id);
          const data = res.likes;
          const totalLikes = res.total_likes || data.length;
          const liked = data.some((like) => like.user_id === currentUserId);
          initialLikes[post.id] = { liked, count: totalLikes };
        } catch (error) {
          console.error("Failed to fetch likes for post", post.id, error);
          initialLikes[post.id] = {
            liked: false,
            count: post.total_likes || 0,
          };
        }
      }
      setLikesData(initialLikes);
    };

    if (posts.length > 0) {
      fetchLikesForPosts();
    }
  }, [posts]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getPaginatedMemoryPosts(page, 5);
        console.log("Paginated response:", response);
        const newPosts = response.posts || [];
        setPosts((prev) => {
          const allPosts = [...prev, ...newPosts];
          const uniquePosts = Array.from(
            new Map(allPosts.map((post) => [post.id, post])).values()
          );
          return uniquePosts;
        });
        setHasMore(page < response.totalPages);
        if (page === 1) setFirstLoaded(true);
      } catch (error) {
        console.error("Failed to fetch paginated posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeIndex]);

  const handleLike = async (postId) => {
    try {
      await authAPI.likePost(postId);
      setLikesData((prev) => {
        const wasLiked = prev[postId]?.liked;
        const newCount = wasLiked
          ? prev[postId].count - 1
          : prev[postId].count + 1;
        return {
          ...prev,
          [postId]: {
            liked: !wasLiked,
            count: newCount,
          },
        };
      });
      // toast.success("This is a success message!")
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

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
                {firstLoaded ? (
                  <InfiniteScroll
                    dataLength={posts.length}
                    next={() => {
                      if (!loading && hasMore) setPage((prev) => prev + 1);
                    }}
                    hasMore={hasMore}
                    loader={
                      <div className="flex justify-center text-pink-500">
                        Loading posts...
                      </div>
                    }
                    endMessage={
                      <div className=" flex flex-col items-center justify-center mt-12 px-4 pt-2">
                        <BadgeCheck size={90} className="text-pink-400 mb-2" />
                        <span className="text-gray-500 text-md italic whitespace-nowrap">
                          No more posts.
                        </span>
                      </div>
                    }
                  >
                    {posts.length === 0 ? (
                      <div className="flex justify-center text-gray-500">
                        No posts found.
                      </div>
                    ) : (
                      posts.map((post) => (
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
                                    alt={post.user.full_name}
                                    className="w-11 h-11 rounded-full hover:opacity-80 transition"
                                  />
                                </Link>
                                <div className="text-left">
                                  <div className="flex items-center space-x-2">
                                    <Link
                                      to={`/user/${post.user.id}`}
                                      className="font-semibold text-gray-800 hover:text-pink-500 transition"
                                    >
                                      {post.user.full_name}
                                    </Link>
                                    <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      {post.MemoryPost.event_type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="relative rounded-lg overflow-hidden">
                              <Swiper
                                modules={[Pagination, Navigation]}
                                spaceBetween={10}
                                slidesPerView={1}
                                loop
                                pagination={{ clickable: true }}
                                navigation={{
                                  nextEl: ".custom-next",
                                  prevEl: ".custom-prev",
                                }}
                                onSlideChange={(swiper) =>
                                  setActiveIndex(swiper.realIndex)
                                }
                                className="rounded-lg"
                              >
                                {Array.isArray(post.media) &&
                                post.media.length > 0 ? (
                                  post.media.map((item, index) => (
                                    <SwiperSlide key={item.id}>
                                      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden">
                                        {item.image_url ? (
                                          <img
                                            src={item.image_url}
                                            alt="media"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : item.video_url ? (
                                          <video
                                            ref={(el) =>
                                              (videoRefs.current[index] = el)
                                            }
                                            src={item.video_url}
                                            autoPlay
                                            controls
                                            muted
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                                            No media
                                          </div>
                                        )}
                                      </div>
                                    </SwiperSlide>
                                  ))
                                ) : (
                                  <SwiperSlide>
                                    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden flex items-center justify-center bg-gray-200 text-gray-500">
                                      No media
                                    </div>
                                  </SwiperSlide>
                                )}

                                <div className="custom-prev absolute top-1/2 left-2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-pink-500 bg-white/80 backdrop-blur-sm">
                                    <ChevronLeft
                                      size={20}
                                      strokeWidth={2}
                                      className="text-pink-500"
                                    />
                                  </div>
                                </div>
                                <div className="custom-next absolute top-1/2 right-2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-pink-500 bg-white/80 backdrop-blur-sm">
                                    <ChevronRight
                                      size={20}
                                      strokeWidth={2}
                                      className="text-pink-500"
                                    />
                                  </div>
                                </div>
                              </Swiper>
                            </div>

                            <div className="flex items-center justify-between mt-4 mb-3">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleLike(post.id)}
                                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-500"
                                >
                                  <Heart
                                    className={`w-5 h-5 ${
                                      likesData[post.id]?.liked
                                        ? "fill-pink-500 text-pink-500"
                                        : ""
                                    }`}
                                  />
                                  <span className="text-sm">
                                    {likesData[post.id]?.count ??
                                      post.total_likes}
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPost(post);
                                    setIsPostDetailOpen(true);
                                  }}
                                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-500"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  <span className="text-sm">
                                    {post.total_comments}
                                  </span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                                  <Share className="w-5 h-5" />
                                </button>
                              </div>
                              <button className="text-gray-600 hover:text-yellow-500">
                                <Bookmark className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="text-left">
                              <p className="text-black text-sm">
                                {post.description}
                              </p>
                              <span className="text-gray-500 text-sm">
                                {dayjs(post.created_at).fromNow()}
                              </span>
                            </div>
                            <div
                              onClick={() => {
                                setSelectedPost(post);
                                setIsPostDetailOpen(true);
                              }}
                              className="text-gray-500 text-sm text-left"
                            >
                              View comments
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </InfiniteScroll>
                ) : (
                  <div className="flex justify-center text-pink-500">
                    Loading posts...
                  </div>
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
      <PostDetail
        isOpen={isPostDetailOpen}
        post={selectedPost}
        likesData={likesData}
        handleLike={handleLike}
        onClose={() => setIsPostDetailOpen(false)}
      />
    </div>
  );
};

export default Home;
