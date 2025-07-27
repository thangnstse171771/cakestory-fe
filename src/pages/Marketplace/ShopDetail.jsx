import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopAnalysticSummary from "./ShopAnalysticSummary";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  fetchShopByUserId,
  updateShopByUserId,
  fetchMarketplacePosts,
} from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CreateMarketplacePost from "./CreateMarketplacePost";
import DeletePostPopup from "../MyPost/DeletePostPopup";
import { updateMarketplacePost, deleteMarketplacePost } from "../../api/axios";

const UpdateShopSchema = Yup.object().shape({
  business_name: Yup.string().required("Business name is required"),
  business_address: Yup.string().required("Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  specialty: Yup.string().required("Specialty is required"),
  bio: Yup.string().required("Bio is required"),
});

function UpdateShopModal({ open, onClose, shop, userId, onUpdated }) {
  const [imagePreview, setImagePreview] = useState(shop.avatar || "");
  const [imageFile, setImageFile] = useState(null);
  const [marker, setMarker] = useState({
    lat: shop.latitude || 21.028511,
    lng: shop.longitude || 105.804817,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  // Upload ảnh shop lên Firebase
  const uploadShopImage = async (file, userId) => {
    if (!file) return shop.avatar || "";
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
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl relative max-h-screen overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-pink-500 mb-6 text-center">
          Update Shop
        </h2>
        <Formik
          initialValues={{
            business_name: shop.name || "",
            business_address: shop.location || "",
            phone_number: shop.phone_number || "",
            specialty: shop.specialties ? shop.specialties.join(", ") : "",
            bio: shop.bio || "",
            is_active: true,
            longitude: marker.lng,
            latitude: marker.lat,
          }}
          validationSchema={UpdateShopSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);
            setError("");
            try {
              let imageUrl = shop.avatar;
              if (imageFile) {
                imageUrl = await uploadShopImage(imageFile, userId);
              }
              await updateShopByUserId(userId, {
                ...values,
                image_url: imageUrl,
                longitude: marker.lng,
                latitude: marker.lat,
              });
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
            <Form className="space-y-5">
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
                    src={`https://maps.google.com/maps?q=${marker.lat},${marker.lng}&z=15&output=embed`}
                    allowFullScreen
                    onClick={handleMapClick}
                  ></iframe>
                  <div className="absolute bottom-2 left-2 bg-white/80 text-pink-500 px-3 py-1 rounded-full text-xs shadow">
                    Lat: {marker.lat}, Lng: {marker.lng}
                  </div>
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
                {loading ? "Updating..." : "Update Shop"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

const ShopDetail = ({ id: propId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const id = propId || params.id;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchShopByUserId(id);
        // Lấy sản phẩm của shop này
        const postsData = await fetchMarketplacePosts();
        const shopProducts = (postsData.posts || []).filter(
          (p) => p.shop_id === data.shop.shop_id
        );
        setShop({
          id: data.shop.shop_id,
          avatar: data.shop.avatar_image || data.shop.image_url || "",
          name: data.shop.business_name,
          bio: data.shop.bio,
          phone_number: data.shop.phone_number,
          specialty: data.shop.specialty,
          business_hours: data.shop.business_hours,
          delivery_area: data.shop.delivery_area,
          latitude: data.shop.latitude,
          longitude: data.shop.longitude,
          is_active: data.shop.is_active,
          background_image: data.shop.background_image,
          user: data.shop.user,
          services: shopProducts,
        });
        setProducts(shopProducts);
      } catch (err) {
        setShop(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Only run once on mount

  if (loading || !shop) return <div>Loading...</div>;

  const isOwner = user && String(user.id) === String(shop.user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
            <img
              src={shop.avatar || "/placeholder.svg"}
              alt="avatar"
              className="relative w-[120px] h-[120px] md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition duration-300"
            />
          </div>
          <div className="flex-1 text-left space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                {shop.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {shop.bio}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg
                  className="w-5 h-5"
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
                <span>{shop.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span>{shop.specialty}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg
                  className="w-5 h-5"
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
                <span>{shop.business_hours}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg
                  className="w-5 h-5"
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
                <span>{shop.delivery_area}</span>
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="flex flex-col gap-3 ml-0 md:ml-6">
              <button
                className="group relative px-6 py-3 overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowUpdate(true)}
              >
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-pink-200 to-purple-200 transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="font-semibold">Edit Shop</span>
                </div>
              </button>
              <button
                className="group relative px-6 py-3 overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowCreate(true)}
              >
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-pink-200 to-purple-200 transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-semibold">Create Post</span>
                </div>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4 flex-1 min-w-[220px] border border-pink-100 hover:shadow-md transition-all duration-300">
            <div className="text-sm font-semibold mb-1 text-pink-500">
              Address
            </div>
            <div className="text-gray-700 text-sm">{shop.business_address}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 flex-1 min-w-[220px] border border-pink-100 hover:shadow-md transition-all duration-300">
            <div className="text-sm font-semibold mb-1 text-pink-500">
              Location (Lat, Lng)
            </div>
            <div className="text-gray-700 text-sm">
              {shop.latitude}, {shop.longitude}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl text-pink-500">Our Cake Gallery</h3>
          <button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-6 h-8 rounded-lg shadow transition">
            Show all
          </button>
        </div>
        {shop.gallery && shop.gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {shop.gallery.map((item, idx) => (
              <div
                key={idx}
                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center px-4">
                    <h3 className="text-white font-semibold text-xl mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {item.title}
                    </h3>
                    <div className="w-12 h-1 bg-white mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-white rounded-xl py-16 text-center">
            <div className="absolute inset-0 bg-grid-gray-100 opacity-[0.2]"></div>
            <div className="relative">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">
                No cake images yet. Add some beautiful cakes to your gallery!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Shop Analytics Summary + Button */}
      {isOwner && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-pink-500">Phân tích Shop</h3>
            <button
              onClick={() => navigate("/marketplace/shop-analytics")}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
              style={{ boxShadow: "0 2px 8px 0 #f9a8d4" }}
            >
              <span role="img" aria-label="analytics">
                📊
              </span>
              Xem chi tiết phân tích
            </button>
          </div>
          <ShopAnalysticSummary />
        </div>
      )}

      {/* Our Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl text-pink-500">Our Services</h3>
          <button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-6 h-8 rounded-lg shadow transition">
            Show all
          </button>
        </div>
        {shop.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shop.services.map((product, idx) => {
              // Lấy post object đúng key
              const postObj = product.Post || product.post || {};
              const firstMedia =
                postObj.media && postObj.media.length > 0
                  ? postObj.media[0]
                  : null;
              const imageUrl =
                firstMedia &&
                firstMedia.image_url &&
                firstMedia.image_url !== "string"
                  ? firstMedia.image_url
                  : "/placeholder.svg";
              return (
                <div
                  key={product.post_id}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative overflow-hidden aspect-w-16 aspect-h-10">
                    <img
                      src={imageUrl}
                      alt={postObj.title}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {isOwner && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="relative">
                          <button
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 shadow-lg transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(
                                showMenu === product.post_id
                                  ? null
                                  : product.post_id
                              );
                            }}
                            aria-label="More options"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          {showMenu === product.post_id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl z-30 transform origin-top-right transition-all duration-200 ease-out">
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 rounded-t-xl transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditProduct(product);
                                  setShowMenu(null);
                                }}
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-b-xl transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteProduct(product);
                                  setShowMenu(null);
                                }}
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                      {postObj.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 group-hover:text-gray-600">
                      {postObj.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                        ${product.price}
                      </span>
                      {!isOwner && (
                        <button className="group relative px-5 py-2.5 rounded-lg overflow-hidden bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <span className="relative z-10">Inquire Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12 text-lg italic bg-white/80 backdrop-blur-sm rounded-xl shadow border border-dashed border-pink-200">
            No products yet. Create your first marketplace post to start
            selling!
          </div>
        )}
      </div>
      <UpdateShopModal
        open={showUpdate}
        onClose={() => setShowUpdate(false)}
        shop={shop}
        userId={id}
        onUpdated={() => setShowUpdate(false)}
      />
      <CreateMarketplacePost
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (newPost) => {
          setShowCreate(false);
          if (newPost) {
            setProducts((prev) => [...prev, newPost]);
            setShop((prev) => ({
              ...prev,
              services: [...prev.services, newPost],
            }));
          }
        }}
      />
      {/* Popup sửa sản phẩm */}
      {editProduct && (
        <CreateMarketplacePost
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onCreate={async (updatedPost) => {
            setEditProduct(null);
            if (updatedPost) {
              setProducts((prev) =>
                prev.map((p) =>
                  p.post_id === updatedPost.post_id ? updatedPost : p
                )
              );
              setShop((prev) => ({
                ...prev,
                services: prev.services.map((p) =>
                  p.post_id === updatedPost.post_id ? updatedPost : p
                ),
              }));
            }
          }}
          initialData={editProduct}
          isEdit={true}
        />
      )}
      {/* Popup xác nhận xóa */}
      <DeletePostPopup
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onDelete={async () => {
          setDeleteLoading(true);
          try {
            await deleteMarketplacePost(deleteProduct.post_id);
            setProducts((prev) =>
              prev.filter((p) => p.post_id !== deleteProduct.post_id)
            );
            setShop((prev) => ({
              ...prev,
              services: prev.services.filter(
                (p) => p.post_id !== deleteProduct.post_id
              ),
            }));
            setDeleteProduct(null);
          } catch (err) {
            alert("Xóa sản phẩm thất bại!");
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ShopDetail;
