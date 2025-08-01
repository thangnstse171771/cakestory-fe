import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Calendar,
  Eye,
  Grid,
  List,
  Search,
  Plus,
} from "lucide-react";
import { authAPI } from "../../api/auth";
import CreateAlbumPost from "./AlbumPost/CreateAlbumPost";
import UpdateAlbum from "./UpdateAlbum";
import UpdateAlbumPost from "./AlbumPost/UpdateAlbumPost";

const AlbumDetail = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isUpdatePostOpen, setIsUpdatePostOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchAlbum = async () => {
    try {
      const response = await authAPI.getAlbumById(id);
      const data = response.album;

      const formattedAlbum = {
        title: data.name,
        description: data.description,
        createdDate: data.created_at,
        coverImage:
          data.AlbumPosts?.[0]?.Post?.media?.[0]?.image_url ||
          "/placeholder.svg",
        totalPosts: data.AlbumPosts.length,
        totalLikes: 0,
        totalViews: 0,
        posts: data.AlbumPosts.map((post) => ({
          id: post.id,
          title: post.Post.title,
          description: post.Post.description,
          media: post.Post.media,
          likes: 0,
          comments: 0,
          views: 0,
          date: post.created_at,
        })),
      };

      setAlbum(formattedAlbum);
    } catch (error) {
      console.error("Failed to fetch album:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPosts =
    album?.posts.filter((post) => {
      const query = searchTerm.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query)
      );
    }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 h-screen">
        <div className="text-pink-500 text-lg font-medium animate-pulse">
          Loading album posts...
        </div>
      </div>
    );
  }

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
          <div className="absolute inset-0 bg-black bg-opacity-40 p-8 text-white flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
              <p className="text-lg opacity-90 mb-4">{album.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(album.createdDate)}</span>
                </span>
                <span>{album.totalPosts} posts</span>
              </div>
            </div>

            <div>
              <button
                className="flex items-center gap-2 bg-pink-500 px-4 py-2 rounded-xl hover:bg-pink-600 transition transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => setIsCreatePostOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Posts Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative group">
                {(() => {
                  const firstImage = post.media?.find((m) => m.image_url);
                  const firstVideo = post.media?.find((m) => m.video_url);

                  if (firstImage) {
                    return (
                      <img
                        src={firstImage.image_url}
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                    );
                  } else if (firstVideo) {
                    return (
                      <video
                        src={firstVideo.video_url}
                        className="w-full h-64 object-cover"
                        muted
                        autoPlay
                        loop
                      />
                    );
                  } else {
                    return (
                      <img
                        src="https://placehold.co/600x400?text=No+Media"
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                    );
                  }
                })()}

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
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {post.title}
                  </h3>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setOpenDropdown(openDropdown === post.id ? null : post.id)
                    }
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openDropdown === post.id && (
                    <div className="absolute bottom-1 right-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
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
                          // setIsDeleteAlbumOpen(true);
                          setSelectedPost(post);
                        }}
                        className="w-full px-4 py-2 text-left font-semibold text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {/* <div className="flex items-center space-x-4">
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
                  </div> */}
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
                  {(() => {
                    const firstImage = post.media?.find((m) => m.image_url);
                    const firstVideo = post.media?.find((m) => m.video_url);

                    if (firstImage) {
                      return (
                        <img
                          src={firstImage.image_url}
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      );
                    } else if (firstVideo) {
                      return (
                        <video
                          src={firstVideo.video_url}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                          muted
                          autoPlay
                          loop
                        />
                      );
                    } else {
                      return (
                        <img
                          src="https://placehold.co/600x400?text=No+Media"
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      );
                    }
                  })()}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {post.title}
                      </h3>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === post.id ? null : post.id
                          )
                        }
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openDropdown === post.id && (
                        <div className="absolute top-11 right-2 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-50">
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
                              setSelectedPost(album);
                            }}
                            className="w-full px-4 py-2 text-left font-semibold text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{post.description}</p>

                    <div className="flex items-center justify-between">
                      {/* <div className="flex items-center space-x-6">
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
                      </div> */}
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

      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No posts found.
          </h3>
        </div>
      )}
      <CreateAlbumPost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreate={fetchAlbum} // optional callback
        albumId={id} // ✅ Pass the album ID here
      />
      <UpdateAlbumPost
        isOpen={isUpdatePostOpen}
        onClose={() => setIsUpdatePostOpen(false)}
        onUpdate={fetchAlbum}
        post={selectedPost}
      />
    </div>
  );
};

export default AlbumDetail;
