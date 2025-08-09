import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Users,
  ChefHat,
} from "lucide-react";

const AllShopCakes = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const [cakes, setCakes] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Mock data - thay thế bằng API call thực tế
    const mockShopInfo = {
      id: shopId || "1",
      name: "Sweet Dreams Bakery",
      owner: "Nguyễn Minh An",
      avatar: "/public/vite.svg",
      rating: 4.8,
      followers: 1250,
    };

    const mockCakes = [
      {
        id: 1,
        name: "Bánh Kem Sinh Nhật Hoa Hồng",
        image: "/public/vite.svg",
        price: "350,000 VND",
        rating: 4.9,
        reviews: 45,
        category: "birthday",
        description: "Bánh kem tươi với trang trí hoa hồng đẹp mắt",
      },
      {
        id: 2,
        name: "Bánh Cupcake Chocolate",
        image: "/public/vite.svg",
        price: "80,000 VND",
        rating: 4.7,
        reviews: 32,
        category: "cupcake",
        description: "Cupcake chocolate thơm ngon với kem bơ",
      },
      {
        id: 3,
        name: "Bánh Tiramisu Đặc Biệt",
        image: "/public/vite.svg",
        price: "420,000 VND",
        rating: 4.8,
        reviews: 28,
        category: "special",
        description: "Tiramisu nguyên bản từ Italy",
      },
      {
        id: 4,
        name: "Bánh Macaron Pháp",
        image: "/public/vite.svg",
        price: "150,000 VND",
        rating: 4.6,
        reviews: 67,
        category: "macaron",
        description: "Macaron nhiều màu sắc với vị tự nhiên",
      },
      {
        id: 5,
        name: "Bánh Cheesecake Dâu",
        image: "/public/vite.svg",
        price: "280,000 VND",
        rating: 4.9,
        reviews: 53,
        category: "cheesecake",
        description: "Cheesecake mềm mịn với dâu tây tươi",
      },
      {
        id: 6,
        name: "Bánh Red Velvet",
        image: "/public/vite.svg",
        price: "320,000 VND",
        rating: 4.7,
        reviews: 41,
        category: "special",
        description: "Red Velvet với kem cheese truyền thống",
      },
    ];

    setShopInfo(mockShopInfo);
    setCakes(mockCakes);
    setLoading(false);
  }, [shopId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOrderCake = (cake) => {
    // Logic đặt bánh - chuyển đến trang order hoặc mở modal
    console.log("Đặt bánh:", cake);
    // navigate(`/order/${cake.id}`);
  };

  const handleAddToCart = (cake) => {
    // Logic thêm vào giỏ hàng
    console.log("Thêm vào giỏ hàng:", cake);
  };

  const filteredCakes =
    filter === "all" ? cakes : cakes.filter((cake) => cake.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b-2 border-rose-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>

            {shopInfo && (
              <div className="flex items-center gap-4">
                <img
                  src={shopInfo.avatar}
                  alt={shopInfo.name}
                  className="w-12 h-12 rounded-full border-2 border-rose-300"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {shopInfo.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{shopInfo.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-rose-500" />
                      <span>{shopInfo.followers} followers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: "all", label: "Tất cả", icon: ChefHat },
            { key: "birthday", label: "Sinh nhật", icon: Heart },
            { key: "cupcake", label: "Cupcake", icon: ShoppingCart },
            { key: "special", label: "Đặc biệt", icon: Star },
            { key: "macaron", label: "Macaron", icon: Heart },
            { key: "cheesecake", label: "Cheesecake", icon: Heart },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                filter === key
                  ? "bg-rose-500 text-white shadow-lg"
                  : "bg-white text-rose-600 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCakes.map((cake) => (
            <div
              key={cake.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-100 hover:border-rose-300"
            >
              <div className="relative">
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors duration-200">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                  {cake.name}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {cake.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-rose-600">
                    {cake.price}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {cake.rating} ({cake.reviews})
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(cake)}
                    className="flex-1 px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4 inline mr-1" />
                    Giỏ hàng
                  </button>
                  <button
                    onClick={() => handleOrderCake(cake)}
                    className="flex-1 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCakes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Không tìm thấy bánh nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc để xem các sản phẩm khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllShopCakes;
