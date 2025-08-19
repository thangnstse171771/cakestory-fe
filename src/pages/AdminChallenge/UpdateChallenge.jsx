"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { toast } from "react-toastify";
import { updateChallenge } from "../../api/challenge";

const today = new Date();
today.setHours(0, 0, 0, 0);

const sevenDaysFromNow = new Date(today);
const calendarSetting = new Date(today);
sevenDaysFromNow.setDate(today.getDate() + 8);
calendarSetting.setDate(today.getDate() + 9);

const UpdateChallengeSchema = Yup.object().shape({
  title: Yup.string()
    .required("Hãy nhập tên sự kiện.")
    .max(100, "Tối đa 100 ký tự"),
  description: Yup.string()
    .required("Hãy nhập mô tả.")
    .max(1000, "Tối đa 1000 ký tự"),
  start_date: Yup.date()
    .required("Hãy chọn ngày bắt đầu.")
    .min(sevenDaysFromNow, "Ngày bắt đầu phải cách 7 ngày."),
  end_date: Yup.date()
    .required("Hãy chọn ngày kết thúc.")
    .min(
      Yup.ref("start_date"),
      "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu."
    ),
  prize_description: Yup.string()
    .required("Hãy nhập giải thưởng.")
    .max(500, "Tối đa 500 ký tự"),
  min_participants: Yup.number()
    .required("Hãy nhập số lượng người tham gia tối thiểu.")
    .min(3, "Tối thiểu 3 người tham gia")
    .max(200, "Tối đa 200 người tham gia"),
  max_participants: Yup.number()
    .required("Hãy nhập số lượng người tham gia tối đa.")
    .min(Yup.ref("min_participants"), "Không thể ít hơn số người tối thiểu")
    .max(200, "Tối đa 200 người tham gia"),
  hashtag: Yup.string().required("Hãy nhập hashtag.").max(200),
  rules: Yup.string()
    .required("Hãy nhập luật chơi.")
    .max(500, "Tối đa 500 ký tự"),
  requirements: Yup.string()
    .required("Hãy nhập yêu cầu.")
    .max(500, "Tối đa 500 ký tự"),
  avatar: Yup.string().required("Hãy chọn ảnh đại diện."),
});

const UpdateChallenge = ({ isOpen, onClose, challenge, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadAvatarToFirebase = async (file) => {
    const avatarRef = ref(storage, `avatars/${Date.now()}-${file.name}`);
    await uploadBytes(avatarRef, file);
    return await getDownloadURL(avatarRef);
  };

  const defaultPrizes = [
    "Bộ dụng cụ làm bánh cao cấp",
    "Voucher 500.000đ",
    "Khóa học làm bánh chuyên nghiệp",
    "Chuyến du lịch",
    "Máy đánh trứng KitchenAid",
  ];
  const defaultHashtags = ["bánh", "thử-thách", "sáng-tạo", "học-hỏi"];

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Cập Nhật Thử Thách</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <Formik
            initialValues={{
              title: challenge.title || "",
              description: challenge.description || "",
              start_date: challenge.start_date?.split("T")[0] || "",
              end_date: challenge.end_date?.split("T")[0] || "",
              prize_description: challenge.prize_description || "",
              max_participants: challenge.maxParticipants || "",
              min_participants: challenge.minParticipants || "",
              hashtag: Array.isArray(challenge?.hashtags)
                ? challenge.hashtags.join(", ")
                : challenge?.hashtag || "",
              rules: Array.isArray(challenge?.rules)
                ? challenge.rules.join("\n")
                : challenge?.rules || "",
              requirements: Array.isArray(challenge?.requirements)
                ? challenge.requirements.join("\n")
                : challenge?.requirements || "",
              avatar: challenge.avatar || "",
            }}
            validationSchema={UpdateChallengeSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setLoading(true);
              try {
                let avatarUrl = values.avatar;
                if (values.avatar instanceof File) {
                  avatarUrl = await uploadAvatarToFirebase(values.avatar);
                }

                const payload = { ...values, avatar: avatarUrl };
                await updateChallenge(challenge.id, payload);
                if (onUpdate) await onUpdate();
                toast.success("Cập nhật thử thách thành công!");
                onClose();
              } catch (err) {
                console.error(err);
                toast.error("Lỗi khi cập nhật thử thách. Vui lòng thử lại.");
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex gap-6">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ảnh đại diện
                    </label>
                    {values.avatar && typeof values.avatar !== "string" ? (
                      <div className="relative w-32 h-32">
                        <img
                          src={URL.createObjectURL(values.avatar)}
                          alt="preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFieldValue("avatar", "");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {values.avatar && typeof values.avatar === "string" && (
                          <img
                            src={values.avatar}
                            alt="current avatar"
                            className="w-32 h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFieldValue("avatar", e.target.files[0])
                          }
                          className="w-full"
                        />
                      </>
                    )}
                    <ErrorMessage
                      name="avatar"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sự kiện
                    </label>
                    <Field
                      type="text"
                      name="title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <Field
                      type="date"
                      name="start_date"
                      min={calendarSetting.toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="start_date"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <Field
                      type="date"
                      name="end_date"
                      min={calendarSetting.toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="end_date"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giải thưởng
                  </label>

                  <div className="flex gap-2">
                    {/* Text input (for custom prize or selected dropdown) */}
                    <Field
                      type="text"
                      name="prize_description"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />

                    {/* Dropdown for default prizes */}
                    <Field name="prize_description">
                      {({ form }) => (
                        <select
                          className="px-2 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          onChange={(e) => {
                            if (e.target.value) {
                              form.setFieldValue(
                                "prize_description",
                                e.target.value
                              );
                            }
                          }}
                        >
                          <option value="">Chọn nhanh</option>
                          {defaultPrizes.map((prize, idx) => (
                            <option key={idx} value={prize}>
                              {prize}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                  </div>

                  <ErrorMessage
                    name="prize_description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người tham gia tối thiểu
                    </label>
                    <Field
                      type="number"
                      name="min_participants"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="min_participants"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người tham gia tối đa
                    </label>
                    <Field
                      type="number"
                      name="max_participants"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="max_participants"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hashtag
                  </label>
                  <Field
                    type="text"
                    name="hashtag"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-2"
                  />

                  <div className="flex flex-wrap gap-2">
                    {defaultHashtags.map((tag) => (
                      <Field name="hashtag" key={tag}>
                        {({ field, form }) => (
                          <span
                            onClick={() => {
                              let current = field.value || "";
                              // Convert string to array by splitting on commas
                              let hashtags = current
                                .split(",")
                                .map((h) => h.trim())
                                .filter((h) => h.length > 0);

                              // Add only if not already included
                              if (!hashtags.includes(`${tag}`)) {
                                hashtags.push(`${tag}`);
                              }

                              // Update field value (joined by comma + space)
                              form.setFieldValue(
                                "hashtag",
                                hashtags.join(", ")
                              );
                            }}
                            className="px-2 py-1 border border-pink-100 text-pink-700 bg-pink-50 rounded text-xs cursor-pointer transition 
              hover:bg-pink-100 hover:border-pink-300"
                          >
                            #{tag}
                          </span>
                        )}
                      </Field>
                    ))}
                  </div>

                  <ErrorMessage
                    name="hashtag"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Luật chơi
                    </label>
                    <Field
                      as="textarea"
                      name="rules"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
                    />
                    <ErrorMessage
                      name="rules"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yêu cầu
                    </label>
                    <Field
                      as="textarea"
                      name="requirements"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
                    />
                    <ErrorMessage
                      name="requirements"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                  >
                    {isSubmitting || loading ? "Đang cập nhật..." : "Cập nhật"}
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

export default UpdateChallenge;
