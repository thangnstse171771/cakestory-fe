"use client";

import { use, useState, useEffect } from "react";
import {
  Search,
  Heart,
  MessageCircle,
  Plus,
  Filter,
  Grid,
  List,
  MoreVertical,
} from "lucide-react";
import CreatePost from "./CreatePost";
import UpdatePost from "./UpdatePost";
import DeletePostPopup from "./DeletePostPopup";
import PostDetail from "./PostDetail";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

const MyPost = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isUpdatePostOpen, setIsUpdatePostOpen] = useState(false);
  const [isDeletePostOpen, setIsDeletePostOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const currentUserId = user?.id;
  const [likesData, setLikesData] = useState({});

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

  const handleLike = async (postId) => {
    try {
      await authAPI.likePost(postId); // your likePost function that can like/unlike
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

  // Mock data for posts
  // const posts = [
  //   {
  //     id: 1,
  //     image:
  //       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop",
  //     title: "Chocolate Cake",
  //     description: "A rich and decadent chocolate cake with ganache frosting",
  //     likes: 245,
  //     comments: 32,
  //     date: "2024-03-15",
  //     category: "Birthday",
  //   },
  //   {
  //     id: 2,
  //     image:
  //       "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=500&fit=crop",
  //     title: "Wedding Cake",
  //     description: "Elegant three-tier wedding cake with floral decorations",
  //     likes: 189,
  //     comments: 24,
  //     date: "2024-03-14",
  //     category: "Wedding",
  //   },
  //   {
  //     id: 3,
  //     image:
  //       "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&h=500&fit=crop",
  //     title: "Birthday Special",
  //     description: "Colorful birthday cake with custom decorations",
  //     likes: 156,
  //     comments: 18,
  //     date: "2024-03-13",
  //     category: "Birthday",
  //   },
  //   {
  //     id: 4,
  //     image:
  //       "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=500&h=500&fit=crop",
  //     title: "Cupcake Collection",
  //     description: "Assorted cupcakes with various flavors and toppings",
  //     likes: 98,
  //     comments: 12,
  //     date: "2024-03-12",
  //     category: "Cupcakes",
  //   },
  //   {
  //     id: 5,
  //     image:
  //       "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop",
  //     title: "Red Velvet",
  //     description: "Classic red velvet cake with cream cheese frosting",
  //     likes: 167,
  //     comments: 21,
  //     date: "2024-03-11",
  //     category: "Classic",
  //   },
  //   {
  //     id: 6,
  //     image:
  //       "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500&h=500&fit=crop",
  //     title: "Fruit Cake",
  //     description: "Traditional fruit cake with mixed dried fruits",
  //     likes: 134,
  //     comments: 15,
  //     date: "2024-03-10",
  //     category: "Traditional",
  //   },
  // ];

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const user = authAPI.getCurrentUser();
      if (!user) {
        setError("User not logged in");
        setPosts([]);
        setLoading(false);
        return;
      }
      const data = await authAPI.getMemoryPostByUserId(user.id);
      const mappedPosts = (data.posts || []).map((item) => ({
        id: item.Post.id,
        title: item.Post.title,
        description: item.Post.description,
        date: item.event_date,
        category: item.event_type,
        media: item.Post.media,
        user: item.Post.user,
        created_at: item.Post.created_at,
        is_public: item.Post.is_public,
      }));
      setPosts(mappedPosts);
    } catch (err) {
      setError("Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    setLoading(true);
    try {
      await authAPI.deleteMemoryPost(selectedPost.id);
      setIsDeletePostOpen(false); // close popup
      setPosts((prevPosts) =>
        prevPosts.filter((p) => p.id !== selectedPost.id)
      );
      setSelectedPost(null);
    } catch (error) {
      console.error("Delete post failed:", error);
      setError("Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "birthday", label: "Birthday" },
    { id: "wedding", label: "Wedding" },
    { id: "anniversary", label: "Anniversary" },
    { id: "reunion", label: "Reunion" },
  ];

  const filteredPosts = posts.filter((post) => {
    const title = post.title || "";
    const description = post.description || "";
    const category = post.category || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || category.toLowerCase() === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Gradient Background */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-pink-600 mb-2 text-left">
                My Posts
              </h1>
              <p className="text-gray-600">
                Manage and share your cake creations
              </p>
            </div>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-pink-500" />
              </div>
              <input
                type="text"
                placeholder="Search your posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-gray/20 rounded-xl placeholder-pink-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-pink-500 text-white backdrop-blur-sm border border-white/20 rounded-xl hover:bg-pink-400 transition-all duration-300">
                <Filter className="w-5 h-5" />
              </button>
              <div className="flex bg-pink-500 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden text-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "grid" ? "bg-pink-600" : "hover:bg-white/10"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "list" ? "bg-pink-600" : "hover:bg-white/10"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedFilter === filter.id
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Posts Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        ) : error ? (
          <div className="min-h-screen flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredPosts.map((post) => {
              const firstImage = post.media?.find((m) => m.image_url);
              const firstVideo = post.media?.find((m) => m.video_url);
              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    viewMode === "list" ? "flex h-48" : ""
                  }`}
                >
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-48" : "aspect-square"
                    }`}
                  >
                    {/* <img
                    src={
                      post.media?.find((m) => m.image_url)?.image_url ||
                      post.media?.find((m) => m.video_url)?.video_url ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsPostDetailOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  /> */}

                    {firstImage ? (
                      <img
                        src={firstImage.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsPostDetailOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    ) : firstVideo ? (
                      <video
                        src={firstVideo.video_url}
                        className="w-full h-full object-cover"
                        muted
                        onClick={() => {
                          setSelectedPost(post);
                          setIsPostDetailOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <img
                        src="https://placehold.co/600x400?text=No+Image"
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsPostDetailOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    )}

                    <div className="absolute top-2 right-2">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === post.id ? null : post.id
                            )
                          }
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openDropdown === post.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsUpdatePostOpen(true);
                                setSelectedPost(post);
                              }}
                              className="w-full px-4 py-2 text-left font-semibold text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsDeletePostOpen(true);
                                setSelectedPost(post);
                              }}
                              className="w-full px-4 py-2 text-left font-semibold text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 flex flex-col ${
                      viewMode === "list" ? "flex-1" : ""
                    }`}
                  >
                    <h3
                      className={`font-semibold text-gray-800 mb-1 ${
                        viewMode === "list" ? "text-xl" : "text-base"
                      }`}
                    >
                      {post.title}
                    </h3>
                    <p
                      className={`text-gray-500 mb-3 line-clamp-2 ${
                        viewMode === "list" ? "text-base" : "text-sm"
                      }`}
                    >
                      {post.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-pink-500">
                          <Heart
                            className={` ${
                              viewMode === "list" ? "w-6 h-6" : "w-4 h-4"
                            }`}
                          />
                          {likesData[post.id]?.count ?? post.total_likes}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MessageCircle
                            className={` ${
                              viewMode === "list" ? "w-6 h-6" : "w-4 h-4"
                            }`}
                          />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                      <span
                        className={` text-gray-400 ${
                          viewMode === "list" ? "text-lg" : ""
                        }`}
                      >
                        {new Date(post.date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-pink-500" />
            </div>
            <p className="text-gray-500 text-lg">
              No posts found matching your search.
            </p>
            <button className="mt-4 text-pink-500 hover:text-pink-600 font-medium">
              Clear filters
            </button>
          </div>
        )}
      </div>
      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreate={fetchPosts} // Fetch posts after creating a new one
      />
      <UpdatePost
        isOpen={isUpdatePostOpen}
        onClose={() => setIsUpdatePostOpen(false)}
        post={selectedPost}
        onUpdate={fetchPosts}
      />
      <DeletePostPopup
        isOpen={isDeletePostOpen}
        onClose={() => setIsDeletePostOpen(false)}
        onDelete={handleDeletePost}
        loading={loading}
      />
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

export default MyPost;
