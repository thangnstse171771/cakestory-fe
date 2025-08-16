import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Images,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getShopGalleryByShopId } from "../../api/shopGallery";
import {
  GalleryItemModal,
  GalleryViewModal,
  DeleteGalleryModal,
} from "../ShopGallery";
import { useAuth } from "../../contexts/AuthContext";

const ShopGallery = ({ shopId, isOwner = false, shopUserId = null }) => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Current item states
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchGalleryData();
  }, [shopId, shopUserId]);

  const fetchGalleryData = async () => {
    if (!shopId && !shopUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const id = shopId || shopUserId;
      const response = await getShopGalleryByShopId(id);
      setGallery(response.gallery || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setError("Không thể tải phòng trưng bày");
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

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
    fetchGalleryData();
  };

  const handleViewAll = () => {
    const id = shopId || shopUserId;
    navigate(`/shop-gallery/${id}`);
  };

  // Check if current user is the owner
  const isCurrentUserOwner =
    isOwner || (user && shopUserId && user.id === parseInt(shopUserId));

  // Show maximum 6 items in preview
  const previewGallery = gallery.slice(0, 6);
  const hasMore = gallery.length > 6;

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-pink-500 flex items-center gap-2">
            <Images className="w-6 h-6" />
            Phòng trưng bày
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl text-pink-500 flex items-center gap-2">
          <Images className="w-6 h-6" />
          Phòng trưng bày
          <span className="text-sm font-normal text-gray-500">
            ({gallery.length} ảnh)
          </span>
        </h3>

        <div className="flex items-center gap-3">
          {gallery.length > 0 && (
            <button
              onClick={handleViewAll}
              className="flex items-center gap-2 bg-white border-2 border-pink-200 hover:border-pink-300 text-pink-600 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:bg-pink-50"
            >
              <ExternalLink className="w-4 h-4" />
              Xem tất cả
            </button>
          )}

          {isCurrentUserOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Thêm ảnh
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchGalleryData}
            className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {previewGallery && previewGallery.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {previewGallery.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleViewImage(idx)}
              >
                {/* Image */}
                <img
                  src={item.image || item.images}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Title */}
                  <div className="text-white">
                    <h4 className="font-semibold text-lg leading-tight line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewImage(idx);
                      }}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>

                    {isCurrentUserOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditImage(item);
                          }}
                          className="p-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-600/80 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(item);
                          }}
                          className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600/80 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 ring-2 ring-pink-500/0 group-hover:ring-pink-500/50 transition-all duration-300 rounded-2xl" />
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleViewAll}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                Xem thêm {gallery.length - 6} ảnh
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-2xl py-16 text-center border-2 border-dashed border-gray-200">
          <div className="relative">
            <Images className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có ảnh nào trong phòng trưng bày
            </h4>
            <p className="text-gray-500 mb-6">
              {isCurrentUserOwner
                ? "Hãy thêm những hình ảnh đẹp để khách hàng có thể chiêm ngưỡng!"
                : "Hãy quay lại sau để xem những hình ảnh tuyệt vời!"}
            </p>
            {isCurrentUserOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Thêm ảnh đầu tiên
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <GalleryItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        shopId={shopId || shopUserId}
        isEdit={false}
      />

      <GalleryItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSuccess={handleModalSuccess}
        shopId={shopId || shopUserId}
        item={editingItem}
        isEdit={true}
      />

      <GalleryViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        images={previewGallery}
        currentIndex={currentViewIndex}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
        isOwner={isCurrentUserOwner}
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

export default ShopGallery;
