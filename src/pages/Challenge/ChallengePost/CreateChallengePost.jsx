"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { authAPI } from "../../../api/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import { toast } from "react-toastify";
import CreateRulePopup from "./CreateRulePopup";

const CreateChallengePostSchema = Yup.object().shape({
  title: Yup.string().required("Hãy nhập tựa đề bài viết"),
  description: Yup.string().max(2000, "Mô tả không được quá 2000 kí tự"),
  media: Yup.array().min(1, "Xin hãy thêm ít nhất 1 tệp"),
});

const CreateChallengePost = ({ isOpen, onClose, onCreate, challengeId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

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
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Đăng Bài Tham Gia Thử Thách
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                Liệu bạn đã sẵn sàng hay chưa?
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
            initialValues={{
              title: "",
              description: "",
              media: [],
            }}
            validationSchema={CreateChallengePostSchema}
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
                  challenge_id: challengeId, // Assuming you pass albumId as prop
                  title: values.title,
                  description: values.description,
                  is_design: true,
                  is_public: true,
                  media: uploadedMedia,
                };

                console.log("payload being sent:", payload);
                await authAPI.createChallengePost(payload);
                if (onCreate) await onCreate();
                resetForm();
                onClose();
                toast.success("Đăng bài thành công!");
              } catch (err) {
                console.error(err);
                setFieldError(
                  "general",
                  "Đã xảy ra lỗi. Xin vui lòng thử lại."
                );
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
              submitForm,
              isValid,
              dirty,
            }) => (
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
                    Tên Bài Viết Thử Thách
                  </label>
                  <Field
                    name="title"
                    placeholder="Bánh Kem mạnh nhất, Bánh kem đẹp nhất, ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô Tả
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Bánh kem được làm bởi nhà vô địch..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* General error */}
                {errors.general && (
                  <div className="text-red-500 text-sm">{errors.general}</div>
                )}

                {/* Buttons */}
                {/* BUTTONS */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className={`px-6 py-2 rounded-full transition-colors ${
                      !isValid || !dirty || loading
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-pink-500 text-white hover:bg-pink-600"
                    }`}
                    onClick={() => setOpenPopup(true)}
                    disabled={!isValid || !dirty || loading}
                  >
                    Đăng bài
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <CreateRulePopup
        isOpen={openPopup}
        onClose={() => setOpenPopup(false)}
        handleCreate={() => {
          setOpenPopup(false);
          if (formikSubmit) formikSubmit();
        }}
        loading={loading}
      />
    </div>
  );
};

export default CreateChallengePost;
