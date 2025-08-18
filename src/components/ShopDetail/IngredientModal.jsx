import React, { useState, useEffect } from "react";
import { createIngredient, updateIngredient } from "../../api/ingredients";

const IngredientModal = ({ open, onClose, onAdded, initialData, isEdit }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [image, setImage] = useState(null); // file or url
  const [imagePreview, setImagePreview] = useState(initialData?.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialData?.name || "");
    setPrice(initialData?.price || "");
    setDescription(initialData?.description || "");
    setImage(null);
    setImagePreview(initialData?.image || "");
  }, [initialData, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(initialData?.image || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name,
        price: parseFloat(price),
        description,
        image: image || initialData?.image || "",
      };
      if (isEdit && initialData?.id) {
        await updateIngredient(initialData.id, payload);
      } else {
        await createIngredient(payload);
      }
      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
      setImagePreview("");
      onAdded && onAdded();
      onClose();
    } catch (err) {
      setError(
        isEdit ? "Cập nhật topping thất bại!" : "Thêm topping thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden max-h-[90vh] min-h-[50vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 sm:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isEdit ? "Chỉnh sửa Topping" : "Thêm Topping Mới"}
              </h2>
              <p className="text-pink-100 text-xs sm:text-sm mt-1">
                {isEdit
                  ? "Cập nhật thông tin topping"
                  : "Thêm nguyên liệu cho cửa hàng"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              disabled={loading}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 sm:px-8 py-4 sm:py-8 overflow-y-auto flex-1 custom-scrollbar relative">
          {/* Scroll indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full opacity-50 z-10"></div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-4">
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Tên topping
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ví dụ: Kem phô mai, Trái cây..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Giá topping (VND)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="Nhập giá bằng số nguyên"
                className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                💡 Giá chỉ nhận số nguyên (không có số thập phân)
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Mô tả topping
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả chi tiết về topping này..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 resize-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Hình ảnh topping
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="topping-image"
                />
                <label
                  htmlFor="topping-image"
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 sm:py-6 hover:border-pink-400 transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center"
                >
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-gray-600 text-xs sm:text-sm font-medium">
                    Nhấn để chọn ảnh
                  </span>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4 relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl"></div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 flex-shrink-0 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm sm:text-base"
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEdit ? "Đang lưu..." : "Đang thêm..."}
                </div>
              ) : isEdit ? (
                "💾 Lưu thay đổi"
              ) : (
                "✨ Thêm topping"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientModal;
