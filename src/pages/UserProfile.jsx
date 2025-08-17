import {
  Camera,
  MapPin,
  Calendar,
  Award,
  Heart,
  Image,
  BookOpen,
  Mail,
  Phone,
  Globe,
  Tag,
  UserPlus,
  UserCheck,
  Search,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FollowersFollowingModal from "../components/FollowersFollowingModal";
import useFollowersFollowing from "../hooks/useFollowersFollowing";
import usePersonalFollowersFollowing from "../hooks/usePersonalFollowersFollowing";
import { authAPI } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PostDetail from "./MyPost/PostDetail";

const FAKE_ACHIEVEMENTS = [
  { name: "Master Baker", icon: Award, color: "text-pink-400" },
  { name: "Community Star", icon: Award, color: "text-pink-300" },
];
const FAKE_ALBUMS = [
  {
    id: 1,
    title: "Wedding Cakes",
    cover:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
    count: 12,
    tags: ["Wedding", "Elegant"],
    description: "Elegant wedding cakes collection",
  },
  {
    id: 2,
    title: "Birthday Specials",
    cover:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=60",
    count: 8,
    tags: ["Birthday", "Fun"],
    description: "Fun birthday cakes",
  },
];
const FAKE_STATS = { posts: 42, followers: 1200, following: 180, likes: 3500 };
const FAKE_RECENT_PHOTOS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
    likes: 234,
    tags: ["Wedding"],
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=60",
    likes: 189,
    tags: ["Birthday"],
  },
];

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState("photos");
  // Danh sách followers/following của user đang xem
  const {
    followers,
    following,
    fetchFollowers,
    fetchFollowing,
    setFollowers,
    setFollowing,
  } = useFollowersFollowing(id);
  // Danh sách following của bản thân
  const { following: myFollowing, fetchFollowing: fetchMyFollowing } =
    usePersonalFollowersFollowing(user?.id);

  const [likesData, setLikesData] = useState({});

  useEffect(() => {
    const fetchLikesForPosts = async () => {
      const initialLikes = {};
      for (const post of posts) {
        try {
          const res = await authAPI.getLikesByPostId(post.id);
          const data = res.likes;
          const totalLikes = res.total_likes || data.length;
          const liked = data.some((like) => like.user_id === user?.id);

          initialLikes[post.id] = { liked, count: totalLikes, liking: false };
        } catch (error) {
          console.error("Failed to fetch likes for post", post.id, error);
          initialLikes[post.id] = {
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

  useEffect(() => {
    if (user && String(user.id) === String(id)) {
      navigate("/profile", { replace: true });
      return;
    }
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await authAPI.getUserById(id);
        setProfile(data.user);
        await fetchFollowers();
        await fetchFollowing();
        await fetchMyFollowing();
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, user, navigate, fetchFollowers, fetchFollowing, fetchMyFollowing]);

  // Xác định trạng thái follow dựa vào danh sách following của bản thân
  const isFollowingProfile = myFollowing.some(
    (u) => String(u.id) === String(id)
  );

  const handleFollow = async () => {
    try {
      if (isFollowingProfile) {
        await authAPI.unfollowUserById(id);
      } else {
        await authAPI.followUserById(id);
      }
      await fetchFollowers();
      await fetchFollowing();
      await fetchMyFollowing();
    } catch (err) {
      alert("Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  const handleFollowUser = async (targetId) => {
    try {
      await authAPI.followUserById(targetId);
      await fetchFollowing();
      await fetchFollowers();
      await fetchMyFollowing();
    } catch (err) {
      alert("Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  const handleUnfollowUser = async (targetId) => {
    try {
      await authAPI.unfollowUserById(targetId);
      await fetchFollowing();
      await fetchFollowers();
      await fetchMyFollowing();
    } catch (err) {
      alert("Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await authAPI.getMemoryPostByUserId(id);
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
        total_likes: item.Post.total_likes,
        total_comments: item.Post.total_comments,
      }));
      setPosts(mappedPosts);
    } catch (err) {
      toast.error("Không thể tải bài viết. Vui lòng thử lại!");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await authAPI.getAlbumsByUserId(id);
      const rawAlbums = response.data.albums;

      const formatted = rawAlbums.map((album) => ({
        id: album.id,
        title: album.name,
        description: album.description,
        image:
          album.AlbumPosts?.[0]?.Post?.media?.[0]?.image_url ||
          "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg",
        date: album.created_at,
        category: "default",
        postCount: album.AlbumPosts.length,
      }));

      setAlbums(formatted);
      console.log("Fetched albums ", albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const postStat =
    posts.length + albums.reduce((total, album) => total + album.postCount, 0);

  const likeStat = posts.reduce((total, post) => {
    const likeCount =
      likesData[post.id]?.count !== undefined
        ? likesData[post.id].count
        : post.total_likes || 0;
    return total + likeCount;
  }, 0);

  if (loading || loadingPosts || loadingAlbums) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gradient-to-br from-pink-100 to-pink-300">
        Không tìm thấy thông tin người dùng.
      </div>
    );
  }

  // Dữ liệu mặc định cho các trường không có từ API
  const stats = profile.stats || FAKE_STATS;
  const achievements = profile.achievements || FAKE_ACHIEVEMENTS;
  // const albums = profile.albums || FAKE_ALBUMS;
  const recentPhotos = profile.recentPhotos || FAKE_RECENT_PHOTOS;

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative">
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-44 h-44 rounded-full object-cover border-4 border-pink-200 shadow-lg"
            />
            <button className="absolute bottom-2 right-2 bg-pink-400 text-white p-3 rounded-full opacity-70 cursor-not-allowed shadow-md">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-1">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-gray-500 text-lg font-medium">
                  @{profile.username}
                </p>
              </div>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-colors text-lg
                  ${
                    isFollowing
                      ? "bg-pink-100 text-pink-500 border border-pink-400"
                      : "bg-pink-500 text-white hover:bg-pink-600"
                  }`}
                onClick={handleFollow}
              >
                {isFollowingProfile ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {isFollowingProfile ? "Đang theo dõi" : "Theo dõi"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5 text-pink-400" />
                <span className="text-lg">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-pink-400" />
                <span className="text-lg">
                  {profile.phone_number || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Globe className="w-5 h-5 text-pink-400" />
                <span className="text-lg">
                  {profile.address || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="w-5 h-5 text-pink-400" />
                <span className="text-lg">
                  Tham gia: {profile.join_date || "Chưa cập nhật"}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-base italic mb-2">
              {profile.bio || "Chưa có mô tả cá nhân."}
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div
                className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer"
                onClick={() => {
                  fetchFollowers();
                  setShowFollowers(true);
                }}
              >
                <div className="font-bold text-2xl text-pink-500">
                  {followers.length}
                </div>
                <div className="text-gray-500 text-sm">Người theo dõi</div>
              </div>
              <div
                className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer"
                onClick={() => {
                  fetchFollowing();
                  setShowFollowing(true);
                }}
              >
                <div className="font-bold text-2xl text-pink-500">
                  {following.length}
                </div>
                <div className="text-gray-500 text-sm">Đang theo dõi</div>
              </div>
              <div className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer">
                <div className="font-bold text-2xl text-pink-500">
                  {postStat}
                </div>
                <div className="text-gray-500 text-sm">Bài viết</div>
              </div>
              <div className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer">
                <div className="font-bold text-2xl text-pink-500">
                  {likeStat}
                </div>
                <div className="text-gray-500 text-sm">Lượt thích</div>
              </div>
            </div>

            {/* Modals for followers/following */}
            <FollowersFollowingModal
              open={showFollowers}
              onClose={() => setShowFollowers(false)}
              users={followers}
              title="Danh sách người theo dõi"
              currentUserId={user?.id}
              onFollow={handleFollowUser}
              onUnfollow={handleUnfollowUser}
              followingIds={myFollowing.map((u) => u.id)}
            />
            <FollowersFollowingModal
              open={showFollowing}
              onClose={() => setShowFollowing(false)}
              users={following}
              title="Đang theo dõi"
              currentUserId={user?.id}
              onFollow={handleFollowUser}
              onUnfollow={handleUnfollowUser}
              followingIds={myFollowing.map((u) => u.id)}
            />
            {/* Achievements */}
            <div className="flex gap-3 flex-wrap mt-2">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 ${ach.color}`}
                >
                  {ach.icon ? (
                    <ach.icon className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
          {/* Tabs Header */}
          <div className="flex border-b border-pink-100 mb-6">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-lg font-semibold transition ${
                activeTab === "photos"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500 hover:text-pink-400"
              }`}
            >
              <Image className="w-5 h-5 mr-2" />
              Ảnh gần đây
            </button>

            <button
              onClick={() => setActiveTab("albums")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-lg font-semibold transition ${
                activeTab === "albums"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500 hover:text-pink-400"
              }`}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Albums nổi bật
            </button>
          </div>

          {/* Tab Content */}

          {activeTab === "photos" &&
            (posts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((post) => {
                  const firstImage = post.media?.find((m) => m.image_url);
                  const firstVideo = post.media?.find((m) => m.video_url);
                  return (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsPostDetailOpen(true);
                      }}
                    >
                      {firstImage ? (
                        <img
                          src={firstImage.image_url}
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      ) : firstVideo ? (
                        <video
                          src={firstVideo.video_url}
                          className="w-full h-64 object-cover rounded-xl"
                          muted
                        />
                      ) : (
                        <img
                          src="https://placehold.co/600x400?text=No+Image"
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      )}

                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-xl flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5" />
                            <span className="text-lg">
                              {likesData[post.id]?.count ?? post.total_likes}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <span className="bg-pink-400 text-white px-3 py-1 rounded-full text-sm">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !loadingPosts && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="text-gray-500 text-lg">No posts found.</p>
                </div>
              )
            ))}

          {activeTab === "albums" &&
            (albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {albums.map((album) => (
                  <div key={album.id} className="bg-pink-50 rounded-xl">
                    <div
                      className="relative overflow-hidden group cursor-pointer rounded-t-xl"
                      onClick={() => navigate(`/album/${album.id}`)}
                    >
                      <img
                        src={album.image}
                        alt={album.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-4">
                          <div className="text-xl font-semibold mb-2 bg-red-400 text-white px-3 py-1 rounded-xl">
                            {album.title}
                          </div>
                          <div className="text-sm mb-3">
                            {album.description}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {album.title}
                        </h3>
                        <span className="text-pink-500">
                          {album.postCount} posts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center space-x-1 text-sm bg-pink-200 text-pink-600 px-2 py-1 rounded-full">
                          <Calendar className="w-4 h-4" />
                          <span>{dayjs(album.date).format("D MMM, YYYY")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loadingAlbums && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="text-gray-500 text-lg">No albums found.</p>
                </div>
              )
            ))}
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

export default UserProfile;
