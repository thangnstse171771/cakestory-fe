import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllShops } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

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
              avatar: undefined, // Không có avatar trong API, có thể dùng placeholder
              image: undefined, // Không có image trong API, có thể dùng placeholder
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
  }, [user]);

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
          <div className="relative">
            <img
              src={shop.image || "/placeholder.svg"}
              alt={shop.name}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="flex flex-col flex-1 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div>
                <img
                  src={shop.avatar || "/placeholder.svg"}
                  alt={shop.name}
                  className="w-[70px] h-[70px] rounded-full"
                />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-800">
                  {shop.name}
                </h3>
                <p className="text-sm text-gray-500">{shop.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {shop.rating}
              </span>
              <span className="text-sm text-gray-500">({shop.reviews})</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {shop.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <button
              className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors mt-auto"
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
