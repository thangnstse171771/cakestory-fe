"use client";

import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { authAPI } from "../../api/auth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const UpdatePostSchema = Yup.object().shape({
  eventTitle: Yup.string().required("Hãy nhập tên sự kiện.").max(100, "Tên sự kiện không được vượt quá 100 ký tự."),
  eventDate: Yup.date()
    .max(new Date(), "Ngày sự kiện không thể ở tương lai.")
    .required("Hãy chọn ngày sự kiện."),
  eventType: Yup.string().required("Hãy chọn thể loại sự kiện."),
  story: Yup.string().required("Hãy nhập câu chuyện.").max(1000, "Câu chuyện không được vượt quá 1000 ký tự."),
  media: Yup.array().min(1, "Hãy chọn ít nhất một tệp.").max(10, "Tối đa 10 tệp."),
});

const UpdatePost = ({ isOpen, onClose, post, onUpdate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const uploadMediaToFirebase = async (file) => {
    const mediaRef = ref(storage, `media/${Date.now()}-${file.name}`);
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

  if (!isOpen || !post) return null;

  // Convert existing media to File objects for Formik
  const convertExistingMediaToFiles = () => {
    if (!post.media || post.media.length === 0) return [];

    return post.media.map((media, index) => {
      const url = media.image_url || media.video_url;
      const isVideo = !!media.video_url;

      // Create a mock file object for existing media
      return {
        id: `existing-${index}`,
        url: url,
        isVideo: isVideo,
        isExisting: true,
        name: `existing-media-${index}`,
        type: isVideo ? "video/mp4" : "image/jpeg",
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Chỉnh sửa Bài viết
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                Cập nhật một bài viết
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

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <Formik
            key={post?.id} // Force re-render when post changes
            enableReinitialize={true}
            initialValues={{
              eventTitle: post?.title || "",
              eventDate: formatDateForInput(post?.date) || "",
              eventType: post?.category || "Sinh Nhật",
              story: post?.description || "",
              media: convertExistingMediaToFiles(),
            }}
            validationSchema={UpdatePostSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              setLoading(true);
              try {
                // Separate existing and new media
                const existingMedia = values.media.filter(
                  (item) => item.isExisting
                );
                const newFiles = values.media.filter(
                  (item) => !item.isExisting
                );

                // Upload new files
                const uploadedMedia = await Promise.all(
                  newFiles.map(async (file) => {
                    const url = await uploadMediaToFirebase(file);
                    return file.type.startsWith("video")
                      ? { video_url: url, image_url: null }
                      : { image_url: url, video_url: null };
                  })
                );

                // Convert existing media back to the format expected by API
                const existingMediaFormatted = existingMedia.map((item) => ({
                  image_url: item.isVideo ? null : item.url,
                  video_url: item.isVideo ? item.url : null,
                }));

                // Combine all media
                const finalMedia = [
                  ...existingMediaFormatted,
                  ...uploadedMedia,
                ];

                const payload = {
                  title: values.eventTitle,
                  description: values.story,
                  event_date: values.eventDate,
                  event_type: values.eventType,
                  is_public: true,
                  media: finalMedia,
                };

                console.log("UpdatePost: Sending payload to API:", payload);
                await authAPI.updateMemoryPost(post.id, payload);
                if (onUpdate) await onUpdate();
                onClose();
                toast.success("Cập nhật thành công!");
              } catch (err) {
                console.error("UpdatePost: Error updating post:", err);
                setFieldError(
                  "general",
                  "Gặp lỗi khi cập nhật. Vui lòng thử lại."
                );
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting, errors }) => (
              <Form className="space-y-6">
                {/* Upload box */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center ${
                    dragActive
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    if (e.dataTransfer.files) {
                      setFieldValue("media", [
                        ...values.media,
                        ...Array.from(e.dataTransfer.files),
                      ]);
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-5" />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          setFieldValue("media", [
                            ...values.media,
                            ...Array.from(e.target.files),
                          ]);
                          e.target.value = "";
                        }}
                      />
                      <span className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
                        Chọn Tệp
                      </span>
                    </label>
                  </div>
                </div>
                <ErrorMessage
                  name="media"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Media previews */}
                <div className="flex flex-wrap gap-4">
                  {values.media.map((file, index) => {
                    const url = file.isExisting
                      ? file.url
                      : URL.createObjectURL(file);
                    const isVideo = file.isExisting
                      ? file.isVideo
                      : file.type.startsWith("video");

                    return (
                      <div key={index} className="relative w-24 h-24">
                        {isVideo ? (
                          <video
                            src={url}
                            controls
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setFieldValue(
                              "media",
                              values.media.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
                          title="Remove media"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Event title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Sự Kiện
                  </label>
                  <Field
                    name="eventTitle"
                    placeholder="Kỉ niệm ngày cưới, Sinh nhật..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="eventTitle"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Event date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Sự Kiện
                  </label>
                  <Field
                    type="date"
                    name="eventDate"
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="eventDate"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Event type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thể Loại
                  </label>
                  <Field
                    as="select"
                    name="eventType"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="Sinh Nhật">Sinh Nhật</option>
                    <option value="Đám Cưới">Đám Cưới</option>
                    <option value="Kỉ Niệm">Kỉ Niệm</option>
                    <option value="Tái Ngộ">Tái Ngộ</option>
                  </Field>
                  <ErrorMessage
                    name="eventType"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Story */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Câu Chuyện của Bạn
                  </label>
                  <Field
                    as="textarea"
                    name="story"
                    placeholder="Chia sẻ câu chuyện đằng sau những bức ảnh này..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="story"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* General error */}
                {errors.general && (
                  <div className="text-red-500 text-sm">{errors.general}</div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting || loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? "Đang tải..." : "Cập nhật"}
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

export default UpdatePost;
