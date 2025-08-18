import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllShops } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

// Add shimmer animation styles
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-12deg);
    }
    100% {
      transform: translateX(200%) skewX(-12deg);
    }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Insert styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = shimmerStyles;
  document.head.appendChild(styleSheet);
}

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
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Đang tải cửa hàng...
          </h3>
          <p className="text-gray-500">
            Chúng tôi đang tìm kiếm những cửa hàng tuyệt vời cho bạn
          </p>
        </div>

        {/* Skeleton Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Background image skeleton */}
              <div className="relative w-full h-36 md:h-44 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
                {/* Avatar skeleton */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-200 animate-pulse"></div>
                </div>
              </div>

              {/* Content skeleton */}
              <div className="pt-12 pb-6 px-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-32 h-5 bg-gray-200 rounded mx-auto animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Animation Bars */}
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-pink-300 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1.2s",
              }}
            ></div>
          ))}
        </div>
      </div>
    );
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
                <span className="font-semibold">Địa chỉ:</span> {shop.location}
              </div>
              <div>
                <span className="font-semibold">Điện thoại:</span>{" "}
                {shop.phone_number}
              </div>
              <div>
                <span className="font-semibold">Giờ làm việc:</span>{" "}
                {shop.business_hours}
              </div>
              <div>
                <span className="font-semibold">Khu vực giao hàng:</span>{" "}
                {shop.delivery_area}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-1 mb-3"></div>
            <button
              className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors mt-auto font-semibold shadow"
              onClick={() => navigate(`/marketplace/shop/${shop.user_id}`)}
            >
              Xem Cửa Hàng
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopsList;
