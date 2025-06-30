import React, { useEffect, useState, useRef } from "react";
import { X, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { authAPI } from "../../api/auth";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const PostDetail = ({ isOpen, post, onClose }) => {
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
  videoRefs.current.forEach((video, idx) => {
    if (video) {
      if (idx === activeIndex) {
        video.play().catch(() => {}); // try to play, ignore errors
      } else {
        video.pause();
        // video.currentTime = 0; // optionally reset time
      }
    }
  });
}, [activeIndex]);

  useEffect(() => {
    if (isOpen && post?.id) {
      setLoading(true);
      authAPI
        .getMemoryPostById(post.id)
        .then((data) => setPostDetail(data.post))
        .catch(() => setPostDetail(null))
        .finally(() => setLoading(false));
    } else {
      setPostDetail(null);
    }
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  if (loading || !postDetail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4 py-12">
        <div className="bg-white rounded-md shadow-2xl max-w-[600px] w-full p-8 text-center">
          <p className="text-gray-500">Loading post details...</p>
        </div>
      </div>
    );
  }

  // Map fields from API response
  const { title, description, user, media, MemoryPost } = postDetail;

  const eventDate = MemoryPost?.event_date
    ? new Date(MemoryPost.event_date).toLocaleDateString("en-GB")
    : "";
  const eventType = MemoryPost?.event_type || "";

  const mockComments = [
    {
      id: 1,
      username: "bakerQueen",
      content: "This cake is stunning!",
      time: "2 hours ago",
      likes: 12,
      replies: 3,
    },
    {
      id: 2,
      username: "sweetTooth42",
      content: "Would love to order this!",
      time: "5 hours ago",
      likes: 7,
      replies: 0,
    },
    {
      id: 3,
      username: "frostingFan",
      content: "That frosting looks perfect 😍",
      time: "1 day ago",
      likes: 19,
      replies: 2,
    },
    {
      id: 4,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 5,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 6,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 7,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 8,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 9,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 10,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 11,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 12,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 13,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
    {
      id: 14,
      username: "cakeLover99",
      content: "Absolutely love the design!",
      time: "2 days ago",
      likes: 15,
      replies: 1,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4 py-12">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100 z-10"
      >
        <X className="w-6 h-6 text-gray-500" />
      </button>
      <div className="bg-white rounded-md shadow-2xl max-w-[1220px] max-h-[650px] w-full flex flex-col md:flex-row overflow-hidden relative">
        {/* Image Section */}
        <div className="md:w-1/2 w-full bg-black flex items-center justify-center">
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
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-80 md:h-full"
          >
            {Array.isArray(media) && media.length > 0 ? (
              media.map((item, index) => (
                <SwiperSlide key={item.id}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt="media"
                      className="object-cover w-full h-80 md:h-full"
                    />
                  ) : item.video_url ? (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={item.video_url}
                      autoPlay
                      controls
                      muted
                      className="object-cover w-full h-80 md:h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-80 md:h-full bg-gray-200 text-gray-500">
                      No media
                    </div>
                  )}
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="flex items-center justify-center w-full h-80 md:h-full bg-gray-200 text-gray-500">
                  No media
                </div>
              </SwiperSlide>
            )}
            <div className="custom-prev absolute left-2 top-1/2 z-10 cursor-pointer">
              <svg width="32" height="32" fill="none">
                <path
                  d="M20 8l-8 8 8 8"
                  stroke="#ec4899"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="custom-next absolute right-2 top-1/2 z-10 cursor-pointer">
              <svg width="32" height="32" fill="none">
                <path
                  d="M12 8l8 8-8 8"
                  stroke="#ec4899"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Swiper>
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 w-full px-5 py-4 flex flex-col relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || "https://placehold.co/100x100?text=User"}
                alt={user?.username}
                className="w-11 h-11 rounded-full"
              />
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  {user?.full_name || user?.username}
                </div>
                <div className="text-gray-500 text-sm">{eventDate}</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg md:text-2xl font-bold text-pink-600 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            {description}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-pink-500">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">{postDetail.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{postDetail.comments || 0}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">
              {eventType}
            </span>
          </div>

          {/* 🗨 Comments Section */}
          {/* 🗨 Scrollable Comments Section */}
          <div className="mb-4">
            <div className="text-gray-500 text-sm mb-2">Comments</div>
            <div className="space-y-2 max-h-48 md:max-h-72 overflow-y-auto pr-2 ">
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className="py-1 border-b border-gray-100 pb-3"
                >
                  {/* Comment Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 pr-1">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {comment.time}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-gray-700 text-sm">{comment.content}</p>

                  {/* Actions: Likes + Replies */}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                      {comment.replies}{" "}
                      {comment.replies === 1 ? "reply" : "replies"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ➕ Add Comment (mock input) */}
          <form className="flex gap-2 sticky bottom-0 bg-white py-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
