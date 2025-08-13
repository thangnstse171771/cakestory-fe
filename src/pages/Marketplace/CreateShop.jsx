import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createShop, fetchAllShops } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ShopSchema = Yup.object().shape({
  business_name: Yup.string().required("Tên cửa hàng không được để trống"),
  province: Yup.string().required("Vui lòng chọn Tỉnh/Thành phố"),
  ward: Yup.string().required("Phường/Xã không được để trống"),
  detail_address: Yup.string().required("Địa chỉ chi tiết không được để trống"),
  phone_number: Yup.string()
    .required("Số điện thoại không được để trống")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  bio: Yup.string()
    .required("Giới thiệu không được để trống")
    .min(10, "Giới thiệu phải có ít nhất 10 ký tự")
    .max(500, "Giới thiệu không được vượt quá 500 ký tự"),
  business_hours: Yup.string().required("Giờ làm việc không được để trống"),
  delivery_area: Yup.string().required("Khu vực giao hàng không được để trống"),
});

// Danh sách tỉnh thành Việt Nam
const provinces = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

// Danh sách giờ làm việc
const businessHoursOptions = [
  "Thứ 2-Thứ 7: 9:00-19:00, Chủ nhật: 10:00-16:00",
  "Thứ 2-Thứ 6: 8:00-18:00, Thứ 7-Chủ nhật: 9:00-17:00",
  "Hàng ngày: 7:00-21:00",
  "Thứ 2-Thứ 6: 8:00-17:00, Cuối tuần: Đóng cửa",
  "Thứ 2-Chủ nhật: 8:00-22:00",
];

// Danh sách khu vực giao hàng
const deliveryAreaOptions = [
  "Trong bán kính 5km",
  "Trong bán kính 10km",
  "Trong bán kính 15km",
  "Toàn thành phố",
  "Miễn phí giao hàng cho đơn từ 500k",
  "Chỉ giao hàng trong quận/huyện",
  "Giao hàng toàn quốc qua đơn vị vận chuyển",
];

const CreateShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 21.028511,
    lng: 105.804817,
  }); // Hà Nội mặc định
  const [marker, setMarker] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");

  useEffect(() => {
    const checkUserShop = async () => {
      if (!user) return;
      const data = await fetchAllShops();
      if ((data.shops || []).some((shop) => shop.user_id === user.id)) {
        alert("Bạn đã có shop!");
        navigate("/marketplace");
      }
    };
    checkUserShop();
  }, []); // Only run once on mount

  // Upload ảnh shop lên Firebase
  const uploadShopImage = async (file, userId, type) => {
    if (!file) return "";
    const ext = file.name.split(".").pop();
    const imageRef = ref(
      storage,
      `shop_images/${userId}_${type}_${Date.now()}.${ext}`
    );
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  // Cập nhật districts khi chọn province (bỏ logic này vì không cần nữa)

  // Xử lý click trên bản đồ (Google Maps iframe)
  const handleMapClick = (e) => {
    // Lấy toạ độ từ sự kiện click trên iframe (dùng window prompt cho demo)
    const lat = prompt("Nhập vĩ độ (latitude):", mapCenter.lat);
    const lng = prompt("Nhập kinh độ (longitude):", mapCenter.lng);
    if (lat && lng) setMarker({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            Tạo cửa hàng mới
          </h2>
          <p className="text-gray-600 text-lg">
            Bắt đầu hành trình kinh doanh bánh ngọt của bạn
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
          {/* Background Image Preview */}
          {backgroundPreview && (
            <div className="w-full h-64 relative">
              <img
                src={backgroundPreview}
                alt="Background Preview"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <div className="flex items-center space-x-4">
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  )}
                  <div className="text-white">
                    <h3 className="text-xl font-bold">Preview Shop</h3>
                    <p className="text-white/80">Giao diện shop của bạn</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        <Formik
          initialValues={{
            business_name: "",
            province: "",
            ward: "",
            detail_address: "",
            phone_number: "",
            bio: "",
            is_active: true,
            longitude: 0,
            latitude: 0,
            business_hours: "",
            delivery_area: "",
            background_image: "",
            avatar_image: "",
          }}
          validationSchema={ShopSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setLoading(true);
            setError("");
            try {
              let avatarUrl = "";
              let backgroundUrl = "";

              if (avatarFile) {
                avatarUrl = await uploadShopImage(
                  avatarFile,
                  user?.id,
                  "avatar"
                );
              }

              if (backgroundFile) {
                backgroundUrl = await uploadShopImage(
                  backgroundFile,
                  user?.id,
                  "background"
                );
              }

              // Tạo địa chỉ đầy đủ từ các phần
              const fullAddress = `${values.detail_address}, ${values.ward}, ${values.province}`;

              await createShop({
                business_name: values.business_name,
                business_address: fullAddress,
                phone_number: values.phone_number,
                bio: values.bio,
                is_active: values.is_active,
                longitude: marker?.lng || 0,
                latitude: marker?.lat || 0,
                business_hours: values.business_hours,
                delivery_area: values.delivery_area,
                background_image: backgroundUrl,
                avatar_image: avatarUrl,
                user_id: user?.id,
              });

              alert("Tạo cửa hàng thành công!");
              resetForm();
              navigate("/marketplace");
            } catch (err) {
              setError("Không thể tạo cửa hàng. Vui lòng thử lại.");
              console.error(err);
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="p-8 space-y-8">
              {/* Upload Images Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Upload avatar image */}
                <div className="space-y-4">
                  <label className="block text-gray-800 font-semibold text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Ảnh đại diện Shop
                  </label>
                  <div className="relative">
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
                        } else {
                          setAvatarPreview("");
                        }
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:border-pink-400 bg-gray-50 hover:bg-gray-100 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                    {!avatarPreview && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-gray-400">Chọn ảnh đại diện</span>
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-pink-200 shadow-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview("");
                          }}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload background image */}
                <div className="space-y-4">
                  <label className="block text-gray-800 font-semibold text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-4-4v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2h8a2 2 0 012 2z"
                        />
                      </svg>
                    </div>
                    Ảnh nền Shop
                  </label>
                  <div className="relative">
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
                        } else {
                          setBackgroundPreview("");
                        }
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:border-blue-400 bg-gray-50 hover:bg-gray-100 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {!backgroundPreview && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-gray-400">Chọn ảnh nền</span>
                      </div>
                    )}
                  </div>
                  {backgroundPreview && (
                    <div className="relative">
                      <img
                        src={backgroundPreview}
                        alt="Background Preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-blue-200 shadow-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBackgroundFile(null);
                            setBackgroundPreview("");
                          }}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <label className="block text-gray-800 font-semibold text-lg mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                  Vị trí Shop trên bản đồ
                </label>
                <div className="relative">
                  <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-green-200 relative">
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
                      src={`https://maps.google.com/maps?q=${
                        marker?.lat || mapCenter.lat
                      },${marker?.lng || mapCenter.lng}&z=15&output=embed`}
                      allowFullScreen
                      onClick={handleMapClick}
                    ></iframe>
                    {marker && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-green-700 px-4 py-2 rounded-full text-sm shadow-lg font-medium">
                        📍 Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleMapClick}
                    className="mt-3 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    📍 Nhấn để đặt vị trí
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    Nhấn vào nút trên để nhập toạ độ vị trí shop của bạn
                  </p>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Business Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Tên cửa hàng
                  </label>
                  <Field
                    name="business_name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    placeholder="Nhập tên cửa hàng của bạn"
                  />
                  <ErrorMessage
                    name="business_name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Số điện thoại
                  </label>
                  <Field
                    name="phone_number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    placeholder="Nhập số điện thoại"
                  />
                  <ErrorMessage
                    name="phone_number"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                    Tỉnh/Thành phố
                  </label>
                  <Field
                    as="select"
                    name="province"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue("province", value);
                      setSelectedProvince(value);
                      setFieldValue("ward", "");
                    }}
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="province"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                    </svg>
                    Phường/Xã
                  </label>
                  <Field
                    name="ward"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    placeholder={selectedProvince ? "Nhập tên phường/xã" : "Vui lòng chọn tỉnh/thành phố trước"}
                    disabled={!selectedProvince}
                  />
                  <ErrorMessage
                    name="ward"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Detail Address */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Địa chỉ chi tiết
                  </label>
                  <Field
                    name="detail_address"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    placeholder="Số nhà, tên đường..."
                  />
                  <ErrorMessage
                    name="detail_address"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Business Hours */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Giờ làm việc
                  </label>
                  <Field
                    name="business_hours"
                    className="hidden"
                    render={({ field, form }) => {
                      const [selectedOption, setSelectedOption] = useState(
                        field.value
                      );
                      const [customValue, setCustomValue] = useState("");

                      return (
                        <div className="space-y-2">
                          <select
                            {...field}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedOption(val);
                              if (val !== "other") {
                                form.setFieldValue("business_hours", val);
                              }
                            }}
                            value={selectedOption}
                          >
                            <option value="">-- Chọn giờ làm việc --</option>
                            {businessHoursOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            <option value="other">Khác (tuỳ chỉnh)</option>
                          </select>

                          {selectedOption === "other" && (
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                              placeholder="Ví dụ: Thứ 2-Thứ 7: 8:30-20:00, Chủ nhật: 9:00-18:00"
                              value={customValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomValue(val);
                                form.setFieldValue("business_hours", val);
                              }}
                            />
                          )}
                        </div>
                      );
                    }}
                  />
                  <ErrorMessage
                    name="business_hours"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Delivery Area */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                    Khu vực giao hàng
                  </label>
                  <Field
                    name="delivery_area"
                    className="hidden"
                    render={({ field, form }) => {
                      const [selectedOption, setSelectedOption] = useState(
                        field.value
                      );
                      const [customValue, setCustomValue] = useState("");

                      return (
                        <div className="space-y-2">
                          <select
                            {...field}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedOption(val);
                              if (val !== "other") {
                                form.setFieldValue("delivery_area", val);
                              }
                            }}
                            value={selectedOption}
                          >
                            <option value="">
                              -- Chọn khu vực giao hàng --
                            </option>
                            {deliveryAreaOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            <option value="other">Khác (tuỳ chỉnh)</option>
                          </select>

                          {selectedOption === "other" && (
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                              placeholder="Nhập khu vực giao hàng của bạn"
                              value={customValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomValue(val);
                                form.setFieldValue("delivery_area", val);
                              }}
                            />
                          )}
                        </div>
                      );
                    }}
                  />
                  <ErrorMessage
                    name="delivery_area"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <label className="block text-gray-800 font-semibold text-lg mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Giới thiệu về cửa hàng
                </label>
                <Field
                  as="textarea"
                  name="bio"
                  rows={5}
                  className="w-full border-2 border-yellow-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 bg-white hover:border-yellow-300 transition-colors text-gray-800 resize-none"
                  placeholder="Mô tả ngắn về cửa hàng của bạn, các sản phẩm nổi bật, đặc trưng, kinh nghiệm làm bánh..."
                />
                <ErrorMessage
                  name="bio"
                  component="div"
                  className="text-red-500 text-sm mt-2"
                />
                <div className="text-gray-500 text-sm mt-2">
                  💡 Hãy viết một đoạn giới thiệu thu hút để khách hàng hiểu rõ về shop của bạn
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                  ❌ {error}
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo cửa hàng...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      🏪 Tạo cửa hàng của tôi
                    </div>
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Bằng việc tạo cửa hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                </p>
              </div>
            </Form>
          )}
        </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
