import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axios";

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
  const navigate = useNavigate();
  const { id } = useParams();

  // States
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", image: "" });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

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

  // Fetch challenge posts
  useEffect(() => {
    const fetchChallengePosts = async () => {
      setPostsLoading(true);
      try {
        // Fetch all challenge posts
        const response = await axiosInstance.get("/challenge-posts", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const allPosts = response.data.posts || response.data || [];
        console.log("All challenge posts:", allPosts);

        // Filter posts for current challenge if challenge ID is available
        let filteredPosts = allPosts;
        if (id) {
          filteredPosts = allPosts.filter(
            (post) =>
              post.challenge_id === parseInt(id) || post.challenge_id === id
          );
        }

        console.log(`Filtered posts for challenge ${id}:`, filteredPosts);

        // Transform API data to component format
        const transformedPosts = filteredPosts.map((post) => ({
          id: post.id || post.post_id,
          user: {
            name: post.user?.name || post.username || "Người dùng",
            avatar: post.user?.avatar || post.user_avatar || IMAGE_URL,
            level:
              post.user?.level ||
              `Bánh sư cấp ${Math.floor(Math.random() * 5) + 1}`,
          },
          content: post.content || post.description || "",
          image:
            post.image ||
            post.media_url ||
            (post.images && post.images[0]) ||
            null,
          likes: post.likes_count || post.likes || 0,
          comments: post.comments_count || post.comments || 0,
          timeAgo: formatTimeAgo(post.created_at || post.createdAt),
          isLiked: post.is_liked || false,
          challenge_id: post.challenge_id,
        }));

        setPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching challenge posts:", error);
        toast.error("Không thể tải bài đăng challenge");
        // Set empty array on error
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

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
        status: "ongoing",
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
  const handleCreatePost = async () => {
    // Check if posting is allowed
    const currentStatus = calculateChallengeStatus();
    if (!currentStatus.canPost) {
      toast.error(
        currentStatus.status === "notStarted"
          ? "Challenge chưa bắt đầu, không thể đăng bài"
          : currentStatus.status === "ended"
          ? "Challenge đã kết thúc, không thể đăng bài"
          : "Không thể đăng bài lúc này"
      );
      return;
    }

    if (!newPost.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài đăng");
      return;
    }

    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập để đăng bài");
        navigate("/login");
        return;
      }

      // Create post data
      const postData = {
        content: newPost.content,
        challenge_id: parseInt(id),
        image: newPost.image || null,
      };

      // Call API to create post
      const response = await axiosInstance.post("/challenge-posts", postData);

      const createdPost = response.data.post || response.data;

      // Transform and add to posts list
      const transformedPost = {
        id: createdPost.id || Date.now().toString(),
        user: {
          name: user.name || "Bạn",
          avatar: user.avatar || IMAGE_URL,
          level: user.level || "Bánh sư cấp 1",
        },
        content: newPost.content,
        image: newPost.image || null,
        likes: 0,
        comments: 0,
        timeAgo: "Vừa xong",
        isLiked: false,
        challenge_id: parseInt(id),
      };

      setPosts([transformedPost, ...posts]);
      setNewPost({ content: "", image: "" });
      setShowCreatePost(false);
      toast.success("Đăng bài thành công!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error.response?.data?.message || "Không thể đăng bài. Vui lòng thử lại!"
      );
    }
  };

  // Handle like post
  const handleLike = async (postId) => {
    try {
      // Call API to like/unlike post
      await axiosInstance.post(`/challenge-posts/${postId}/like`);

      // Update local state
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể thích bài đăng");
    }
  };

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
                      src={challengeInfo?.image || IMAGE_URL}
                      alt="challenge"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {challengeTitle}
                    </h1>
                    <p className="text-gray-600">Nhóm thảo luận và chia sẻ</p>
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
                      status === "ongoing"
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
            ) : !showCreatePost ? (
              <button
                onClick={() => setShowCreatePost(true)}
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
                <textarea
                  placeholder="Chia sẻ về tiến trình làm bánh của bạn..."
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:border-pink-300 focus:outline-none"
                  rows="3"
                />
                <div className="flex items-center justify-between">
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded flex items-center">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Thêm ảnh
                  </button>
                  <div className="space-x-2">
                    <button
                      className="border border-gray-300 px-3 py-1 rounded text-gray-700"
                      onClick={() => setShowCreatePost(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-1 rounded"
                      onClick={handleCreatePost}
                    >
                      Đăng bài
                    </button>
                  </div>
                </div>
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
          ) : posts.length === 0 ? (
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
            posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 bg-white shadow-sm rounded-lg"
              >
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={post.user.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-pink-100 object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {post.user.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="border border-pink-200 text-pink-600 text-xs px-2 py-0.5 rounded">
                          {post.user.level}
                        </span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 mb-4">{post.content}</p>

                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Challenge post"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center text-sm ${
                          post.isLiked ? "text-pink-500" : "text-gray-600"
                        } hover:text-pink-500`}
                      >
                        <svg
                          className={`w-4 h-4 mr-1 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                          />
                        </svg>
                        {post.likes}
                      </button>
                      <button className="flex items-center text-sm text-gray-600 hover:text-pink-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        {post.comments}
                      </button>
                      <button className="flex items-center text-sm text-gray-600 hover:text-pink-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More - Only show if there are posts */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <button className="border border-gray-300 text-gray-700 hover:bg-pink-50 px-4 py-2 rounded">
              Xem thêm bài đăng
            </button>
          </div>
        )}

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
    </div>
  );
}
