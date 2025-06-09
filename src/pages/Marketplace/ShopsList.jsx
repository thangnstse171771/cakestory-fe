import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopsList = () => {
  const navigate = useNavigate();
  const shops = [
    {
      id: 1,
      avatar:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      name: "Sweet Dreams Bakery",
      rating: 4.8,
      reviews: 124,
      image:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      location: "Downtown",
      specialties: ["Birthday Cakes", "Wedding Cakes", "Cupcakes"],
    },
    {
      id: 2,
      avatar:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      name: "Elite Cakes",
      rating: 4.9,
      reviews: 89,
      image:
        "https://static01.nyt.com/images/2023/10/27/multimedia/27cakerex-plzm/27cakerex-plzm-superJumbo.jpg",
      location: "Westside",
      specialties: ["Wedding Cakes", "Custom Designs"],
    },
    {
      id: 3,
      avatar:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      name: "Cupcake Corner",
      rating: 4.7,
      reviews: 156,
      image:
        "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2009/4/5/1/IG1C17_30946_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1433541424559.webp",
      location: "Eastside",
      specialties: ["Cupcakes", "Cookies"],
    },
    {
      id: 4,
      avatar:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      name: "Artisan Cakes",
      rating: 5.0,
      reviews: 67,
      image:
        "https://flouringkitchen.com/wp-content/uploads/2023/07/BW1A4089-2.jpg",
      location: "Northside",
      specialties: ["Custom Designs", "Wedding Cakes"],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shops.map((shop) => (
        <div
          key={shop.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="relative">
            <img
              src={shop.image}
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
              onClick={() => navigate(`/marketplace/shop/${shop.id}`)}
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
