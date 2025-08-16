import React, { useState, useEffect } from "react";
import { X, Upload, Camera, Image, Loader2 } from "lucide-react";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  createShopGalleryItem,
  updateShopGalleryItem,
} from "../../api/shopGallery";

const GalleryItemModal = ({
  isOpen,
  onClose,
  onSuccess,
  shopId,
  item = null,
  isEdit = false,
}) => {
  const MAX_IMAGES = 5; // Maximum 5 images per gallery item

  const [formData, setFormData] = useState({
    title: "",
    images: [], // Changed to array for multiple images
  });
  const [imageFiles, setImageFiles] = useState([]); // Array of files
  const [imagePreviews, setImagePreviews] = useState([]); // Array of previews
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && item) {
      setFormData({
        title: item.title || "",
        images: item.images || [], // Support existing images
      });
      setImagePreviews(item.images || []);
    } else {
      setFormData({ title: "", images: [] });
      setImagePreviews([]);
      setImageFiles([]);
    }
    setErrors({});
  }, [isEdit, item, isOpen]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (newFiles) => {
    // Check total count limit
    const currentCount = imageFiles.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (newFiles.length > remainingSlots) {
      setErrors({
        ...errors,
        images: `Chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa (tối đa ${MAX_IMAGES} ảnh)`,
      });
      return;
    }

    // Validate file types
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          images: "Chỉ chấp nhận file ảnh",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          images: "Kích thước file không được vượt quá 5MB",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files
    const updatedFiles = [...imageFiles, ...validFiles];
    setImageFiles(updatedFiles);

    // Create previews for new files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // Clear errors
    setErrors({ ...errors, images: "" });
  };

  const removeImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);

    // Clear errors if we're under limit now
    if (errors.images && updatedFiles.length < MAX_IMAGES) {
      setErrors({ ...errors, images: "" });
    }
  };

  const uploadImageToFirebase = async (file) => {
    const mediaRef = ref(
      storage,
      `shop-gallery/${shopId}/${Date.now()}-${file.name}`
    );
    await uploadBytes(mediaRef, file);
    return await getDownloadURL(mediaRef);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  // Old single file handler removed - now using handleImageFiles for multiple files

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    // Check if we have images (either new files or existing ones)
    const hasNewImages = imageFiles.length > 0;
    const hasExistingImages =
      isEdit && formData.images && formData.images.length > 0;

    if (!hasNewImages && !hasExistingImages) {
      newErrors.images = "Vui lòng chọn ít nhất 1 hình ảnh";
    }

    if (imageFiles.length > MAX_IMAGES) {
      newErrors.images = `Chỉ được chọn tối đa ${MAX_IMAGES} hình ảnh`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setUploadProgress(0);
    try {
      let imageUrls = [...(formData.images || [])]; // Start with existing images

      // Upload new images if any
      if (imageFiles.length > 0) {
        console.log(`🔥 Uploading ${imageFiles.length} image files...`);

        const uploadPromises = imageFiles.map(async (file, index) => {
          setUploadProgress(25 + (index * 50) / imageFiles.length);
          console.log(`📤 Uploading image ${index + 1}:`, file.name);

          const url = await uploadImageToFirebase(file);
          console.log(`✅ Upload ${index + 1} complete:`, url);

          if (!url || typeof url !== "string") {
            throw new Error(`Firebase upload failed for image ${index + 1}`);
          }

          return url;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
        setUploadProgress(75);
      }

      console.log("🔍 Final image URLs:", imageUrls);
      console.log("🔍 Total images:", imageUrls.length);

      // Validate we have images
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("No images to save");
      }

      // Check URL lengths (assuming backend fixed the 255 char limit)
      const tooLongUrls = imageUrls.filter((url) => url.length > 255);
      if (tooLongUrls.length > 0) {
        console.warn(
          "⚠️ Some URLs might be too long:",
          tooLongUrls.map((url) => url.length)
        );
      }

      // Backend wants "images" as non-empty array
      const galleryData = {
        shop_id: shopId,
        title: formData.title.trim(),
        images: imageUrls, // Array of image URLs
      };

      console.log("📤 Sending gallery data (images array):", galleryData);

      if (isEdit) {
        // For edit, send all images (might need to update API to accept multiple images)
        const updateData = {
          title: formData.title.trim(),
          images: imageUrls, // Send all images for update too
        };
        console.log("📝 Updating with data:", updateData);
        await updateShopGalleryItem(item.id, updateData);
      } else {
        await createShopGalleryItem(galleryData);
      }

      setUploadProgress(100);
      onSuccess?.();
      onClose();

      // Reset form
      setFormData({ title: "", images: [] });
      setImageFiles([]);
      setImagePreviews([]);
      setDragActive(false);
      setUploadProgress(0);
      setErrors({});
    } catch (error) {
      console.error("Error saving gallery item:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = isEdit
        ? "Không thể cập nhật ảnh. Vui lòng thử lại!"
        : "Không thể thêm ảnh. Vui lòng thử lại!";

      // Check for specific error messages
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ title: "", images: [] });
      setImageFiles([]);
      setImagePreviews([]);
      setDragActive(false);
      setUploadProgress(0);
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? "Chỉnh sửa ảnh" : "Thêm ảnh mới"}
            </h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề cho ảnh..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  errors.title ? "border-red-500" : "border-gray-200"
                }`}
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh * (Tối đa {MAX_IMAGES} ảnh)
              </label>

              {/* Multiple Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}/{MAX_IMAGES}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              {imagePreviews.length < MAX_IMAGES && (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 scale-105"
                      : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                  } ${loading ? "pointer-events-none opacity-50" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-pink-500" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">
                      Kéo và thả ảnh của bạn vào đây
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      hoặc nhấp để duyệt tệp (có thể chọn nhiều ảnh)
                    </p>
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Chọn Ảnh ({imagePreviews.length}/{MAX_IMAGES})
                    </label>
                    <p className="text-sm text-gray-400 mt-3">
                      PNG, JPG, JPEG (tối đa 5MB mỗi ảnh)
                    </p>
                  </div>
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    {uploadProgress < 75
                      ? "Đang tải ảnh lên..."
                      : "Đang lưu..."}
                  </span>
                  <span className="text-sm text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? "Đang cập nhật..." : "Đang thêm..."}
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4" />
                    {isEdit ? "Cập nhật" : "Thêm ảnh"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GalleryItemModal;
