import { Star, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "expired", label: "Expired" },
];

const ProductsList = ({ products = [], isOwnShop = false }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCustomize, setShowCustomize] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState(null);

  // Helper function to check if product is available based on expiry date
  const isProductAvailable = (expiryDate) => {
    if (!expiryDate) return true; // No expiry date means always available
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry >= today;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const post = item.Post || item.post || {};
      const shop = item.shop || {};

      // Filter out private products unless it's own shop
      if (!isOwnShop && post.is_public === false) {
        return false;
      }

      const available = isProductAvailable(item.expiry_date);

      const matchesSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.description?.toLowerCase().includes(search.toLowerCase()) ||
        shop.business_name?.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "available") matchesFilter = available;
      if (filter === "expired") matchesFilter = !available;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter, isOwnShop]);

  if (!products.length) {
    return (
      <div className="text-center text-gray-400 py-12">No products found.</div>
    );
  }

  return (
    <div>
      {/* Search & Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white rounded-xl blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-300 transition-all duration-300 hover:shadow-md">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search products, shop..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filter === f.id
                    ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg transform hover:scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((item) => {
          // Lấy post object đúng key
          const post = item.Post || item.post || {};
          const shop = item.shop || {};
          const firstMedia =
            post.media && post.media.length > 0 ? post.media[0] : null;
          const imageUrl =
            firstMedia &&
            firstMedia.image_url &&
            firstMedia.image_url !== "string"
              ? firstMedia.image_url
              : "/placeholder.svg";

          // Lấy giá thấp nhất từ tất cả các size thay vì size đầu tiên
          const cakeSizes = item.cakeSizes || [];
          const getMinPrice = (sizes) => {
            if (!sizes || sizes.length === 0) return item.price || 0;
            return Math.min(
              ...sizes.map((size) => parseFloat(size.price) || 0)
            );
          };
          const displayPrice = getMinPrice(cakeSizes);
          const hasMultipleSizes = cakeSizes.length > 1;
          const available = isProductAvailable(item.expiry_date);

          return (
            <div
              key={item.post_id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/marketplace/product/${item.post_id}`)}
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Cake Tiers Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                    {item.tier || 1} {(item.tier || 1) === 1 ? "Tier" : "Tiers"}
                  </span>
                </div>

                {/* Public/Private Badge - only show if it's own shop */}
                {isOwnShop && (
                  <div
                    className="absolute top-3 left-3 z-20"
                    style={{ marginTop: "32px" }}
                  >
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                        post.is_public !== false
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                          : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                      }`}
                    >
                      {post.is_public !== false ? "Public" : "Private"}
                    </span>
                  </div>
                )}

                {/* Available/Expired Badge */}
                {available ? (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                    Available
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                    Expired
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    {shop.business_name || "Unknown Shop"}
                  </p>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                      {displayPrice.toLocaleString()} VND
                    </span>
                    {hasMultipleSizes && (
                      <span className="text-xs text-gray-500 mt-1">
                        Starting from ({cakeSizes.length} sizes available)
                      </span>
                    )}
                    {!hasMultipleSizes && cakeSizes.length === 1 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {cakeSizes[0].size} size
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Exp:{" "}
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="group-hover:bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/marketplace/product/${item.post_id}`);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="relative overflow-hidden px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-400 text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to CustomizedOrderDetails with shop_id
                      const shopId = item.shop_id || item.shop?.id;
                      if (shopId) {
                        navigate(`/order/customize/${shopId}`, {
                          state: {
                            shopData: item.shop,
                            productData: item,
                          },
                        });
                      } else {
                        console.error("No shop_id found for this product");
                        // Fallback to old modal
                        setCustomizeProduct(item);
                        setShowCustomize(true);
                      }
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Add to Cart
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsList;
