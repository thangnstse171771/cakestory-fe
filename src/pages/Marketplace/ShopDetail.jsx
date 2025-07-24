import React, { useEffect, useState } from "react";
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
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-xl p-6 flex flex-col gap-4 mb-6 shadow-lg border border-pink-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={shop.avatar || "/placeholder.svg"}
            alt="avatar"
            className="w-[100px] h-[100px] md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1 text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 text-pink-600">
              {shop.name}
            </h2>
            <div className="text-gray-600 text-base mb-2 italic">
              {shop.bio}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                {shop.phone_number}
              </div>
              <div>
                <span className="font-semibold">Specialty:</span>{" "}
                {shop.specialty}
              </div>
              <div>
                <span className="font-semibold">Active:</span>{" "}
                {shop.is_active ? "Yes" : "No"}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Business Hours:</span>{" "}
                {shop.business_hours}
              </div>
              <div>
                <span className="font-semibold">Delivery Area:</span>{" "}
                {shop.delivery_area}
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="flex flex-col gap-2 ml-0 md:ml-4">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow"
                onClick={() => setShowUpdate(true)}
              >
                Edit Shop
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
                onClick={() => setShowCreate(true)}
              >
                <span className="text-lg font-bold">+</span>
                Create Marketplace Post
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px] border border-pink-100">
            <div className="text-sm font-semibold mb-1 text-pink-500">
              Address
            </div>
            <div className="text-gray-700 text-sm">{shop.business_address}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px] border border-pink-100">
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
          <h3 className="font-bold text-xl">Our Cake Gallery</h3>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 h-8 rounded-md shadow-sm transition">
            Show all
          </button>
        </div>
        {shop.gallery && shop.gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shop.gallery.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-200 rounded-lg h-40 flex items-center justify-center relative overflow-hidden group"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                />
                <span className="relative z-10 text-white font-semibold text-center text-shadow-lg">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12 text-lg italic bg-white rounded-xl shadow border border-dashed border-pink-200">
            No cake images yet. Add some beautiful cakes to your gallery!
          </div>
        )}
      </div>

      {/* Our Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">Our Services</h3>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 h-8 rounded-md shadow-sm transition">
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
                  className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col hover:shadow-lg transition-shadow group relative"
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={postObj.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    {isOwner && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="relative inline-block text-left">
                          <button
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 shadow"
                            onClick={e => {
                              e.stopPropagation();
                              setShowMenu(showMenu === product.post_id ? null : product.post_id);
                            }}
                            aria-label="More options"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                          {showMenu === product.post_id && (
                            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30 animate-fade-in">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 rounded-t-lg"
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditProduct(product);
                                  setShowMenu(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-b-lg"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeleteProduct(product);
                                  setShowMenu(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="font-bold text-lg text-pink-600 mb-1 truncate">
                      {postObj.title}
                    </div>
                    <div className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {postObj.description}
                    </div>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="text-pink-600 font-bold text-xl">
                        ${product.price}
                      </span>
                      {!isOwner && (
                        <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow transition">
                          Inquire Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12 text-lg italic bg-white rounded-xl shadow border border-dashed border-pink-200">
            No products yet. Create your first marketplace post to start selling!
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
            setShop((prev) => ({ ...prev, services: [...prev.services, newPost] }));
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
              setProducts((prev) => prev.map((p) => p.post_id === updatedPost.post_id ? updatedPost : p));
              setShop((prev) => ({
                ...prev,
                services: prev.services.map((p) => p.post_id === updatedPost.post_id ? updatedPost : p),
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
            setProducts((prev) => prev.filter((p) => p.post_id !== deleteProduct.post_id));
            setShop((prev) => ({
              ...prev,
              services: prev.services.filter((p) => p.post_id !== deleteProduct.post_id),
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
