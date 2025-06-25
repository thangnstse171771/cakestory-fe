import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

export default function ChallengeGroup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const challengeTitle = "Challenge Bánh Kem Hoa Hồng";

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", image: "" });
  const [posts, setPosts] = useState([
    {
      id: "1",
      user: {
        name: "Minh Anh",
        avatar: IMAGE_URL,
        level: "Bánh sư cấp 3",
      },
      content:
        "Vừa hoàn thành bánh kem hoa hồng đầu tiên của mình! Cảm ơn challenge này đã giúp mình thử thách bản thân 🌹",
      image: IMAGE_URL,
      likes: 24,
      comments: 8,
      timeAgo: "2 giờ trước",
      isLiked: false,
    },
    {
      id: "2",
      user: {
        name: "Thanh Hoa",
        avatar: IMAGE_URL,
        level: "Bánh sư cấp 2",
      },
      content:
        "Ngày thứ 5 của challenge! Hôm nay thử làm bánh cupcake với kem bơ màu hồng. Ai có tips gì không ạ?",
      image: IMAGE_URL,
      likes: 18,
      comments: 12,
      timeAgo: "4 giờ trước",
      isLiked: true,
    },
  ]);

  const handleCreatePost = () => {
    if (newPost.content.trim()) {
      const post = {
        id: Date.now().toString(),
        user: {
          name: "Bạn",
          avatar: IMAGE_URL,
          level: "Bánh sư cấp 1",
        },
        content: newPost.content,
        image: IMAGE_URL,
        likes: 0,
        comments: 0,
        timeAgo: "Vừa xong",
        isLiked: false,
      };
      setPosts([post, ...posts]);
      setNewPost({ content: "", image: "" });
      setShowCreatePost(false);
    }
  };

  const handleLike = (postId) => {
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
  };

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
                      src={IMAGE_URL}
                      alt="avatar"
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
                    <span className="font-semibold">248 thành viên</span>
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
                    <span>Còn 12 ngày</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded text-xs font-medium">
                    Đã tham gia
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className="mb-6 border border-gray-200 bg-white rounded-lg">
          <div className="p-4">
            {!showCreatePost ? (
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
                        d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10m11 0h-1m-4 0h-1"
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
            Bài đăng từ cộng đồng
          </h3>

          {posts.map((post) => (
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
                          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"
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
                          d="M4 12v2a2 2 0 002 2h8m4-4v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"
                        />
                      </svg>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="border border-gray-300 text-gray-700 hover:bg-pink-50 px-4 py-2 rounded">
            Xem thêm bài đăng
          </button>
        </div>
      </div>
    </div>
  );
}
