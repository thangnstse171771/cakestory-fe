import React, { useState, useEffect, useRef } from "react";
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
  Star,
  ShoppingCart,
  CakeSlice,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";
import { authAPI } from "../../api/auth";
import { fetchAllShops, fetchMarketplacePosts } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import PostDetail from "../MyPost/PostDetail";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import InfiniteScroll from "react-infinite-scroll-component";
import HomeSideBar from "./HomeSideBar";
import { Button } from "antd";
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
  const [marketPost, setMarketPost] = useState([]);
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const getShops = async () => {
      try {
        const res = await fetchAllShops();
        const shops = res?.shops;
        console.log(shops);
        setShops(shops);
      } catch (error) {
        console.error("Error fetching shop:", error);
        setShops([]);
      }
    };

    getShops();
  }, []);

  useEffect(() => {
    const getMarketPosts = async () => {
      try {
        const res = await fetchMarketplacePosts();
        const posts = res?.posts;
        setMarketPost(posts);
      } catch (error) {
        console.error("Error fetching marketplace posts:", error);
        // Set empty array on error to prevent undefined issues
        setMarketPost([]);
      }
    };

    getMarketPosts();
  }, []);

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
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex gap-6 max-w-6xl w-full">
            {/* Main Content */}
            <div className="flex-1 flex-col max-w-xl">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h1 className="text-2xl font-bold text-pink-600">
                  Bài Viết Cộng Đồng
                </h1>
                <div className="flex items-center bg-white rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-pink-500 transition">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm bài viết..."
                    className="outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              {shops.length > 1 && (
                <div>
                  <div className="flex flex-row items-center gap-2">
                    <ShoppingCart className="text-pink-600" />
                    <span className="font-semibold">Gợi ý Shop</span>
                  </div>
                  <div className="bg-white w-full max-w-4xl mx-auto mb-4 mt-4">
                    {Array.isArray(shops) && shops.length > 0 && (
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                          nextEl: ".shop-next",
                          prevEl: ".shop-prev",
                        }}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop={shops.length > 1}
                        className="rounded-xl shadow-lg bg-white [&_.swiper-pagination]:hidden"
                      >
                        {shops.map((shop, index) => (
                          <SwiperSlide key={shop.shop_id || index}>
                            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mx-8">
                              {/* Avatar */}
                              <div className="flex flex-row items-center">
                                <img
                                  src={shop.avatar_image}
                                  alt={shop.business_name || "Shop Avatar"}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-pink-500 flex-shrink-0"
                                />

                                {/* Text Info */}
                                <div className="ml-4 flex flex-col max-w-[250px]">
                                  <p className="text-pink-600 font-bold text-lg leading-tight truncate">
                                    <Link
                                      className="hover:text-pink-400 cursor-pointer"
                                      to={`/marketplace/shop/${shop.user?.id}`}
                                    >
                                      {shop.business_name || "Shop Name"}
                                    </Link>
                                  </p>
                                  <h3 className="text-gray-500 text-sm leading-snug truncate">
                                    {shop.bio || "This is a sweets shop"}
                                  </h3>
                                </div>
                              </div>

                              <div className="text-gray-400">
                                <Link
                                  className="hover:text-pink-600 cursor-pointer"
                                  to={`/marketplace/shop/${shop.user?.id}`}
                                >
                                  Xem shop
                                </Link>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}

                        {/* Custom Navigation Buttons */}
                        {shops.length > 1 && (
                          <>
                            <button className="shop-prev absolute top-1/2 left-2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full border border-pink-500 bg-white/90 backdrop-blur-sm shadow-lg">
                                <ChevronLeft
                                  size={20}
                                  strokeWidth={2}
                                  className="text-pink-500"
                                />
                              </div>
                            </button>
                            <button className="shop-next absolute top-1/2 right-2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full border border-pink-500 bg-white/90 backdrop-blur-sm shadow-lg">
                                <ChevronRight
                                  size={20}
                                  strokeWidth={2}
                                  className="text-pink-500"
                                />
                              </div>
                            </button>
                          </>
                        )}
                      </Swiper>
                    )}
                  </div>
                </div>
              )}

              {marketPost.length > 1 && (
                <div className="mt-8">
                  <div className="flex flex-row items-center gap-2">
                    <CakeSlice className="text-pink-600" />
                    <span className="font-semibold">Gợi ý Sản Phẩm</span>
                  </div>
                  <div className="relative w-full max-w-7xl mx-auto mb-4 px-4">
                    <div className="relative">
                      <Swiper
                        modules={[
                          Navigation,
                          Pagination,
                          Autoplay,
                          EffectCoverflow,
                        ]}
                        spaceBetween={30}
                        slidesPerView={1}
                        centeredSlides={true}
                        navigation={{
                          nextEl: ".marketplace-next",
                          prevEl: ".marketplace-prev",
                        }}
                        pagination={{
                          clickable: true,
                          dynamicBullets: true,
                        }}
                        autoplay={{
                          delay: 4000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        loop={marketPost.length > 1}
                        effect="coverflow"
                        coverflowEffect={{
                          rotate: 0,
                          stretch: 20,
                          depth: 200, // pushes side cards back more
                          modifier: 2, // exaggerates the scaling effect
                          scale: 1, // default is 1 for center; bump this for more size difference
                          slideShadows: false,
                        }}
                        breakpoints={{
                          640: {
                            slidesPerView: 1.2,
                            spaceBetween: 20,
                          },
                          768: {
                            slidesPerView: 1.5,
                            spaceBetween: 30,
                          },
                          1024: {
                            slidesPerView: 2.2,
                            spaceBetween: 40,
                          },
                        }}
                        className="marketplace-swiper !pb-7 [&_.swiper-pagination]:hidden"
                      >
                        {marketPost.map((post, index) => {
                          const firstImage =
                            post.post?.media && post.post.media.length > 0
                              ? post.post.media[0].image_url
                              : null;

                          return (
                            <SwiperSlide
                              key={post.post_id || index}
                              className="!h-auto"
                            >
                              <div className="group relative mt-5 h-[500px] bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                                {/* Image Container */}
                                <div className="relative overflow-hidden">
                                  {firstImage ? (
                                    <div className="relative h-72 overflow-hidden">
                                      <img
                                        src={
                                          firstImage ||
                                          "https://png.pngtree.com/png-clipart/20240906/original/pngtree-fruit-cake-icons-flat-vector-illustration-png-image_15952460.png"
                                        }
                                        alt={
                                          post.post?.title ||
                                          "Marketplace Image"
                                        }
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                      {/* Floating Elements */}
                                      {/* <div className="absolute top-4 left-4 flex gap-2">
                                      {post.post?.category && (
                                        <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-0 shadow-lg">
                                          {post.post.category}
                                        </Badge>
                                      )}
                                    </div> */}
                                    </div>
                                  ) : (
                                    <div className="h-72 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                      <div className="text-gray-400 text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                                          <Star className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm">
                                          No image available
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                  {/* Title and Rating */}
                                  <div className="space-y-2">
                                    <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-pink-400 transition-colors duration-200">
                                      {post.post?.title ||
                                        "Check out this amazing marketplace item!"}
                                    </h3>

                                    {/* {post.post?.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i <
                                            Math.floor(post.post.rating || 0)
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-sm text-gray-600 ml-1">
                                        ({post.post.rating})
                                      </span>
                                    </div>
                                  )} */}
                                  </div>

                                  {/* Shop Info */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <img
                                        src={post.shop?.avatar_image}
                                        alt={
                                          post.shop?.business_name ||
                                          "Shop Avatar"
                                        }
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                      ></img>

                                      <div>
                                        <p className="font-medium text-sm text-gray-500">
                                          <Link
                                            className="cursor-pointer"
                                            to={`/marketplace/shop/${post.shop?.user?.id}`}
                                          >
                                            {post.shop?.business_name ||
                                              "Marketplace Shop"}
                                          </Link>
                                        </p>
                                      </div>
                                    </div>

                                    {/* {post.cakeSizes?.[0]?.price && (
                                    <div className="text-right">
                                      <span className="inline-block bg-pink-100 text-pink-600 text-sm font-bold px-3 py-1 rounded-full shadow-sm border border-pink-200">
                                        {post.cakeSizes?.[0]?.price} VNĐ
                                      </span>
                                    </div>
                                  )} */}
                                  </div>

                                  {/* Action Button */}

                                  <Link
                                    className="flex justify-center items-center w-full bg-gradient-to-r from-pink-600 to-pink-400 hover:from-gray-300 hover:to-white text-white hover:text-pink-500 font-medium py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer border border-transparent hover:border-pink-500"
                                    to={`/marketplace/product/${post.post_id}`}
                                  >
                                    <button>Chi tiết</button>
                                  </Link>
                                </div>

                                {/* Decorative Elements */}
                                {/* <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                      {/* Custom Navigation Buttons */}
                      {marketPost.length > 1 && (
                        <>
                          <button className="marketplace-prev absolute top-1/2 -left-6 -translate-y-1/2 z-20 cursor-pointer group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-pink-500 bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-300">
                              <ChevronLeft
                                size={24}
                                strokeWidth={2.5}
                                className="text-gray-600 transition-colors duration-300"
                              />
                            </div>
                          </button>

                          <button className="marketplace-next absolute top-1/2 -right-6 -translate-y-1/2 z-20 cursor-pointer group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-pink-500 bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-300">
                              <ChevronRight
                                size={24}
                                strokeWidth={2.5}
                                className="text-gray-600 transition-colors duration-300"
                              />
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="min-w-[275px] space-y-4">
                {firstLoaded ? (
                  <InfiniteScroll
                    dataLength={posts.length}
                    next={() => {
                      if (!loading && hasMore) setPage((prev) => prev + 1);
                    }}
                    hasMore={hasMore}
                    loader={
                      <div className="flex justify-center text-pink-500 text-lg font-medium animate-pulse">
                        Đang tải...
                      </div>
                    }
                    endMessage={
                      posts.length > 0 ? (
                        <div className=" flex flex-col items-center justify-center mt-12 px-4 pt-2">
                          <BadgeCheck
                            size={90}
                            className="text-pink-400 mb-2"
                          />
                          <span className="text-gray-500 text-md italic whitespace-nowrap">
                            Bạn đã xem hết bài viết.
                          </span>
                        </div>
                      ) : null
                    }
                  >
                    {!loading && posts.length === 0 ? (
                      <div className="flex justify-center text-gray-500">
                        Không có bài viết nào.
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4"
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
                                      {post.user.username}
                                    </Link>
                                    <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      {post.MemoryPost.event_type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
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
                                            muted
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={(e) => {
                                              const vid = e.currentTarget;
                                              if (vid.paused) {
                                                vid.play();
                                              } else {
                                                vid.pause();
                                              }
                                            }}
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                                            Không có phương tiện
                                          </div>
                                        )}
                                      </div>
                                    </SwiperSlide>
                                  ))
                                ) : (
                                  <SwiperSlide>
                                    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden flex items-center justify-center bg-gray-200 text-gray-500">
                                      Không có phương tiện
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
                                {/* <button className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                                  <Share className="w-5 h-5" />
                                </button> */}
                              </div>
                              {/* <button className="text-gray-600 hover:text-yellow-500">
                                <Bookmark className="w-5 h-5" />
                              </button> */}
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
                              <span className="cursor-pointer">
                                Xem bình luận
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </InfiniteScroll>
                ) : (
                  <div className="flex justify-center text-pink-500 text-lg font-medium animate-pulse">
                    Đang tải...
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <HomeSideBar />
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
