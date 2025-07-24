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
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FollowersFollowingModal from "../components/FollowersFollowingModal";
import useFollowersFollowing from "../hooks/useFollowersFollowing";
import usePersonalFollowersFollowing from "../hooks/usePersonalFollowersFollowing";
import { authAPI } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
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
  const {
    following: myFollowing,
    fetchFollowing: fetchMyFollowing,
  } = usePersonalFollowersFollowing(user?.id);

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
  const isFollowingProfile = myFollowing.some((u) => String(u.id) === String(id));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-300">
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
  const albums = profile.albums || FAKE_ALBUMS;
  const recentPhotos = profile.recentPhotos || FAKE_RECENT_PHOTOS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
            <div className="flex gap-8 mb-2">
              <div className="text-center">
                <div className="font-bold text-2xl text-pink-500">{stats.posts}</div>
                <div className="text-gray-500 text-sm">Bài viết</div>
              </div>
              <div className="text-center cursor-pointer" onClick={() => { fetchFollowers(); setShowFollowers(true); }}>
                <div className="font-bold text-2xl text-pink-500">{followers.length}</div>
                <div className="text-gray-500 text-sm">Người theo dõi</div>
              </div>
              <div className="text-center cursor-pointer" onClick={() => { fetchFollowing(); setShowFollowing(true); }}>
                <div className="font-bold text-2xl text-pink-500">{following.length}</div>
                <div className="text-gray-500 text-sm">Đang theo dõi</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-pink-500">{stats.likes}</div>
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
        {/* Albums */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Albums nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-2xl shadow-md border border-pink-100 p-4 hover:shadow-lg transition-shadow flex flex-col"
              >
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-40 object-cover rounded-lg mb-3 shadow-sm"
                />
                <div className="font-semibold text-gray-800 text-lg mb-1">
                  {album.title}
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  {album.count} ảnh
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {album.tags &&
                    album.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="text-gray-600 text-sm flex-1">
                  {album.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Photos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ảnh gần đây</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <img
                  src={photo.image}
                  alt="Recent"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 bg-white/80 text-pink-500 px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow">
                  <Heart className="w-3 h-3" />
                  {photo.likes}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {photo.tags &&
                    photo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs shadow"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
