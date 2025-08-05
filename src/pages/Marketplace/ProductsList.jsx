import {
  Star,
  ShoppingCart,
  Search,
  X,
  Clock,
  Calendar,
  CheckCircle,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CustomizeModal from "../Cart/CustomizedOrderForm";

function ProductDetailModal({ isOpen, product, onClose }) {
  if (!isOpen || !product) return null;

  const post = product.Post || product.post || {};
  const shop = product.shop || {};
  const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
  const imageUrl =
    firstMedia && firstMedia.image_url && firstMedia.image_url !== "string"
      ? firstMedia.image_url
      : "/placeholder.svg";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"></div>

        <div
          className="relative inline-block w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative md:w-1/2">
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {post.title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center mt-4 space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-500"
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
                  <div>
                    <div className="text-sm text-gray-600">Shop</div>
                    <div className="font-medium text-gray-900">
                      {shop.business_name || shop.name || "Unknown Shop"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Price and Status */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    ${product.price}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      product.available
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.available ? "Available" : "Out of stock"}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Expiry Date</div>
                      <div className="font-medium">
                        {product.expiry_date
                          ? new Date(product.expiry_date).toLocaleDateString()
                          : "Not specified"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Created At</div>
                      <div className="font-medium">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                    Add to Cart
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "expired", label: "Expired" },
];

const ProductsList = ({ products = [] }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const post = item.Post || {};
      const shop = item.shop || {};
      const matchesSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.description?.toLowerCase().includes(search.toLowerCase()) ||
        shop.business_name?.toLowerCase().includes(search.toLowerCase());
      let matchesFilter = true;
      if (filter === "available") matchesFilter = item.available;
      if (filter === "expired") matchesFilter = !item.available;
      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  if (!products.length) {
    return (
      <div className="text-center text-gray-400 py-12">No products found.</div>
    );
  }

  return (
    <div>
      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

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
          return (
            <div
              key={item.post_id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProduct(item)}
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {item.available ? (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                    Available
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-gray-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                    Out of stock
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
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                      ${item.price}
                    </span>
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
                      setSelectedProduct(item);
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
                      <ShoppingCart className="w-4 h-4" />
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
      {/* Customize Modal - render at root to avoid multiple modals */}
      <CustomizeModal
        isOpen={showCustomize}
        product={
          customizeProduct && {
            ...customizeProduct,
            basePrice: customizeProduct.price || 200000,
            image:
              (customizeProduct.Post &&
                customizeProduct.Post.media &&
                customizeProduct.Post.media[0]?.image_url) ||
              customizeProduct.image ||
              "/placeholder.svg",
            name:
              (customizeProduct.Post && customizeProduct.Post.title) ||
              customizeProduct.name ||
              "Bánh kem",
          }
        }
        onClose={() => setShowCustomize(false)}
        onConfirm={() => setShowCustomize(false)}
      />
    </div>
  );
};

export default ProductsList;
