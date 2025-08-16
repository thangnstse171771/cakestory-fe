import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Grid,
  List,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Images,
} from "lucide-react";
import { getShopGalleryByShopId } from "../api/shopGallery";
import { fetchShopByUserId } from "../api/axios";
import {
  GalleryItemModal,
  GalleryViewModal,
  DeleteGalleryModal,
} from "../components/ShopGallery";
import { useAuth } from "../contexts/AuthContext";

const ShopGalleryPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gallery, setGallery] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI States
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, title
  const [selectedItems, setSelectedItems] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Current item states
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [shopId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch gallery data
      const galleryResponse = await getShopGalleryByShopId(shopId);
      setGallery(galleryResponse.gallery || []);

      // Fetch shop info
      try {
        const shopResponse = await fetchShopByUserId(shopId);
        setShopInfo(shopResponse.shop);
      } catch (shopError) {
        console.warn("Could not fetch shop info:", shopError);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Không thể tải dữ liệu phòng trưng bày");
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort gallery items
  const filteredGallery = gallery
    .filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

  const isOwner = user && shopInfo && user.id === shopInfo.user_id;

  const handleViewImage = (index) => {
    setCurrentViewIndex(index);
    setShowViewModal(true);
  };

  const handleEditImage = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    setShowViewModal(false);
  };

  const handleDeleteImage = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
    setShowViewModal(false);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredGallery.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredGallery.map((item) => item.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải phòng trưng bày...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b-2 border-rose-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>

            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Thêm ảnh mới
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Images className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Phòng trưng bày
                {shopInfo && (
                  <span className="text-pink-600">
                    {" "}
                    - {shopInfo.business_name}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredGallery.length} ảnh
                {searchTerm && ` (đã lọc từ ${gallery.length} ảnh)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Theo tên</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-pink-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-pink-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {isOwner && selectedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Đã chọn {selectedItems.length} ảnh
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Bỏ chọn
                  </button>
                  <button
                    onClick={() => {
                      // Handle bulk delete
                      console.log("Bulk delete:", selectedItems);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Xóa đã chọn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Gallery Content */}
        {filteredGallery.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                : "space-y-4"
            }
          >
            {filteredGallery.map((item, idx) => (
              <div
                key={item.id || idx}
                className={
                  viewMode === "grid"
                    ? "group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    : "group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex items-center gap-4 cursor-pointer"
                }
                onClick={() => handleViewImage(idx)}
              >
                {isOwner && (
                  <div
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-5 h-5 text-pink-600 border-2 border-white rounded focus:ring-pink-500"
                    />
                  </div>
                )}

                {viewMode === "grid" ? (
                  <>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image || item.images}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {item.created_at && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}

                      {isOwner && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImage(item);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Edit className="w-3 h-3" />
                            Sửa
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(item);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || item.images}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {item.title}
                      </h3>
                      {item.created_at && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditImage(item);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(item);
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Images className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "Không tìm thấy ảnh nào" : "Chưa có ảnh nào"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc"
                : isOwner
                ? "Hãy thêm những hình ảnh đẹp để khách hàng có thể chiêm ngưỡng!"
                : "Hãy quay lại sau để xem những hình ảnh tuyệt vời!"}
            </p>
            {isOwner && !searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Thêm ảnh đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <GalleryItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        shopId={shopId}
        isEdit={false}
      />

      <GalleryItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSuccess={handleModalSuccess}
        shopId={shopId}
        item={editingItem}
        isEdit={true}
      />

      <GalleryViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        images={filteredGallery}
        currentIndex={currentViewIndex}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
        isOwner={isOwner}
      />

      <DeleteGalleryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingItem(null);
        }}
        onSuccess={handleModalSuccess}
        item={deletingItem}
      />
    </div>
  );
};

export default ShopGalleryPage;
