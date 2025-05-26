import { ShoppingCart, Star, Heart } from "lucide-react";

const Marketplace = () => {
  const products = [
    {
      id: 1,
      name: "Chocolate Birthday Cake",
      price: 45.99,
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg?height=200&width=200",
      baker: "Sweet Dreams Bakery",
    },
    {
      id: 2,
      name: "Vanilla Wedding Cake",
      price: 89.99,
      rating: 4.9,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=200",
      baker: "Elite Cakes",
    },
    {
      id: 3,
      name: "Red Velvet Cupcakes",
      price: 24.99,
      rating: 4.7,
      reviews: 156,
      image: "/placeholder.svg?height=200&width=200",
      baker: "Cupcake Corner",
    },
    {
      id: 4,
      name: "Custom Design Cake",
      price: 125.99,
      rating: 5.0,
      reviews: 67,
      image: "/placeholder.svg?height=200&width=200",
      baker: "Artisan Cakes",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-600 mb-2">Marketplace</h1>
        <p className="text-gray-600">
          Discover amazing cakes from local bakers
        </p>
      </div>

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
              <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                <Heart className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{product.baker}</p>

              <div className="flex items-center space-x-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {product.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviews})
                </span>
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
    </div>
  );
};

export default Marketplace;
