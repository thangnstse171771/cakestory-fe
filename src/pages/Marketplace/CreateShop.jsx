import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createShop, fetchAllShops } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ShopSchema = Yup.object().shape({
  business_name: Yup.string().required("Business name is required"),
  business_address: Yup.string().required("Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  specialty: Yup.string().required("Specialty is required"),
  bio: Yup.string().required("Bio is required"),
});

const CreateShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 21.028511,
    lng: 105.804817,
  }); // Hà Nội mặc định
  const [marker, setMarker] = useState(null);

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
  }, [user, navigate]);

  // Upload ảnh shop lên Firebase
  const uploadShopImage = async (file, userId) => {
    if (!file) return "";
    const ext = file.name.split(".").pop();
    const imageRef = ref(storage, `shop_images/${userId}_${Date.now()}.${ext}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  // Xử lý click trên bản đồ (Google Maps iframe)
  const handleMapClick = (e) => {
    // Lấy toạ độ từ sự kiện click trên iframe (dùng window prompt cho demo)
    const lat = prompt("Nhập vĩ độ (latitude):", mapCenter.lat);
    const lng = prompt("Nhập kinh độ (longitude):", mapCenter.lng);
    if (lat && lng) setMarker({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <h2 className="text-3xl font-bold text-center text-pink-500 mb-8">
          Create New Shop
        </h2>
        <Formik
          initialValues={{
            business_name: "",
            business_address: "",
            phone_number: "",
            specialty: "",
            bio: "",
            is_active: true,
            longitude: 0,
            latitude: 0,
            image_url: "",
          }}
          validationSchema={ShopSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setLoading(true);
            setError("");
            try {
              let imageUrl = "";
              if (imageFile) {
                imageUrl = await uploadShopImage(imageFile, user?.id);
              }
              await createShop({
                ...values,
                user_id: user?.id,
                image_url: imageUrl,
                longitude: marker?.lng || 0,
                latitude: marker?.lat || 0,
              });
              alert("Shop created successfully!");
              resetForm();
              navigate("/marketplace");
            } catch (err) {
              setError("Failed to create shop. Please try again.");
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Upload ảnh shop */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Shop Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview("");
                    }
                  }}
                  className="block w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-full h-40 object-cover rounded-lg border"
                  />
                )}
              </div>
              {/* Các trường khác giữ nguyên */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Business Name
                </label>
                <Field
                  name="business_name"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter shop name"
                />
                <ErrorMessage
                  name="business_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Address
                </label>
                <Field
                  name="business_address"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter address"
                />
                <ErrorMessage
                  name="business_address"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Phone Number
                </label>
                <Field
                  name="phone_number"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter phone number"
                />
                <ErrorMessage
                  name="phone_number"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Specialty
                </label>
                <Field
                  name="specialty"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="e.g. Birthday Cakes, Wedding Cakes"
                />
                <ErrorMessage
                  name="specialty"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Bio
                </label>
                <Field
                  as="textarea"
                  name="bio"
                  className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px]"
                  placeholder="Describe your shop..."
                />
                <ErrorMessage
                  name="bio"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Chọn vị trí trên bản đồ */}
              <div>
                <label className="block text-pink-500 font-semibold mb-1 mb-2">
                  Shop Location (click map to set)
                </label>
                <div className="w-full h-64 rounded-lg overflow-hidden border mb-2 relative">
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
                <div className="text-gray-400 text-xs">
                  Nhấn vào bản đồ để nhập toạ độ (demo, có thể tích hợp Google
                  Maps API nâng cao hơn)
                </div>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors shadow-lg mt-4 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Shop"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateShop;
