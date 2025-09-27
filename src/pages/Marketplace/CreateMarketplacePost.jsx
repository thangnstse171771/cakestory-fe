"use client";

import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createMarketplacePost, updateMarketplacePost } from "../../api/axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const CreateMarketplacePostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(100, "Tiêu đề không được vượt quá 100 ký tự")
    .required("Tiêu đề là bắt buộc"),
  description: Yup.string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .required("Mô tả là bắt buộc"),
  tier: Yup.number()
    .min(1, "Bánh phải có ít nhất 1 tầng")
    .max(8, "Bánh không được vượt quá 8 tầng")
    .required("Số tầng là bắt buộc"),
  required_time: Yup.number()
    .min(0, "Số giờ đặt trước không dưới 0")
    .max(750, "Số ngày đặt trước không vượt quá 750 giờ (30 ngày)")
    .required("Hãy nhập số giờ cần đặt trước"),
  available: Yup.boolean().required(),
  expiry_date: Yup.string()
    .required("Ngày Hết hạn là bắt buộc")
    .test("future-date", "Ngày Hết hạn phải trong tương lai", function (value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  is_public: Yup.boolean().required(),
  media: Yup.array()
    .min(1, "Vui lòng thêm ít nhất một tệp media")
    .max(5, "Tối đa 5 ảnh"),
});

const CreateMarketplacePost = ({
  isOpen,
  onClose,
  onCreate,
  initialData,
  isEdit,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // State cho cakeSizes
  const [cakeSizes, setCakeSizes] = useState([{ size: "", price: "" }]);
  const [cakeSizeErrors, setCakeSizeErrors] = useState([]);

  // Initialize cake sizes when editing
  useEffect(() => {
    if (isEdit && initialData?.cakeSizes) {
      setCakeSizes(
        initialData.cakeSizes.length > 0
          ? initialData.cakeSizes
          : [{ size: "", price: "" }]
      );
    }
  }, [isEdit, initialData]);

  // Validate cake sizes
  const validateCakeSizes = () => {
    const errors = [];
    let hasValidSize = false;

    cakeSizes.forEach((size, idx) => {
      const error = {};
      if (size.size.trim() && size.price) {
        hasValidSize = true;
        if (parseFloat(size.price) <= 0) {
          error.price = "Giá phải lớn hơn 0";
        }
      } else if (size.size.trim() || size.price) {
        if (!size.size.trim()) error.size = "Tên kích cỡ là bắt buộc";
        if (!size.price) error.price = "Giá là bắt buộc";
      }
      errors[idx] = error;
    });

    setCakeSizeErrors(errors);

    if (!hasValidSize) {
      return "Ít nhất một kích cỡ hoàn chỉnh với giá là bắt buộc";
    }

    // Check for duplicate sizes
    const sizes = cakeSizes
      .filter((s) => s.size.trim())
      .map((s) => s.size.trim().toLowerCase());
    const duplicates = sizes.filter(
      (size, index) => sizes.indexOf(size) !== index
    );
    if (duplicates.length > 0) {
      return "Không được phép có tên kích cỡ trùng lặp";
    }

    return null;
  };

  // Hàm thêm/xóa size
  const handleAddSize = () => {
    setCakeSizes([...cakeSizes, { size: "", price: "" }]);
    setCakeSizeErrors([...cakeSizeErrors, {}]);
  };

  const handleRemoveSize = (idx) => {
    if (cakeSizes.length > 1) {
      setCakeSizes(cakeSizes.filter((_, i) => i !== idx));
      setCakeSizeErrors(cakeSizeErrors.filter((_, i) => i !== idx));
    }
  };

  const handleChangeSize = (idx, field, value) => {
    const newSizes = [...cakeSizes];
    newSizes[idx][field] = value;
    setCakeSizes(newSizes);

    // Clear error for this field
    const newErrors = [...cakeSizeErrors];
    if (newErrors[idx]) {
      delete newErrors[idx][field];
    }
    setCakeSizeErrors(newErrors);
  };

  const uploadMediaToFirebase = async (file) => {
    const mediaRef = ref(
      storage,
      `marketplace_media/${Date.now()}-${file.name}`
    );
    await uploadBytes(mediaRef, file);
    return await getDownloadURL(mediaRef);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEdit ? "Chỉnh Sửa Sản Phẩm" : "Tạo Sản Phẩm Mới"}
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                {isEdit
                  ? "Cập nhật thông tin sản phẩm của bạn"
                  : "Thêm một sản phẩm mới vào cửa hàng của bạn"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <Formik
            enableReinitialize
            initialValues={{
              // Hỗ trợ cả Post và post (API trả về không đồng nhất)
              title:
                (initialData?.Post || initialData?.post)?.title?.trim() || "",
              description:
                (initialData?.Post || initialData?.post)?.description?.trim() ||
                "",
              tier: initialData?.tier || 1,
              required_time: initialData?.required_time || 0,
              available:
                typeof initialData?.available === "boolean"
                  ? initialData.available
                  : true,
              expiry_date: initialData?.expiry_date
                ? (() => {
                    try {
                      const d = new Date(initialData.expiry_date);
                      if (!isNaN(d.getTime()))
                        return d.toISOString().split("T")[0];
                      return "";
                    } catch {
                      return "";
                    }
                  })()
                : "",
              is_public:
                (initialData?.Post || initialData?.post)?.is_public ?? true,
              // Không tự động nạp lại media cũ vào input file (File object) – nếu không upload mới thì media giữ nguyên phía backend
              media: [],
            }}
            validationSchema={CreateMarketplacePostSchema}
            onSubmit={async (
              values,
              { setSubmitting, resetForm, setFieldError }
            ) => {
              const sizeError = validateCakeSizes();
              if (sizeError) {
                setFieldError("general", sizeError);
                setSubmitting(false);
                return;
              }

              setLoading(true);
              try {
                // Upload files
                const uploadedMedia = await Promise.all(
                  values.media.map(async (file) => {
                    const url = await uploadMediaToFirebase(file);
                    return file.type.startsWith("video")
                      ? { video_url: url, image_url: null }
                      : { image_url: url, video_url: null };
                  })
                );

                const payload = {
                  title: values.title,
                  description: values.description,
                  tier: values.tier,
                  required_time: values.required_time,
                  available: values.available,
                  expiry_date: values.expiry_date,
                  is_public: values.is_public,
                  media: uploadedMedia,
                };
                payload.cakeSizes = cakeSizes.filter((s) => s.size && s.price);

                if (isEdit && initialData) {
                  await updateMarketplacePost(initialData.post_id, payload);
                  if (onCreate) await onCreate();
                  onClose();
                  alert("Sản phẩm đã được cập nhật thành công!");
                } else {
                  await createMarketplacePost(payload);
                  if (onCreate) await onCreate();
                  resetForm();
                  setCakeSizes([{ size: "", price: "" }]);
                  onClose();
                  alert("Sản phẩm đã được tạo thành công!");
                }
              } catch (err) {
                console.error(err);
                setFieldError("general", "Không thể gửi. Vui lòng thử lại.");
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              setFieldValue,
              isSubmitting,
              errors,
              setFieldError,
            }) => (
              <Form className="space-y-8">
                {/* Media Upload */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-800">
                    Ảnh Sản phẩm
                  </label>
                  {isEdit &&
                    (initialData?.Post || initialData?.post)?.media && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Ảnh hiện tại
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                          {(initialData.Post || initialData.post).media.map(
                            (m, i) => (
                              <div
                                key={i}
                                className="relative group border-2 border-gray-200 rounded-xl overflow-hidden"
                              >
                                {m.image_url ? (
                                  <img
                                    src={m.image_url}
                                    alt={`old-${i}`}
                                    className="w-full h-32 object-cover"
                                  />
                                ) : m.video_url ? (
                                  <video
                                    src={m.video_url}
                                    className="w-full h-32 object-cover"
                                    controls
                                  />
                                ) : null}
                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                                  Cũ
                                </span>
                              </div>
                            )
                          )}
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          Nếu bạn không tải ảnh mới, ảnh cũ sẽ được giữ nguyên.
                        </p>
                      </div>
                    )}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 scale-105"
                        : "border-gray-300 hover:border-pink-400 hover:bg-gray-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      if (e.dataTransfer.files) {
                        const imageFiles = Array.from(
                          e.dataTransfer.files
                        ).filter((file) => file.type.startsWith("image"));
                        if (!imageFiles.length) return;
                        const remaining = 5 - values.media.length;
                        if (remaining <= 0) {
                          setFieldError("media", "Đã đạt giới hạn 5 ảnh");
                          return;
                        }
                        const toAdd = imageFiles.slice(0, remaining);
                        setFieldValue("media", [...values.media, ...toAdd]);
                        if (imageFiles.length > remaining) {
                          setFieldError(
                            "media",
                            "Chỉ thêm tối đa 5 ảnh (đã cắt bớt)"
                          );
                        }
                      }
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-pink-500" />
                      </div>
                      <p className="text-gray-700 mb-2 font-medium">
                        Kéo và thả ảnh của bạn vào đây
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        hoặc nhấp để duyệt tệp
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {values.media.length}/5 ảnh
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const imageFiles = Array.from(
                              e.target.files
                            ).filter((file) => file.type.startsWith("image"));
                            if (!imageFiles.length) {
                              e.target.value = "";
                              return;
                            }
                            const remaining = 5 - values.media.length;
                            if (remaining <= 0) {
                              setFieldError("media", "Đã đạt giới hạn 5 ảnh");
                              e.target.value = "";
                              return;
                            }
                            const toAdd = imageFiles.slice(0, remaining);
                            setFieldValue("media", [...values.media, ...toAdd]);
                            if (imageFiles.length > remaining) {
                              setFieldError(
                                "media",
                                "Chỉ thêm tối đa 5 ảnh (đã cắt bớt)"
                              );
                            }
                            e.target.value = "";
                          }}
                        />
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Chọn Tệp
                        </span>
                      </label>
                    </div>
                  </div>
                  <ErrorMessage
                    name="media"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />

                  {/* Media preview */}
                  {values.media.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {values.media.map((file, index) => {
                        const isVideo = file.type.startsWith("video");
                        const url = URL.createObjectURL(file);

                        return (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-pink-300 transition-colors">
                              {isVideo ? (
                                <video
                                  src={url}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`preview-${index}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue(
                                  "media",
                                  values.media.filter((_, i) => i !== index)
                                )
                              }
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                              title="Xóa media"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    Tiêu đề sản phẩm
                  </label>
                  <Field
                    name="title"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                    placeholder="Nhập tiêu đề sản phẩm hấp dẫn"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    Mô tả
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 min-h-[120px] resize-none"
                    placeholder="Mô tả chi tiết sản phẩm của bạn..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />
                </div>

                {/* Cake Tiers */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    Số tầng bánh
                  </label>
                  <Field
                    as="select"
                    name="tier"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                  >
                    <option value={1}>1 Tầng - Một lớp</option>
                    <option value={2}>2 Tầng - Hai lớp</option>
                    <option value={3}>3 Tầng - Ba lớp</option>
                    <option value={4}>4 Tầng - Bốn lớp</option>
                    <option value={5}>5 Tầng - Năm lớp</option>
                    <option value={6}>6 Tầng - Sáu lớp</option>
                    <option value={7}>7 Tầng - Bảy lớp</option>
                    <option value={8}>8 Tầng - Tám lớp</option>
                  </Field>
                  <ErrorMessage
                    name="tier"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    🎂 Chọn số lớp/tầng cho thiết kế bánh của bạn
                  </p>
                </div>

                {/* Required Time */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    Số giờ cần đặt trước
                  </label>
                  <Field
                    type="number"
                    name="required_time"
                    step="1" 
                    placeholder="Nhập số giờ cần đặt trước (tối đa 750 giờ - 30 ngày)"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                  />
                  <ErrorMessage
                    name="required_time"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />
                </div>

                {/* Cake Sizes */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-lg font-semibold text-gray-800">
                      Kích cỡ & Giá bánh
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm kích cỡ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cakeSizes.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Kích cỡ (vd: Nhỏ, Vừa, Lớn)"
                              value={row.size}
                              onChange={(e) =>
                                handleChangeSize(idx, "size", e.target.value)
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                            />
                            {cakeSizeErrors[idx]?.size && (
                              <p className="text-red-500 text-sm mt-1">
                                {cakeSizeErrors[idx].size}
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Giá (VND)"
                              value={row.price}
                              onChange={(e) =>
                                handleChangeSize(idx, "price", e.target.value)
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
                            />
                            {cakeSizeErrors[idx]?.price && (
                              <p className="text-red-500 text-sm mt-1">
                                {cakeSizeErrors[idx].price}
                              </p>
                            )}
                          </div>
                          {cakeSizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(idx)}
                              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-all duration-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 Khách hàng sẽ có thể chọn từ các kích thước khác nhau với
                    giá tương ứng của họ
                  </p>
                </div>
                {/* End Cake Sizes */}

                {/* Public Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <Field
                    type="checkbox"
                    name="is_public"
                    id="is_public"
                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <label
                    htmlFor="is_public"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Sản phẩm công khai
                  </label>
                  <p className="text-sm text-gray-600 ml-2">
                    (Sản phẩm công khai sẽ hiển thị cho tất cả người dùng)
                  </p>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    Ngày hết hạn sản phẩm
                  </label>
                  <div className="relative">
                    <Field
                      name="expiry_date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 appearance-none"
                    />
                  </div>
                  <ErrorMessage
                    name="expiry_date"
                    component="div"
                    className="text-red-500 text-sm font-medium"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <svg
                      className="w-4 h-4 text-amber-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Chọn thời điểm danh sách sản phẩm này sẽ hết hạn. Không
                      được phép chọn ngày trong quá khứ.
                    </span>
                  </div>
                </div>

                {/* General error */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-medium">{errors.general}</p>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEdit ? "Đang lưu..." : "Đang tạo..."}
                      </div>
                    ) : isEdit ? (
                      "Lưu thay đổi"
                    ) : (
                      "Tạo sản phẩm"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketplacePost;
