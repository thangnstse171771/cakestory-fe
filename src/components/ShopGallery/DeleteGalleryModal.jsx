import React, { useState } from "react";
import { X, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deleteShopGalleryItem } from "../../api/shopGallery";

const DeleteGalleryModal = ({ isOpen, onClose, onSuccess, item = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!item) return;

    setLoading(true);
    setError("");

    try {
      await deleteShopGalleryItem(item.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      setError("Không thể xóa ảnh. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError("");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Xác nhận xóa</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Preview */}
          <div className="mb-6 text-center">
            <img
              src={item.image || item.images}
              alt={item.title}
              className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-gray-200"
            />
            <h3 className="text-lg font-semibold text-gray-800 mt-3">
              {item.title}
            </h3>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Cảnh báo!</p>
                <p className="text-red-700 text-sm mt-1">
                  Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể
                  hoàn tác.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Xóa ảnh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteGalleryModal;
