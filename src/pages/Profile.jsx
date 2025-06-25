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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const albums = [
    {
      id: 1,
      title: "Wedding Cakes",
      cover:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
      count: 24,
      tags: ["Wedding", "Elegant", "White"],
      description: "Collection of elegant wedding cakes",
    },
    {
      id: 2,
      title: "Birthday Specials",
      cover:
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
      count: 18,
      tags: ["Birthday", "Colorful", "Fun"],
      description: "Colorful and fun birthday cakes",
    },
    {
      id: 3,
      title: "Cupcakes",
      cover:
        "https://images.unsplash.com/photo-1488477181946-6428a848b8e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNha2V8ZW58MHx8MHx8fDA%3D",
      count: 32,
      tags: ["Cupcakes", "Mini", "Assorted"],
      description: "Assorted mini cupcakes collection",
    },
  ];

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
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
                  <span>Edit Profile</span>
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
                {userStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center bg-pink-50 rounded-xl p-4"
                  >
                    <div className="text-2xl font-bold text-pink-500">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Award className="w-6 h-6 text-pink-400 mr-3" />
            Achievements
          </h2>
          <div className="flex flex-wrap gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className="flex items-center space-x-3 bg-pink-50 px-6 py-4 rounded-xl"
              >
                <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                <span className="text-lg font-medium text-gray-700">
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Albums */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 text-pink-400 mr-3" />
            Albums
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-pink-50 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-4">
                      <div className="text-xl font-semibold mb-2">
                        {album.title}
                      </div>
                      <div className="text-sm mb-3">{album.description}</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {album.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-pink-400 text-white px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {album.title}
                    </h3>
                    <span className="text-pink-500">{album.count} photos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {album.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Photos */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Image className="w-6 h-6 text-pink-400 mr-3" />
            Recent Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentPhotos.map((photo) => (
              <div key={photo.id} className="relative group cursor-pointer">
                <img
                  src={photo.image}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-xl flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span className="text-lg">{photo.likes}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {photo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-pink-400 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
