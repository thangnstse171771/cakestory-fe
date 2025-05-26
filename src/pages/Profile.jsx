import { Camera, Edit, MapPin, Calendar, Award } from "lucide-react";

const Profile = () => {
  const userStats = [
    { label: "Posts", value: "127" },
    { label: "Followers", value: "2.4K" },
    { label: "Following", value: "892" },
    { label: "Likes", value: "15.6K" },
  ];

  const achievements = [
    { name: "Master Baker", icon: Award, color: "text-yellow-500" },
    { name: "Community Star", icon: Award, color: "text-blue-500" },
    { name: "Recipe Creator", icon: Award, color: "text-green-500" },
  ];

  const recentPosts = [
    { id: 1, image: "/placeholder.svg?height=150&width=150", likes: 234 },
    { id: 2, image: "/placeholder.svg?height=150&width=150", likes: 189 },
    { id: 3, image: "/placeholder.svg?height=150&width=150", likes: 156 },
    { id: 4, image: "/placeholder.svg?height=150&width=150", likes: 298 },
    { id: 5, image: "/placeholder.svg?height=150&width=150", likes: 167 },
    { id: 6, image: "/placeholder.svg?height=150&width=150", likes: 203 },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <img
                src="/placeholder.svg?height=120&width=120"
                alt="Profile"
                className="w-30 h-30 rounded-full"
              />
              <button className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Sarah Johnson
                  </h1>
                  <p className="text-gray-600">@sarahbakes</p>
                </div>
                <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <p className="text-gray-700 mb-4">
                Passionate baker sharing delicious recipes and cake decorating
                tips. Professional pastry chef with 10+ years of experience.
                🍰✨
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>New York, NY</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined March 2020</span>
                </div>
              </div>

              <div className="flex space-x-8">
                {userStats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-bold text-gray-800">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Achievements
          </h2>
          <div className="flex space-x-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg"
              >
                <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                <span className="text-sm font-medium text-gray-700">
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Posts
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="relative group cursor-pointer">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={`Post ${post.id}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.likes} likes
                  </span>
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
