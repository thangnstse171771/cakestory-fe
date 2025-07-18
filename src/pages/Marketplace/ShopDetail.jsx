import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { fetchShopByUserId, updateShopByUserId } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const mockShop = {
  id: 1,
  avatar:
    "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
  name: "Sweet Delights Bakery",
  tagline: "Crafting memorable moments with delicious cakes",
  rating: 4.9,
  reviews: 500,
  since: 2018,
  location: "123 Bakery Street, Sweet City, SC 12345",
  businessHours: ["Mon-Sat: 9:00 AM - 7:00 PM", "Sun: 10:00 AM - 4:00 PM"],
  delivery: [
    "Available within 30 miles radius",
    "Free delivery on orders above $200",
  ],
  gallery: [
    {
      title: "Elegant Wedding Cake",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Birthday Celebration",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Chocolate Dream",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Floral Design",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Summer Berry",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Classic Vanilla",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
  ],
  services: [
    {
      title: "Wedding Cakes",
      desc: "Elegant custom wedding cakes for your special day",
      price: "$299-999",
      img: "https://via.placeholder.com/400x300?text=400x300",
    },
    {
      title: "Birthday Cakes",
      desc: "Personalized birthday cakes for all ages",
      price: "$89-299",
      img: "https://via.placeholder.com/400x300?text=400x300",
    },
  ],
};

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
  // Nếu propId không có thì fallback về useParams (dùng cho route cũ)
  let id = propId;
  if (!id) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useParams } = require("react-router-dom");
    id = useParams().id;
  }
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchShopByUserId(id);
        setShop({
          id: data.shop.shop_id,
          avatar: data.shop.image_url || mockShop.avatar,
          name: data.shop.business_name,
          tagline: mockShop.tagline,
          rating: 4.9,
          reviews: 500,
          since: 2018,
          location: data.shop.business_address,
          phone_number: data.shop.phone_number,
          specialties: data.shop.specialty
            ? data.shop.specialty.split(",")
            : [],
          bio: data.shop.bio,
          latitude: data.shop.latitude,
          longitude: data.shop.longitude,
          businessHours: mockShop.businessHours,
          delivery: mockShop.delivery,
          gallery: mockShop.gallery,
          services: mockShop.services,
        });
      } catch (err) {
        setShop(mockShop);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showUpdate]);

  if (loading || !shop) return <div>Loading...</div>;

  const isOwner = user && String(user.id) === String(id);

  return (
    <div>
      {/* Header */}
      <div className="bg-pink-100 rounded-xl p-6 flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-6">
          <img
            src={shop.avatar}
            alt="avatar"
            className="w-[80px] h-[80px] md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow"
          />
          <div className="flex-1 text-left">
            <h2 className="text-xl md:text-3xl font-bold mb-1">{shop.name}</h2>
            <div className="text-sm md:text-base text-gray-600 mb-2">
              {shop.tagline}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-700 mr-1">
                  {shop.rating}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">·</span>
                <span>{shop.reviews}+ Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">·</span>
                <span>Since {shop.since}</span>
              </div>
            </div>
          </div>
          {isOwner && (
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold ml-4"
              onClick={() => setShowUpdate(true)}
            >
              Edit Shop
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Location</div>
            <div className="text-gray-700 text-sm">{shop.location}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Business Hours</div>
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {shop.businessHours.join("\n")}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Delivery Area</div>
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {shop.delivery.join("\n")}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shop.gallery.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-200 rounded-lg h-40 flex items-center justify-center relative overflow-hidden"
            >
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <span className="relative z-10 text-white font-semibold text-center text-shadow-lg">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">Our Services</h3>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 h-8 rounded-md shadow-sm transition">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shop.services.map((service, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-lg overflow-hidden flex flex-col"
            >
              <div className="bg-gray-200 flex-1 flex items-center justify-center min-h-[180px]">
                <img
                  src={service.img}
                  alt={service.title}
                  className="object-cover w-full h-full opacity-60"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="font-semibold mb-1">{service.title}</div>
                <div className="text-sm text-gray-500 mb-2">{service.desc}</div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-pink-600 font-bold">
                    {service.price}
                  </span>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg text-sm">
                    Inquire Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <UpdateShopModal
        open={showUpdate}
        onClose={() => setShowUpdate(false)}
        shop={shop}
        userId={id}
        onUpdated={() => setShowUpdate(false)}
      />
    </div>
  );
};

export default ShopDetail;
