import { Star, ShoppingCart } from "lucide-react";

const ProductsList = () => {

    const products = [
    {
      id: 1,
      name: "Chocolate Birthday Cake",
      price: 45.99,
      rating: 4.8,
      reviews: 124,
      image:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      baker: "Sweet Dreams Bakery",
    },
    {
      id: 2,
      name: "Vanilla Wedding Cake",
      price: 89.99,
      rating: 4.9,
      reviews: 89,
      image:
        "https://static01.nyt.com/images/2023/10/27/multimedia/27cakerex-plzm/27cakerex-plzm-superJumbo.jpg",
      baker: "Elite Cakes",
    },
    {
      id: 3,
      name: "Red Velvet Cupcakes",
      price: 24.99,
      rating: 4.7,
      reviews: 156,
      image:
        "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2009/4/5/1/IG1C17_30946_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1433541424559.webp",
      baker: "Cupcake Corner",
    },
    {
      id: 4,
      name: "Custom Design Cake",
      price: 125.99,
      rating: 5.0,
      reviews: 67,
      image:
        "https://flouringkitchen.com/wp-content/uploads/2023/07/BW1A4089-2.jpg",
      baker: "Artisan Cakes",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {/* <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-400" />
                </button> */}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800 text-left mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2 text-left">
              {product.baker}
            </p>

            <div className="flex items-center space-x-1 mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {product.rating}
              </span>
              <span className="text-sm text-gray-500">({product.reviews})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-pink-600">
                ${product.price}
              </span>
              <button className="bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;
