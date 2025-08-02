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
  district: Yup.string().required("Vui lòng chọn Quận/Huyện"),
  ward: Yup.string().required("Vui lòng chọn Phường/Xã"),
  detail_address: Yup.string().required("Địa chỉ chi tiết không được để trống"),
  phone_number: Yup.string()
    .required("Số điện thoại không được để trống")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  specialty: Yup.string().required("Chuyên môn không được để trống"),
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

// Danh sách các loại bánh
const specialtyOptions = [
  "Bánh sinh nhật",
  "Bánh cưới",
  "Bánh kỷ niệm",
  "Bánh cupcake",
  "Bánh theo yêu cầu",
  "Bánh su kem",
  "Bánh mousse",
  "Bánh trung thu",
  "Bánh mì",
  "Cookies & Brownies",
  "Bánh tart trái cây",
  "Bánh flan/caramen",
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
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [wards, setWards] = useState([]);

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

  // Cập nhật districts khi chọn province
  useEffect(() => {
    if (selectedProvince) {
      // Trong thực tế, bạn sẽ gọi API để lấy danh sách quận/huyện dựa trên tỉnh/thành phố
      // Ở đây, chúng tôi sử dụng dữ liệu giả
      const mockDistricts = [
        `${selectedProvince} - Quận 1`,
        `${selectedProvince} - Quận 2`,
        `${selectedProvince} - Quận 3`,
        `${selectedProvince} - Quận Tân Bình`,
        `${selectedProvince} - Huyện Củ Chi`,
      ];
      setDistricts(mockDistricts);
      setSelectedDistrict("");
      setWards([]);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Cập nhật wards khi chọn district
  useEffect(() => {
    if (selectedDistrict) {
      // Trong thực tế, bạn sẽ gọi API để lấy danh sách phường/xã dựa trên quận/huyện
      // Ở đây, chúng tôi sử dụng dữ liệu giả
      const mockWards = [
        `${selectedDistrict} - Phường 1`,
        `${selectedDistrict} - Phường 2`,
        `${selectedDistrict} - Phường 3`,
        `${selectedDistrict} - Xã An Nhơn Tây`,
        `${selectedDistrict} - Xã Tân Phú Trung`,
      ];
      setWards(mockWards);
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Xử lý click trên bản đồ (Google Maps iframe)
  const handleMapClick = (e) => {
    // Lấy toạ độ từ sự kiện click trên iframe (dùng window prompt cho demo)
    const lat = prompt("Nhập vĩ độ (latitude):", mapCenter.lat);
    const lng = prompt("Nhập kinh độ (longitude):", mapCenter.lng);
    if (lat && lng) setMarker({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <h2 className="text-3xl font-bold text-center text-pink-500 mb-8">
          Tạo cửa hàng mới
        </h2>

        <Formik
          initialValues={{
            business_name: "",
            province: "",
            district: "",
            ward: "",
            detail_address: "",
            phone_number: "",
            specialty: "",
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
              const fullAddress = `${values.detail_address}, ${values.ward}, ${values.district}, ${values.province}`;

              await createShop({
                business_name: values.business_name,
                business_address: fullAddress,
                phone_number: values.phone_number,
                specialty: values.specialty,
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
            <Form className="space-y-6">
              {/* Preview background image */}
              {backgroundPreview && (
                <div className="w-full h-40 md:h-56 mb-6 rounded-xl overflow-hidden shadow">
                  <img
                    src={backgroundPreview}
                    alt="Background Preview"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Upload avatar image */}
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
                        d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z"
                      />
                    </svg>
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
                      } else {
                        setAvatarPreview("");
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

                {/* Upload background image */}
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                      />
                    </svg>
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
                      } else {
                        setBackgroundPreview("");
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

                {/* Shop Location Map */}
                <div className="md:col-span-1 flex flex-col justify-between">
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
                    Vị trí Shop (nhấn vào bản đồ để nhập toạ độ)
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
                      src={`https://maps.google.com/maps?q=${
                        marker?.lat || mapCenter.lat
                      },${marker?.lng || mapCenter.lng}&z=15&output=embed`}
                      allowFullScreen
                      onClick={handleMapClick}
                    ></iframe>
                    {marker && (
                      <div className="absolute bottom-2 left-2 bg-white/80 text-pink-500 px-3 py-1 rounded-full text-xs shadow">
                        Lat: {marker.lat}, Lng: {marker.lng}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Nhấn vào bản đồ để nhập toạ độ (demo, có thể tích hợp Google
                    Maps API nâng cao hơn)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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

                {/* Specialty */}
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
                        d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                      />
                    </svg>
                    Chuyên môn
                  </label>
                  <Field
                    name="specialty"
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
                                form.setFieldValue("specialty", val);
                              }
                            }}
                            value={selectedOption}
                          >
                            <option value="">-- Chọn chuyên môn --</option>
                            {specialtyOptions.map((opt) => (
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
                              placeholder="Nhập chuyên môn của bạn"
                              value={customValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomValue(val);
                                form.setFieldValue("specialty", val);
                              }}
                            />
                          )}
                        </div>
                      );
                    }}
                  />
                  <ErrorMessage
                    name="specialty"
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
                      setFieldValue("district", "");
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

                {/* District */}
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
                    Quận/Huyện
                  </label>
                  <Field
                    as="select"
                    name="district"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    disabled={!selectedProvince}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue("district", value);
                      setSelectedDistrict(value);
                      setFieldValue("ward", "");
                    }}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="district"
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
                    as="select"
                    name="ward"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    disabled={!selectedDistrict}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </Field>
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
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Giới thiệu về cửa hàng
                </label>
                <Field
                  as="textarea"
                  name="bio"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  placeholder="Mô tả ngắn về cửa hàng của bạn, các sản phẩm nổi bật, đặc trưng..."
                />
                <ErrorMessage
                  name="bio"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-colors shadow-lg mt-8 disabled:opacity-60 text-lg tracking-wide"
              >
                {loading ? "Đang tạo..." : "Tạo cửa hàng"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateShop;
