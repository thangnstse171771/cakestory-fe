import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { authAPI } from "../../../api/auth";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const AlbumPostDetail = ({ isOpen, post, onClose }) => {
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);
  const { user: currentUser } = useAuth();

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
    if (isOpen && post?.id) {
      setLoading(true);
      authAPI
        .getAlbumPostById(post.id)
        .then((data) => setPostDetail(data.albumPost))
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
  const { Post, Album, name, description } = postDetail;
  const { title, media, created_at } = Post || {};
  const user = Album?.User;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
                <div className="text-gray-500 text-sm flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(created_at)}</span>
                </div>
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

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-pink-500 text-white px-2 py-1 rounded-full font-medium text-xs">
              {Album?.name || "No Album Name"}
            </span>
          </div>

          <div className="flex flex-wrap ">
            <a
              href={`/album/${Album?.id}`}
              className="text-sm text-pink-600 hover:underline mb-4"
            >
              View full album →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumPostDetail;
