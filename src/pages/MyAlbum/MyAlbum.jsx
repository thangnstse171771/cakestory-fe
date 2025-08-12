import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../api/auth";
import UpdateAlbum from "./UpdateAlbum";
import DeleteAlbum from "./DeleteAlbum";
import dayjs from "dayjs";

const MyAlbum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isUpdateAlbumOpen, setIsUpdateAlbumOpen] = useState(false);
  const [isDeleteAlbumOpen, setIsDeleteAlbumOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAlbums = async () => {
    try {
      const userId = user.id;
      const response = await authAPI.getAlbumsByUserId(userId);
      const rawAlbums = response.data.albums;

      const formatted = rawAlbums.map((album) => ({
        id: album.id,
        title: album.name,
        description: album.description,
        image:
          album.AlbumPosts?.[0]?.Post?.media?.[0]?.image_url ||
          "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg",
        date: new Date(album.created_at).toISOString().split("T")[0],
        category: "default",
      }));

      setAlbums(formatted);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;
    setLoading(true);
    try {
      await authAPI.deleteAlbum(selectedAlbum.id);
      setIsDeleteAlbumOpen(false); // close popup
      setAlbums((prevAlbums) =>
        prevAlbums.filter((p) => p.id !== selectedAlbum.id)
      );
      setSelectedAlbum(null);
    } catch (error) {
      console.error("Delete album failed:", error);
      setError("Failed to album post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-pink-600 mb-2">My Album</h1>
          <p className="text-gray-600">
            Showcase your delicious cake creations
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl"
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
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search albums..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-pink-500 text-lg font-medium animate-pulse">
            Loading albums...
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative group">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Link
                    to={`/album/${album.id}`}
                    className="opacity-0 group-hover:opacity-100 bg-pink-500 text-white px-4 py-2 rounded-lg transition-opacity"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{album.title}</h3>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === album.id ? null : album.id
                      )
                    }
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openDropdown === album.id && (
                    <div className="absolute bottom-1 right-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          setIsUpdateAlbumOpen(true);
                          setSelectedAlbum(album);
                        }}
                        className="w-full px-4 py-2 text-left font-semibold text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          setIsDeleteAlbumOpen(true);
                          setSelectedAlbum(album);
                        }}
                        className="w-full px-4 py-2 text-left font-semibold text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
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
                    <span>{dayjs(album.date).format("D MMM, YYYY")}</span>
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
              className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-6">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.title}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => navigate(`/album/${album.id}`)}
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {album.title}
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === album.id ? null : album.id
                        )
                      }
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {openDropdown === album.id && (
                      <div className="absolute top-11 right-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsUpdateAlbumOpen(true);
                            setSelectedAlbum(album);
                          }}
                          className="w-full px-4 py-2 text-left font-semibold text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsDeleteAlbumOpen(true);
                            setSelectedAlbum(album);
                          }}
                          className="w-full px-4 py-2 text-left font-semibold text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
                      <span>{dayjs(album.date).format("D MMM, YYYY")}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No albums found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or add your first album!
          </p>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            onClick={() => setIsCreateAlbumOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Album</span>
          </button>
        </div>
      )}
      <CreateAlbum
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        onCreate={fetchAlbums}
      />
      <UpdateAlbum
        isOpen={isUpdateAlbumOpen}
        onClose={() => setIsUpdateAlbumOpen(false)}
        album={selectedAlbum}
        onUpdate={fetchAlbums}
      />
      <DeleteAlbum
        isOpen={isDeleteAlbumOpen}
        onClose={() => setIsDeleteAlbumOpen(false)}
        onDelete={handleDeleteAlbum}
        loading={loading}
      />
    </div>
  );
};

export default MyAlbum;
