import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllShops } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const PLACEHOLDER_AVATAR = "/placeholder.svg";
const PLACEHOLDER_BG = "/placeholder-bg.svg";

const ShopsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const data = await fetchAllShops();
        setShops(
          (data.shops || [])
            .filter((shop) => !user || shop.user_id !== user.id)
            .map((shop) => ({
              id: shop.shop_id,
              user_id: shop.user_id,
              name: shop.business_name,
              location: shop.business_address,
              specialties: shop.specialty ? shop.specialty.split(",") : [],
              avatar:
                shop.avatar_image && shop.avatar_image !== ""
                  ? shop.avatar_image
                  : PLACEHOLDER_AVATAR,
              background:
                shop.background_image && shop.background_image !== ""
                  ? shop.background_image
                  : PLACEHOLDER_BG,
              phone_number: shop.phone_number,
              bio: shop.bio,
              business_hours: shop.business_hours,
              delivery_area: shop.delivery_area,
              rating: 5.0, // API chưa có rating, gán mặc định
              reviews: 0, // API chưa có reviews, gán mặc định
            }))
        );
      } catch (err) {
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []); // Only run once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shops.map((shop) => (
        <div
          key={shop.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="relative w-full h-36 md:h-44 bg-gray-100">
            <img
              src={shop.background}
              alt={shop.name + " background"}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
              <img
                src={shop.avatar}
                alt={shop.name + " avatar"}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                draggable={false}
              />
            </div>
          </div>
          <div className="flex flex-col flex-1 p-4 pt-12">
            <h3 className="font-semibold text-lg text-gray-800 text-center mb-1">
              {shop.name}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-2 line-clamp-2">
              {shop.bio}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {shop.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-600 mb-2">
              <div>
                <span className="font-semibold">Address:</span> {shop.location}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {shop.phone_number}
              </div>
              <div>
                <span className="font-semibold">Business Hours:</span>{" "}
                {shop.business_hours}
              </div>
              <div>
                <span className="font-semibold">Delivery Area:</span>{" "}
                {shop.delivery_area}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-1 mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {shop.rating}
              </span>
              <span className="text-sm text-gray-500">({shop.reviews})</span>
            </div>
            <button
              className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors mt-auto font-semibold shadow"
              onClick={() => navigate(`/marketplace/shop/${shop.user_id}`)}
            >
              View Shop
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopsList;
