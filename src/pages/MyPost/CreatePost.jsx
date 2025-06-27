"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { authAPI } from "../../api/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const CreatePost = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDate: "",
    eventType: "Birthday",
    story: "",
    media: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newFiles],
    }));
  };

  const handleRemoveMedia = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const media = formData.media.map((file) => ({
        image_url: file.type.startsWith("image")
          ? "https://placehold.co/600x400?text=Cake+Image"
          : null,
        video_url: file.type.startsWith("video")
          ? "https://placehold.co/600x400?text=Cake+Video"
          : null,
      }));

      const uploadedMedia = await Promise.all(
        formData.media.map(async (file) => {
          const url = await uploadMediaToFirebase(file);
          return file.type.startsWith("video")
            ? { video_url: url, image_url: null }
            : { image_url: url, video_url: null };
        })
      );

      const payload = {
        title: formData.eventTitle,
        description: formData.story,
        event_date: formData.eventDate,
        event_type: formData.eventType,
        is_public: true,
        media: uploadedMedia,
      };

      await authAPI.createMemoryPost(payload);
      if (onCreate) await onCreate();
      setSuccess(true);
      setFormData({
        eventTitle: "",
        eventDate: "",
        eventType: "Birthday",
        story: "",
        media: [],
      });
      onClose();
      alert("Post created!");
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Share Your Cake Story
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload box */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center ${
              dragActive ? "border-pink-500 bg-pink-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">
                Drag and drop your cake photos/videos here
              </p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <span className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
                  Choose Files
                </span>
              </label>
            </div>
          </div>

          {/* Preview thumbnails */}
          <div className="flex flex-wrap gap-4">
            {formData.media.map((file, index) => {
              const url = URL.createObjectURL(file);
              const isVideo = file.type.startsWith("video");

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
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
                    title="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="eventTitle"
              placeholder="e.g., Birthday Celebration, Wedding Cake"
              value={formData.eventTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="Birthday">Birthday</option>
              <option value="Wedding">Wedding</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Reunion">Reunion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Story
            </label>
            <textarea
              name="story"
              placeholder="Share the story behind this cake..."
              value={formData.story}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {/* {success && (
            <div className="text-green-600 text-sm">
              Post created successfully!
            </div>
          )} */}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Sharing..." : "Share Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
