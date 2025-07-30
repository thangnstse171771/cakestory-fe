import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Calendar, Eye, Grid, List, Search } from "lucide-react"

  // Sample album data - in real app, this would come from API
  const albumData = {
    1: {
      title: "Chocolate Dreams",
      description: "A collection of my favorite chocolate cake creations",
      coverImage: "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      category: "chocolate",
      createdDate: "2024-01-15",
      totalPosts: 8,
      totalLikes: 1247,
      totalViews: 5632,
      posts: [
        {
          id: 1,
          title: "Triple Chocolate Delight",
          image: "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
          description: "Rich triple chocolate cake with dark chocolate ganache and chocolate meringue topping",
          likes: 234,
          comments: 12,
          views: 847,
          date: "2024-01-15",
          tags: ["chocolate", "ganache", "meringue"],
        },
        {
          id: 2,
          title: "Chocolate Heart Cake",
          image: "/placeholder.svg?height=400&width=400",
          description: "Heart-shaped chocolate cake perfect for Valentine's Day",
          likes: 189,
          comments: 8,
          views: 623,
          date: "2024-01-14",
          tags: ["chocolate", "heart", "valentine"],
        },
        {
          id: 3,
          title: "Chocolate Cupcake Tower",
          image: "/placeholder.svg?height=400&width=400",
          description: "Elegant tower of chocolate cupcakes with various toppings",
          likes: 156,
          comments: 15,
          views: 892,
          date: "2024-01-13",
          tags: ["chocolate", "cupcakes", "tower"],
        },
        {
          id: 4,
          title: "Dark Chocolate Mousse Cake",
          image: "/placeholder.svg?height=400&width=400",
          description: "Decadent dark chocolate mousse cake with berry garnish",
          likes: 298,
          comments: 22,
          views: 1156,
          date: "2024-01-12",
          tags: ["chocolate", "mousse", "berries"],
        },
        {
          id: 5,
          title: "Chocolate Drip Cake",
          image: "/placeholder.svg?height=400&width=400",
          description: "Stunning chocolate drip cake with gold accents",
          likes: 445,
          comments: 31,
          views: 1876,
          date: "2024-01-11",
          tags: ["chocolate", "drip", "gold"],
        },
        {
          id: 6,
          title: "Mini Chocolate Tarts",
          image: "/placeholder.svg?height=400&width=400",
          description: "Bite-sized chocolate tarts with various fillings",
          likes: 167,
          comments: 9,
          views: 534,
          date: "2024-01-10",
          tags: ["chocolate", "tarts", "mini"],
        },
      ],
    },
    2: {
      title: "Lemon Delight",
      description: "Fresh and zesty lemon cake creations",
      coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwZ-GpTn9xTtYg8AC20UZwI3Qkj8E3UCqvSQ&s",
      category: "lemon",
      createdDate: "2024-01-12",
      totalPosts: 5,
      totalLikes: 892,
      totalViews: 3421,
      posts: [
        {
          id: 7,
          title: "Classic Lemon Cake",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwZ-GpTn9xTtYg8AC20UZwI3Qkj8E3UCqvSQ&s",
          description: "Traditional lemon cake with cream cheese frosting",
          likes: 189,
          comments: 8,
          views: 692,
          date: "2024-01-12",
          tags: ["lemon", "classic", "cream cheese"],
        },
        {
          id: 8,
          title: "Lemon Meringue Tart",
          image: "/placeholder.svg?height=400&width=400",
          description: "Tangy lemon curd topped with fluffy meringue",
          likes: 234,
          comments: 15,
          views: 923,
          date: "2024-01-11",
          tags: ["lemon", "meringue", "tart"],
        },
      ],
    },
  }

  const AlbumDetail = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");

  // Instead of using albumId, just use the sample album
  const album = albumData[1]; // default preview album

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPosts = album.posts;

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/myalbum")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Albums</span>
        </button>
      </div>

      {/* Album Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          <img
            src={album.coverImage || "/placeholder.svg"}
            alt={album.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
              <p className="text-lg opacity-90 mb-4">{album.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(album.createdDate)}</span>
                </span>
                <span>{album.totalPosts} posts</span>
                <span>{album.totalLikes} total likes</span>
                <span>{album.totalViews} total views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Posts Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative group">
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{post.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                          <Share className="w-5 h-5" />
                        </button>
                        <span className="flex items-center space-x-1 text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </span>
                      </div>
                      <span className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.date)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
          <p className="text-gray-600">This album doesn't have any posts yet.</p>
        </div>
      )}
    </div>
  )
}

export default AlbumDetail
