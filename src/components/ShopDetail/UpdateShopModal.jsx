import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateShopByUserId } from "../../api/axios";

const UpdateShopSchema = Yup.object().shape({
  business_name: Yup.string().required("Business name is required"),
  business_address: Yup.string().required("Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  specialty: Yup.string().required("Specialty is required"),
  bio: Yup.string()
    .required("Bio is required")
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must not exceed 500 characters"),
  business_hours: Yup.string().required("Business hours are required"),
  delivery_area: Yup.string().required("Delivery area is required"),
});

function UpdateShopModal({ open, onClose, shop, userId, onUpdated }) {
  const [avatarPreview, setAvatarPreview] = useState(
    shop.avatar_image || shop.avatar || ""
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(
    shop.background_image || ""
  );
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [marker, setMarker] = useState({
    lat: shop.latitude || 21.028511,
    lng: shop.longitude || 105.804817,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  // Upload ảnh shop lên Firebase
  const uploadShopImage = async (file, userId) => {
    if (!file) return shop.avatar_image || shop.avatar || "";
    const ext = file.name.split(".").pop();
    const imageRef = ref(storage, `shop_images/${userId}_${Date.now()}.${ext}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  // Xử lý click trên bản đồ (Google Maps iframe)
  const handleMapClick = (e) => {
    const lat = prompt("Nhập vĩ độ (latitude):", marker.lat);
    const lng = prompt("Nhập kinh độ (longitude):", marker.lng);
    if (lat && lng) setMarker({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-5xl min-w-[900px] relative max-h-screen overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between px-12 pt-8 pb-2 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Cập nhật thông tin Shop
          </h2>
          <button
            className="text-gray-400 hover:text-pink-500 text-2xl font-bold"
            onClick={onClose}
            title="Đóng"
          >
            ×
          </button>
        </div>
        {/* Preview background image lớn phía trên form */}
        {backgroundPreview && (
          <div className="w-full h-40 md:h-56 mb-4 rounded-xl overflow-hidden shadow">
            <img
              src={backgroundPreview}
              alt="Background Preview"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        )}
        <Formik
          initialValues={{
            business_name: shop.name || "",
            business_address: shop.business_address || shop.location || "",
            phone_number: shop.phone_number || "",
            specialty:
              shop.specialty ||
              (shop.specialties ? shop.specialties.join(", ") : ""),
            bio: shop.bio || "",
            is_active: shop.is_active ?? true,
            longitude: shop.longitude ?? marker.lng,
            latitude: shop.latitude ?? marker.lat,
            business_hours: shop.business_hours || "",
            delivery_area: shop.delivery_area || "",
            background_image: shop.background_image || "",
            avatar_image: shop.avatar_image || shop.avatar || "",
          }}
          validationSchema={UpdateShopSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);
            setError("");
            try {
              let avatarUrl = values.avatar_image;
              let backgroundUrl = values.background_image;

              if (avatarFile) {
                avatarUrl = await uploadShopImage(
                  avatarFile,
                  userId + "_avatar"
                );
              }
              if (backgroundFile) {
                backgroundUrl = await uploadShopImage(
                  backgroundFile,
                  userId + "_background"
                );
              }

              // Chỉ truyền các trường cần thiết cho nghiệp vụ edit shop
              const payload = {
                business_name: values.business_name,
                business_address: values.business_address,
                phone_number: values.phone_number,
                specialty: values.specialty,
                bio: values.bio,
                is_active: values.is_active,
                longtitue: values.longitude, // Đúng key API
                latitude: values.latitude,
                business_hours: values.business_hours,
                delivery_area: values.delivery_area,
                background_image: backgroundUrl,
                avatar_image: avatarUrl,
              };

              await updateShopByUserId(userId, payload);
              alert("Shop updated!");
              onUpdated && onUpdated();
              onClose();
            } catch (err) {
              setError("Failed to update shop. Please try again.");
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6 px-12 pb-8 pt-4">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 mb-2">
                {/* Upload shop images */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </span>
                    Ảnh đại diện Shop
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setAvatarFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setAvatarPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </span>
                    Ảnh nền Shop
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setBackgroundFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setBackgroundPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  {backgroundPreview && (
                    <img
                      src={backgroundPreview}
                      alt="Background Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                  )}
                </div>
                <div className="xl:col-span-1 col-span-2 flex flex-col justify-center">
                  {/* Chọn vị trí trên bản đồ */}
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3"
                        />
                      </svg>
                    </span>
                    Vị trí shop (nhấn vào bản đồ để nhập toạ độ)
                  </label>
                  <div className="w-full h-32 rounded-lg overflow-hidden border mb-2 relative">
                    <iframe
                      title="Google Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{
                        border: 0,
                        pointerEvents: "auto",
                        cursor: "pointer",
                      }}
                      src={`https://maps.google.com/maps?q=${marker.lat},${marker.lng}&z=15&output=embed`}
                      allowFullScreen
                      onClick={handleMapClick}
                    ></iframe>
                    <div className="absolute bottom-2 left-2 bg-white/80 text-pink-500 px-3 py-1 rounded-full text-xs shadow">
                      Lat: {marker.lat}, Lng: {marker.lng}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Nhấn vào bản đồ để nhập toạ độ (demo, có thể tích hợp Google
                    Maps API nâng cao hơn)
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 01-8 0"
                        />
                      </svg>
                    </span>
                    Tên doanh nghiệp
                  </label>
                  <Field
                    name="business_name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="business_name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-3-3h-4a3 3 0 00-3 3v2h5"
                        />
                      </svg>
                    </span>
                    Địa chỉ
                  </label>
                  <Field
                    name="business_address"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="business_address"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"
                        />
                      </svg>
                    </span>
                    Số điện thoại
                  </label>
                  <Field
                    name="phone_number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="phone_number"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3"
                        />
                      </svg>
                    </span>
                    Chuyên môn
                  </label>
                  <Field
                    name="specialty"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="specialty"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 17l4 4 4-4m-4-5v9"
                        />
                      </svg>
                    </span>
                    Giới thiệu về shop
                  </label>
                  <Field
                    as="textarea"
                    name="bio"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px] bg-gray-50"
                  />
                  <ErrorMessage
                    name="bio"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3"
                        />
                      </svg>
                    </span>
                    Giờ hoạt động
                  </label>
                  <Field
                    name="business_hours"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="business_hours"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <span className="inline-block">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    Khu vực giao hàng
                  </label>
                  <Field
                    name="delivery_area"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <ErrorMessage
                    name="delivery_area"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-gray-700 to-pink-400 text-white py-3 rounded-lg font-semibold hover:bg-pink-500 transition-colors shadow-lg mt-6 disabled:opacity-60 text-lg tracking-wide"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Shop"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default UpdateShopModal;
