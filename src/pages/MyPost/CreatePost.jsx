"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { authAPI } from "../../api/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { toast } from "react-toastify";

const CreatePostSchema = Yup.object().shape({
  eventTitle: Yup.string().required("Event title is required"),
  eventDate: Yup.string().required("Event date is required"),
  eventType: Yup.string().required("Event type is required"),
  story: Yup.string().max(1000, "Story cannot exceed 1000 characters"),
  media: Yup.array().min(1, "Please add at least one media file"),
});

const CreatePost = ({ isOpen, onClose, onCreate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

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

        <Formik
          initialValues={{
            eventTitle: "",
            eventDate: "",
            eventType: "Birthday",
            story: "",
            media: [],
          }}
          validationSchema={CreatePostSchema}
          onSubmit={async (
            values,
            { setSubmitting, resetForm, setFieldError }
          ) => {
            setLoading(true);
            try {
              // Upload each file and get URLs
              const uploadedMedia = await Promise.all(
                values.media.map(async (file) => {
                  const url = await uploadMediaToFirebase(file);
                  return file.type.startsWith("video")
                    ? { video_url: url, image_url: null }
                    : { image_url: url, video_url: null };
                })
              );

              const payload = {
                title: values.eventTitle,
                description: values.story,
                event_date: values.eventDate,
                event_type: values.eventType,
                is_public: true,
                media: uploadedMedia,
              };

              await authAPI.createMemoryPost(payload);
              if (onCreate) await onCreate();
              resetForm();
              onClose();
              toast.success("Post created!");
            } catch (err) {
              console.error(err);
              setFieldError(
                "general",
                "Failed to create post. Please try again."
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
                  dragActive ? "border-pink-500 bg-pink-50" : "border-gray-300"
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
                        setFieldValue("media", [
                          ...values.media,
                          ...Array.from(e.target.files),
                        ]);
                        e.target.value = "";
                      }}
                    />
                    <span className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
                      Choose Files
                    </span>
                  </label>
                </div>
              </div>
              <ErrorMessage
                name="media"
                component="div"
                className="text-red-500 text-sm"
              />

              {/* Preview thumbnails */}
              <div className="flex flex-wrap gap-4">
                {values.media.map((file, index) => {
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
                  Event Title
                </label>
                <Field
                  name="eventTitle"
                  placeholder="e.g., Birthday Celebration, Wedding Cake"
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
                  Event Date
                </label>
                <Field
                  type="date"
                  name="eventDate"
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
                  Event Type
                </label>
                <Field
                  as="select"
                  name="eventType"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Reunion">Reunion</option>
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
                  Your Story
                </label>
                <Field
                  as="textarea"
                  name="story"
                  placeholder="Share the story behind this cake..."
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
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Sharing..." : "Share Story"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreatePost;
