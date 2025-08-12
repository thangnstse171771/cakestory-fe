import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import PostDetail from "../MyPost/PostDetail";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [likesData, setLikesData] = useState({});
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingResults, setLoadingResults] = useState(true);

  const query = new URLSearchParams(location.search).get("q") || "";

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

  useEffect(() => {
    if (!query) return;
    (async () => {
      try {
        const data = await authAPI.searchMemoryPost(query);
        setResults(data.posts || []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
        setLoadingResults(false);
      } finally {
        setLoadingResults(false);
      }
    })();
  }, [query]);

  // Fetch likes
  useEffect(() => {
    if (!results.length) return;

    const fetchLikesForPosts = async () => {
      const likes = {};
      for (const post of results) {
        try {
          const res = await authAPI.getLikesByPostId(post.id);
          const totalLikes = res.total_likes || res.likes.length;
          const liked = res.likes.some(
            (like) => like.user_id === currentUserId
          );
          likes[post.id] = { liked, count: totalLikes };
        } catch {
          likes[post.id] = { liked: false, count: post.total_likes || 0 };
        }
      }
      setLikesData(likes);
    };

    fetchLikesForPosts();
  }, [results, currentUserId]);

  const handleLike = async (postId) => {
    try {
      await authAPI.likePost(postId);
      setLikesData((prev) => {
        const wasLiked = prev[postId]?.liked;
        return {
          ...prev,
          [postId]: {
            liked: !wasLiked,
            count: wasLiked ? prev[postId].count - 1 : prev[postId].count + 1,
          },
        };
      });
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  if (loadingResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Results for <span className="text-pink-500">"{query}"</span>
      </h1>

      {!loadingResults && results.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        results.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
          >
            {/* User Info */}
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
                        {post.user.username}
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

              {/* Media Carousel */}
              <div className="relative">
                <Swiper
                  modules={[Pagination, Navigation]}
                  spaceBetween={10}
                  slidesPerView={1}
                  loop
                  pagination={{ clickable: true }}
                  navigation={{
                    nextEl: `.next-${post.id}`,
                    prevEl: `.prev-${post.id}`,
                  }}
                  onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                >
                  {post.media?.length > 0 ? (
                    post.media.map((item, index) => (
                      <SwiperSlide key={item.id}>
                        <div className="aspect-[4/5] bg-gray-100">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : item.video_url ? (
                            <video
                              ref={(el) => (videoRefs.current[index] = el)}
                              src={item.video_url}
                              autoPlay
                              controls
                              muted
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 rounded-lg">
                              No media
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div className="aspect-[4/5] flex items-center justify-center bg-gray-100 text-gray-500">
                        No media
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>

                {/* Custom Nav Buttons */}
                <button
                  className={`prev-${post.id} absolute top-1/2 left-2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:scale-105 transition`}
                >
                  <ChevronLeft className="text-pink-500" />
                </button>
                <button
                  className={`next-${post.id} absolute top-1/2 right-2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:scale-105 transition`}
                >
                  <ChevronRight className="text-pink-500" />
                </button>
              </div>

              {/* Post Actions */}
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
                      {likesData[post.id]?.count ?? post.total_likes}
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
                    <span className="text-sm">{post.total_comments}</span>
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
                <p className="text-black text-sm">{post.description}</p>
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
                <span className="cursor-pointer">View comments</span>
              </div>
            </div>
          </div>
        ))
      )}
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

export default SearchResults;
