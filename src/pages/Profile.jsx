import {
  Camera,
  Edit,
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
  Store,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePersonalFollowersFollowing from "../hooks/usePersonalFollowersFollowing";
import FollowersFollowingModal from "../components/FollowersFollowingModal";
import useAdminLoader from "../hooks/useAdminLoader";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";
import { fetchAllShopMembers, activateShopMember } from "../api/shopMembers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { addUserToGroupChatsByShopId } from "./Chat/libs/shopChatUtils";
import { db } from "../firebase";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import PostDetail from "./MyPost/PostDetail";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [shopInvitations, setShopInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeTab, setActiveTab] = useState("photos");
  const { followers, following, fetchFollowers, fetchFollowing } =
    usePersonalFollowersFollowing(user?.id);
  const adminLoader = useAdminLoader();
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const userStats = [
    { label: "Posts", value: "127" },
    { label: "Followers", value: "2.4K" },
    { label: "Following", value: "892" },
    { label: "Likes", value: "15.6K" },
  ];

  const achievements = [
    { name: "Master Baker", icon: Award, color: "text-pink-400" },
    { name: "Community Star", icon: Award, color: "text-pink-300" },
    { name: "Recipe Creator", icon: Award, color: "text-pink-500" },
  ];

  // const albums = [
  //   {
  //     id: 1,
  //     title: "Wedding Cakes",
  //     cover:
  //       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
  //     count: 24,
  //     tags: ["Wedding", "Elegant", "White"],
  //     description: "Collection of elegant wedding cakes",
  //   },
  //   {
  //     id: 2,
  //     title: "Birthday Specials",
  //     cover:
  //       "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
  //     count: 18,
  //     tags: ["Birthday", "Colorful", "Fun"],
  //     description: "Colorful and fun birthday cakes",
  //   },
  //   {
  //     id: 3,
  //     title: "Cupcakes",
  //     cover:
  //       "https://images.unsplash.com/photo-1488477181946-6428a848b8e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNha2V8ZW58MHx8MHx8fDA%3D",
  //     count: 32,
  //     tags: ["Cupcakes", "Mini", "Assorted"],
  //     description: "Assorted mini cupcakes collection",
  //   },
  // ];

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

  const fetchShopInvitations = async () => {
    if (!user) return;
    setLoadingInvitations(true);
    try {
      const data = await fetchAllShopMembers();
      // Filter to show only invitations for the current user where is_active is false
      const userInvitations = data.members.filter(
        (member) => member.user_id === user.id && !member.is_active
      );
      setShopInvitations(userInvitations);
    } catch (error) {
      console.error("Error fetching shop invitations:", error);
      setShopInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const getFirebaseUserIdFromPostgresId = async (postgresId) => {
    const q = query(
      collection(db, "users"),
      where("postgresId", "==", Number(postgresId)) // ensure type matches Firestore field
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Firestore doc ID
    }

    return null; // not found
  };

  const handleAcceptInvitation = async (shopId) => {
    try {
      const firebaseUid = await getFirebaseUserIdFromPostgresId(user.id);
      await activateShopMember();

      if (firebaseUid && shopId) {
        await addUserToGroupChatsByShopId({ firebaseUid, shopId });
      } else {
        console.warn(
          "Could not add to Firebase group chat: missing UID or shopId"
        );
      }
      // After accepting one invitation, clear all invitations since user can only be in one shop
      setShopInvitations([]);
      // Show success message or toast notification here if needed
    } catch (error) {
      console.error("Error accepting shop invitation:", error);
      // Show error message here if needed
    }
  };

  const recentPhotos = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
      likes: 234,
      tags: ["Wedding"],
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
      likes: 189,
      tags: ["Birthday"],
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a848b8e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNha2V8ZW58MHx8MHx8fDA%3D",
      likes: 156,
      tags: ["Cupcakes"],
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNha2V8ZW58MHx8MHx8fDA%3D",
      likes: 298,
      tags: ["Wedding"],
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNha2V8ZW58MHx8MHx8fDA%3D",
      likes: 167,
      tags: ["Birthday"],
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGNha2V8ZW58MHx8MHx8fDA%3D",
      likes: 203,
      tags: ["Cupcakes"],
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await authAPI.getUserById(user.id);
        setProfile(data.user);
        await fetchFollowers();
        await fetchFollowing();
        await fetchShopInvitations();
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, fetchFollowers, fetchFollowing]);

  const fetchPosts = async () => {
    try {
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
      const response = await authAPI.getAlbumsByUserId(user.id);
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

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative flex-shrink-0">
              <img
                src={
                  profile.avatar ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-pink-100"
              />
              <button className="absolute bottom-0 right-0 bg-pink-400 text-white p-3 rounded-full hover:bg-pink-500 transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-gray-600 text-lg">@{profile.username}</p>
                </div>
                <button
                  className="mt-4 md:mt-0 bg-pink-400 text-white px-6 py-3 rounded-xl hover:bg-pink-500 transition-colors flex items-center space-x-2 shadow-sm"
                  onClick={() => navigate("/edit-profile")}
                >
                  <Edit className="w-5 h-5" />
                  <span>Chỉnh Sửa Thông Tin</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  <MapPin className="w-5 h-5 text-pink-400" />
                  <span className="text-lg">
                    {profile.is_Baker ? "Baker" : "User"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div
                  className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer"
                  onClick={() => {
                    fetchFollowers();
                    setShowFollowers(true);
                  }}
                >
                  <div className="text-2xl font-bold text-pink-500">
                    {followers.length}
                  </div>
                  <div className="text-sm text-gray-600">Người theo dõi</div>
                </div>
                <div
                  className="text-center bg-pink-50 rounded-xl p-4 cursor-pointer"
                  onClick={() => {
                    fetchFollowing();
                    setShowFollowing(true);
                  }}
                >
                  <div className="text-2xl font-bold text-pink-500">
                    {following.length}
                  </div>
                  <div className="text-sm text-gray-600">Đang theo dõi</div>
                </div>
                <div className="text-center bg-pink-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-pink-500">
                    {postStat}
                  </div>
                  <div className="text-sm text-gray-600">Bài viết</div>
                </div>
                <div className="text-center bg-pink-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-pink-500">
                    {likeStat}
                  </div>
                  <div className="text-sm text-gray-600">Lượt thích</div>
                </div>
              </div>

              {/* Modals for followers/following */}
              <FollowersFollowingModal
                open={showFollowers}
                onClose={() => setShowFollowers(false)}
                users={followers}
                title="Danh sách người theo dõi"
                currentUserId={user?.id}
                onFollow={async (targetId) => {
                  await authAPI.followUserById(targetId);
                  await fetchFollowing();
                  await fetchFollowers();
                }}
                onUnfollow={async (targetId) => {
                  await authAPI.unfollowUserById(targetId);
                  await fetchFollowing();
                  await fetchFollowers();
                }}
                followingIds={following.map((u) => u.id)}
              />
              <FollowersFollowingModal
                open={showFollowing}
                onClose={() => setShowFollowing(false)}
                users={following}
                title="Đang theo dõi"
                currentUserId={user?.id}
                onFollow={async (targetId) => {
                  await authAPI.followUserById(targetId);
                  await fetchFollowing();
                  await fetchFollowers();
                }}
                onUnfollow={async (targetId) => {
                  await authAPI.unfollowUserById(targetId);
                  await fetchFollowing();
                  await fetchFollowers();
                }}
                followingIds={following.map((u) => u.id)}
              />
            </div>
          </div>
        </div>

        {/* Shop Invitations */}
        {shopInvitations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Store className="w-6 h-6 text-pink-400 mr-3" />
              Lời mời quản lý shop
              <span className="ml-2 bg-pink-100 text-pink-600 text-sm px-3 py-1 rounded-full">
                {shopInvitations.length}
              </span>
            </h2>
            <div className="space-y-4">
              {loadingInvitations ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Đang tải...</div>
                </div>
              ) : (
                shopInvitations.map((invitation) => (
                  <div
                    key={`${invitation.shop_id}-${invitation.user_id}`}
                    className="flex items-center justify-between p-6 bg-pink-50 rounded-xl border border-pink-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Shop #{invitation.shop_id}
                        </h3>
                        <p className="text-gray-600">
                          Bạn đã được mời tham gia shop này
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-orange-600 font-medium">
                            Lời mời chưa chấp nhận
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          handleAcceptInvitation(invitation.shop_id)
                        }
                        className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Chấp nhận</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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

export default Profile;
