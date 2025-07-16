import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createMarketplacePost } from "../../api/axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const CreateMarketplacePostSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().max(
    1000,
    "Description cannot exceed 1000 characters"
  ),
  price: Yup.number()
    .min(0, "Price must be >= 0")
    .required("Price is required"),
  available: Yup.boolean().required(),
  expiry_date: Yup.string().required("Expiry date is required"),
  media: Yup.array().min(1, "Please add at least one media file"),
});

const CreateMarketplacePost = ({ isOpen, onClose, onCreate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

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
            Create Marketplace Post
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
            title: "",
            description: "",
            price: 0,
            available: true,
            expiry_date: "",
            is_public: true,
            media: [],
          }}
          validationSchema={CreateMarketplacePostSchema}
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
                title: values.title,
                description: values.description,
                price: values.price,
                available: values.available,
                expiry_date: values.expiry_date,
                is_public: true,
                media: uploadedMedia,
              };

              await createMarketplacePost(payload);
              if (onCreate) await onCreate();
              resetForm();
              onClose();
              alert("Marketplace post created!");
            } catch (err) {
              setFieldError(
                "general",
                "Failed to create marketplace post. Please try again."
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

              {/* Title */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Title
                </label>
                <Field
                  name="title"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter product title"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px]"
                  placeholder="Describe your product..."
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Price */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Price ($)
                </label>
                <Field
                  name="price"
                  type="number"
                  min={0}
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter price"
                />
                <ErrorMessage
                  name="price"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Available */}
              <div className="flex items-center gap-2">
                <Field type="checkbox" name="available" id="available" />
                <label
                  htmlFor="available"
                  className="text-pink-500 font-semibold"
                >
                  Available
                </label>
              </div>
              {/* Expiry Date */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Expiry Date
                </label>
                <Field
                  name="expiry_date"
                  type="date"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <ErrorMessage
                  name="expiry_date"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {errors.general && (
                <div className="text-red-500 text-sm">{errors.general}</div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors shadow-lg mt-4 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Post"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateMarketplacePost;
