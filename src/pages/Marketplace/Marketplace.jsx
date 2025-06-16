import { ShoppingCart, Star, Heart, Search } from "lucide-react";
import { useState } from "react";
import ProductsList from "./ProductsList";
import ShopsList from "./ShopsList";

const Marketplace = () => {
  const [view, setView] = useState("products"); // "products" or "shops"

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pink-600 mb-2 text-left">
            Marketplace
          </h1>
          <p className="text-gray-600">
            Discover amazing cakes from local bakers
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-xl border px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">Search marketplace</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setView("products")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "products"
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setView("shops")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "shops"
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Shops
        </button>
      </div>

      {view === "products" ? <ProductsList /> : <ShopsList />}
    </div>
  );
};

export default Marketplace;
