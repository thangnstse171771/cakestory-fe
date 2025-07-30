import { useState } from "react";
import {
  Grid,
  List,
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Calendar,
  Eye,
} from "lucide-react";
import CreateAlbum from "./CreateAlbum";

const MyAlbum = () => {
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const albums = [
    {
      id: 1,
      title: "Chocolate Dreams",
      image:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      likes: 234,
      comments: 12,
      views: 1847,
      date: "2024-01-15",
      category: "chocolate",
      description: "Rich chocolate cake with meringue topping",
    },
    {
      id: 2,
      title: "Lemon Delight",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwZ-GpTn9xTtYg8AC20UZwI3Qkj8E3UCqvSQ&s",
      likes: 189,
      comments: 8,
      views: 892,
      date: "2024-01-12",
      category: "lemon",
      description: "Fresh lemon cake with sweet cream",
    },
    {
      id: 3,
      title: "Strawberry Paradise",
      image: "/placeholder.svg?height=300&width=300",
      likes: 456,
      comments: 23,
      views: 2103,
      date: "2024-01-10",
      category: "fruit",
      description: "Strawberry cake with fresh berries",
    },
    {
      id: 4,
      title: "Vanilla Classic",
      image: "/placeholder.svg?height=300&width=300",
      likes: 312,
      comments: 15,
      views: 1456,
      date: "2024-01-08",
      category: "vanilla",
      description: "Classic vanilla cake with buttercream",
    },
    {
      id: 5,
      title: "Red Velvet Romance",
      image: "/placeholder.svg?height=300&width=300",
      likes: 567,
      comments: 34,
      views: 2890,
      date: "2024-01-05",
      category: "red-velvet",
      description: "Heart-shaped red velvet cake",
    },
    {
      id: 6,
      title: "Birthday Special",
      image: "/placeholder.svg?height=300&width=300",
      likes: 423,
      comments: 28,
      views: 1923,
      date: "2024-01-03",
      category: "birthday",
      description: "Colorful birthday cake with decorations",
    },
  ];

  const categories = [
    { value: "all", label: "All Cakes", count: albums.length },
    {
      value: "chocolate",
      label: "Chocolate",
      count: albums.filter((a) => a.category === "chocolate").length,
    },
    {
      value: "fruit",
      label: "Fruit",
      count: albums.filter((a) => a.category === "fruit").length,
    },
    {
      value: "vanilla",
      label: "Vanilla",
      count: albums.filter((a) => a.category === "vanilla").length,
    },
    {
      value: "red-velvet",
      label: "Red Velvet",
      count: albums.filter((a) => a.category === "red-velvet").length,
    },
    {
      value: "birthday",
      label: "Birthday",
      count: albums.filter((a) => a.category === "birthday").length,
    },
  ];

  const filteredAlbums =
    selectedFilter === "all"
      ? albums
      : albums.filter((album) => album.category === selectedFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Album</h1>
          <p className="text-gray-600">
            Showcase your delicious cake creations
          </p>
        </div>
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => setIsCreateAlbumOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Create Album</span>
        </button>
      </div>

      {/* Stats Cards */}

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label} ({category.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cakes..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Album Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative group">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg transition-opacity">
                    View Details
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{album.title}</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  {album.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {/* <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{album.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{album.comments}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{album.views}</span>
                    </span>
                  </div> */}
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(album.date)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-6">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {album.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-3">{album.description}</p>

                  <div className="flex items-center justify-between">
                    {/* <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{album.likes} likes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{album.comments} comments</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{album.views} views</span>
                      </span>
                    </div> */}
                    <span className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(album.date)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No cakes found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or add your first cake!
          </p>
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Your First Cake</span>
          </button>
        </div>
      )}
      <CreateAlbum
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
      />
    </div>
  );
};

export default MyAlbum;
