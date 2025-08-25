import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react";
import axiosInstance from "../../api/axios";
import CreateChallengePost from "./ChallengePost/CreateChallengePost";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ChallengePostDetail from "./ChallengePost/ChallengePostDetail";
dayjs.extend(relativeTime);

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

// Helper function to count participants
const countParticipants = (entries, challengeId) => {
  if (!entries || !Array.isArray(entries)) {
    return 0;
  }
  return entries.filter((entry) => entry.challenge_id === challengeId).length;
};

export default function ChallengeGroup() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const navigate = useNavigate();
  const { id } = useParams();

  // States
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", image: "" });
  const [posts, setPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);
  const [likesData, setLikesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

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

  // Fetch challenge info
  useEffect(() => {
    const fetchChallengeInfo = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch challenge details
        const response = await axiosInstance.get(`/challenges/${id}`);
        setChallengeInfo(response.data.challenge || response.data);
      } catch (error) {
        console.error("Error fetching challenge info:", error);
        setError("Không thể tải thông tin challenge");
        toast.error("Không thể tải thông tin challenge");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeInfo();
  }, [id]);

  // Fetch participant count
  useEffect(() => {
    const fetchParticipantCount = async () => {
      if (!id) return;

      setIsLoadingCount(true);
      try {
        const response = await axiosInstance.get(`/challenge-entries`, {
          params: {
            timestamp: Date.now(),
            _: Math.random(),
          },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const entries = response.data.entries || [];
        console.log("Fresh entries from API:", entries);

        const actualCount = countParticipants(entries, parseInt(id));
        console.log(
          `Actual participant count for challenge ${id}:`,
          actualCount
        );

        setParticipantCount(actualCount);
      } catch (error) {
        console.error("Error fetching participant count:", error);
        setParticipantCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchParticipantCount();
  }, [id]);

  useEffect(() => {
    const fetchLikesForPosts = async () => {
      const initialLikes = {};
      for (const post of posts) {
        try {
          const res = await authAPI.getLikesByPostId(post.post_id);
          const data = res.likes;
          const totalLikes = res.total_likes || data.length;
          const liked = data.some((like) => like.user_id === currentUserId);

          initialLikes[post.post_id] = {
            liked,
            count: totalLikes,
            liking: false,
          };
        } catch (error) {
          console.error("Failed to fetch likes for post", post.post_id, error);
          initialLikes[post.post_id] = {
            liked: false,
            count: post.total_likes || 0,
            liking: false,
          };
        }
      }
      setLikesData(initialLikes);
    };

    if (posts.length > 0) {
      fetchLikesForPosts();
    }
  }, [posts]);

  const handleLike = async (postId) => {
    if (challengeInfo?.status !== "onGoing") {
      return;
    }
    try {
      // set loading = true for this post
      setLikesData((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liking: true,
        },
      }));

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
            liking: false, // reset loading
          },
        };
      });
    } catch (error) {
      console.error("Failed to toggle like", error);

      // reset loading on error
      setLikesData((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liking: false,
        },
      }));
    }
  };

  // Fetch challenge posts
  const fetchChallengePosts = async () => {
    setPostsLoading(true);
    try {
      // Fetch all challenge posts
      const response = await authAPI.getChallengePostsByChallengeId(id);
      const allChallPosts = response.posts;

      console.log("All challenge posts:", allChallPosts);
      setPosts(allChallPosts);

      // Check if current user already has a post
      const alreadyPosted = allChallPosts.some(
        (post) => post.user_id === currentUserId
      );
      setShowCreatePost(!alreadyPosted); // true if they haven't posted yet
    } catch (error) {
      console.error("Error fetching challenge posts:", error);
      setPosts([]);
      setShowCreatePost(true); // allow button if error
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengePosts();
  }, [id]);

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Vừa xong";

    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return postDate.toLocaleDateString("vi-VN");
  };

  // Calculate challenge status and days left
  const calculateChallengeStatus = () => {
    if (!challengeInfo?.start_date || !challengeInfo?.end_date) {
      return {
        status: "unknown",
        daysLeft: 0,
        statusText: "Chưa xác định",
        canPost: false,
      };
    }

    const now = new Date();
    const startDate = new Date(challengeInfo.start_date);
    const endDate = new Date(challengeInfo.end_date);

    // Calculate days left to end date
    const diffTime = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (now < startDate) {
      // Challenge hasn't started yet
      const daysToStart = Math.ceil(
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        status: "notStarted",
        daysLeft: daysToStart,
        statusText: `Challenge chưa bắt đầu (còn ${daysToStart} ngày)`,
        canPost: false,
      };
    } else if (now >= startDate && now <= endDate) {
      // Challenge is ongoing
      return {
        status: "onGoing",
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        statusText: "Đang hoạt động",
        canPost: true,
      };
    } else {
      // Challenge has ended
      return {
        status: "ended",
        daysLeft: 0,
        statusText: "Đã kết thúc",
        canPost: false,
      };
    }
  };

  // Create new post
  // const handleCreatePost = async () => {
  //   // Check if posting is allowed
  //   const currentStatus = calculateChallengeStatus();
  //   if (!currentStatus.canPost) {
  //     toast.error(
  //       currentStatus.status === "notStarted"
  //         ? "Challenge chưa bắt đầu, không thể đăng bài"
  //         : currentStatus.status === "ended"
  //         ? "Challenge đã kết thúc, không thể đăng bài"
  //         : "Không thể đăng bài lúc này"
  //     );
  //     return;
  //   }

  //   if (!newPost.content.trim()) {
  //     toast.error("Vui lòng nhập nội dung bài đăng");
  //     return;
  //   }

  //   try {
  //     // Get current user
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user?.id) {
  //       toast.error("Vui lòng đăng nhập để đăng bài");
  //       navigate("/login");
  //       return;
  //     }

  //     // Create post data
  //     const postData = {
  //       content: newPost.content,
  //       challenge_id: parseInt(id),
  //       image: newPost.image || null,
  //     };

  //     // Call API to create post
  //     const response = await axiosInstance.post("/challenge-posts", postData);

  //     const createdPost = response.data.post || response.data;

  //     // Transform and add to posts list
  //     const transformedPost = {
  //       id: createdPost.id || Date.now().toString(),
  //       user: {
  //         name: user.name || "Bạn",
  //         avatar: user.avatar || IMAGE_URL,
  //         level: user.level || "Bánh sư cấp 1",
  //       },
  //       content: newPost.content,
  //       image: newPost.image || null,
  //       likes: 0,
  //       comments: 0,
  //       timeAgo: "Vừa xong",
  //       isLiked: false,
  //       challenge_id: parseInt(id),
  //     };

  //     setPosts([transformedPost, ...posts]);
  //     setNewPost({ content: "", image: "" });
  //     setShowCreatePost(false);
  //     toast.success("Đăng bài thành công!");
  //   } catch (error) {
  //     console.error("Error creating post:", error);
  //     toast.error(
  //       error.response?.data?.message || "Không thể đăng bài. Vui lòng thử lại!"
  //     );
  //   }
  // };

  // Handle like post
  // const handleLike = async (postId) => {
  //   try {
  //     // Call API to like/unlike post
  //     await axiosInstance.post(`/challenge-posts/${postId}/like`);

  //     // Update local state
  //     setPosts(
  //       posts.map((post) =>
  //         post.id === postId
  //           ? {
  //               ...post,
  //               isLiked: !post.isLiked,
  //               likes: post.isLiked ? post.likes - 1 : post.likes + 1,
  //             }
  //           : post
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error liking post:", error);
  //     toast.error("Không thể thích bài đăng");
  //   }
  // };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF5F7" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF5F7" }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const challengeTitle = challengeInfo?.title || `Challenge ${id}`;
  const memberCount = isLoadingCount ? "Đang tải..." : participantCount;

  // Get challenge status and days left
  const challengeStatus = calculateChallengeStatus();
  const { status, daysLeft, statusText, canPost } = challengeStatus;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-700 hover:text-gray-800 hover:bg-pink-50 flex items-center px-3 py-2 rounded"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </button>

        {/* Header */}
        <div className="mb-6 border border-gray-200 bg-white shadow-sm rounded-lg">
          <div className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-pink-100 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                    <img
                      src={challengeInfo?.avatar || IMAGE_URL}
                      alt="challenge"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {challengeTitle}
                    </h1>
                    <p className="text-gray-600">
                      {challengeInfo?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75"
                      />
                    </svg>
                    <span className="font-semibold">
                      {isLoadingCount
                        ? "Đang tải..."
                        : `${participantCount} thành viên`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {status === "notStarted"
                        ? `Bắt đầu sau ${daysLeft} ngày`
                        : status === "ended"
                        ? "Đã kết thúc"
                        : `Còn ${daysLeft} ngày`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded text-xs font-medium">
                    Đã tham gia
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      status === "onGoing"
                        ? "bg-green-100 text-green-700"
                        : status === "notStarted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className="mb-6 border border-gray-200 bg-white rounded-lg">
          <div className="p-4">
            {!canPost ? (
              <div className="text-center py-4">
                <svg
                  className="w-8 h-8 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">
                  {status === "notStarted"
                    ? "Challenge chưa bắt đầu"
                    : status === "ended"
                    ? "Challenge đã kết thúc"
                    : "Không thể đăng bài lúc này"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {status === "notStarted"
                    ? `Bạn có thể đăng bài khi challenge bắt đầu`
                    : status === "ended"
                    ? "Challenge đã kết thúc, không thể đăng bài mới"
                    : "Vui lòng thử lại sau"}
                </p>
              </div>
            ) : showCreatePost ? (
              <button
                onClick={() => setOpenCreatePost(true)}
                className="w-full border border-gray-300 text-gray-700 hover:bg-pink-50 px-4 py-2 rounded flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Chia sẻ tiến trình challenge của bạn
              </button>
            ) : (
              <div className="space-y-4">
                <span>Hãy lượn 1 vòng xem bài viết nào!</span>
              </div>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Bài đăng từ cộng đồng ({posts.length} bài)
          </h3>

          {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải bài đăng...</p>
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <p className="text-gray-600 mb-2">Chưa có bài đăng nào</p>
              <p className="text-gray-500 text-sm">
                Hãy là người đầu tiên chia sẻ tiến trình challenge!
              </p>
            </div>
          ) : (
            posts.map((challPost) => (
              <div
                key={challPost.post_id}
                className="border border-gray-200 bg-white shadow-sm rounded-lg"
              >
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={
                        challPost.post.user.avatar ||
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-pink-100 object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {challPost.post.user.username}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>
                          {dayjs(challPost.post.created_at).fromNow()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 mb-4">
                    {challPost.post.description}
                  </p>

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
                      {Array.isArray(challPost.post.media) &&
                      challPost.post.media.length > 0 ? (
                        challPost.post.media.map((item, index) => (
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
                                  ref={(el) => (videoRefs.current[index] = el)}
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

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center w-full">
                      <button
                        onClick={() => handleLike(challPost.post_id)}
                        disabled={
                          likesData[challPost.post_id]?.liking ||
                          challengeInfo?.status !== "onGoing" ||
                          challPost.post.user.role !== "user"
                        }
                        className={`flex-1 flex items-center justify-center space-x-2 
                                    ${
                                      challengeInfo?.status !== "onGoing" ||
                                      challPost.post.user.role !== "user"
                                        ? "cursor-not-allowed opacity-50"
                                        : "text-gray-600 hover:text-pink-500"
                                    }`}
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            likesData[challPost.post_id]?.liked
                              ? "fill-pink-500 text-pink-500"
                              : ""
                          }`}
                        />
                        <span className="text-lg">
                          {likesData[challPost.post_id]?.count ??
                            challPost.post.total_likes}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(challPost);
                          setIsPostDetailOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-pink-500"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-lg">
                          {challPost.post.total_comments}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More - Only show if there are posts */}
        {/* {posts.length > 0 && (
          <div className="text-center mt-8">
            <button className="border border-gray-300 text-gray-700 hover:bg-pink-50 px-4 py-2 rounded">
              Xem thêm bài đăng
            </button>
          </div>
        )} */}

        {/* Go to Challenge Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(`/challenge`)}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white py-2 rounded-lg"
          >
            Về danh sách Challenge
          </button>
        </div>
      </div>
      <CreateChallengePost
        isOpen={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
        onCreate={fetchChallengePosts}
        challengeId={id}
      />
      <ChallengePostDetail
        isOpen={isPostDetailOpen}
        challPost={selectedPost}
        likesData={likesData}
        handleLike={handleLike}
        onClose={() => setIsPostDetailOpen(false)}
        challInfo={challengeInfo}
      />
    </div>
  );
}
