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
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// Mock data user
const mockUsers = [
  {
    id: "1",
    username: "baker_jane",
    full_name: "Jane Baker",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    email: "jane.baker@example.com",
    phone_number: "0123456789",
    address: "123 Cake St, Sweet City",
    bio: "Passionate cake artist. Winner of 2023 Cake Awards.",
    join_date: "2021-05-10",
    stats: {
      posts: 42,
      followers: 1200,
      following: 180,
      likes: 3500,
    },
    achievements: [
      { name: "Master Baker", icon: Award, color: "text-pink-400" },
      { name: "Community Star", icon: Award, color: "text-pink-300" },
    ],
    albums: [
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
    ],
    recentPhotos: [
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
    ],
  },
  // Thêm user khác nếu muốn
];

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập fetch user theo id
    const user = mockUsers.find((u) => u.id === id);
    setProfile(user);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
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
                src={profile.avatar}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-pink-100"
              />
              <button className="absolute bottom-0 right-0 bg-pink-400 text-white p-3 rounded-full opacity-60 cursor-not-allowed">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {profile.full_name}
                  </h1>
                  <p className="text-gray-600 text-lg">@{profile.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5 text-pink-400" />
                  <span className="text-lg">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-5 h-5 text-pink-400" />
                  <span className="text-lg">{profile.phone_number}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Globe className="w-5 h-5 text-pink-400" />
                  <span className="text-lg">{profile.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  <span className="text-lg">Tham gia: {profile.join_date}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{profile.bio}</p>
              <div className="flex gap-6 mb-4">
                <div>
                  <span className="font-bold text-xl text-pink-500">
                    {profile.stats.posts}
                  </span>
                  <div className="text-gray-500">Posts</div>
                </div>
                <div>
                  <span className="font-bold text-xl text-pink-500">
                    {profile.stats.followers}
                  </span>
                  <div className="text-gray-500">Followers</div>
                </div>
                <div>
                  <span className="font-bold text-xl text-pink-500">
                    {profile.stats.following}
                  </span>
                  <div className="text-gray-500">Following</div>
                </div>
                <div>
                  <span className="font-bold text-xl text-pink-500">
                    {profile.stats.likes}
                  </span>
                  <div className="text-gray-500">Likes</div>
                </div>
              </div>
              {/* Achievements */}
              <div className="flex gap-3 flex-wrap">
                {profile.achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 ${ach.color}`}
                  >
                    <ach.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{ach.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Albums */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Albums</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.albums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-xl shadow-sm border border-pink-100 p-4"
              >
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <div className="font-semibold text-gray-800">{album.title}</div>
                <div className="text-gray-500 text-sm mb-1">
                  {album.count} photos
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {album.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-gray-600 text-sm">{album.description}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Photos */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {profile.recentPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.image}
                  alt="Recent"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 bg-white/80 text-pink-500 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {photo.likes}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {photo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs"
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
