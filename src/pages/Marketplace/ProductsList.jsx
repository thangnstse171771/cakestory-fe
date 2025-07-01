import { Star, ShoppingCart, Search } from "lucide-react";
import React, { useState, useMemo } from "react";

function ProductDetailModal({ open, product, onClose }) {
  if (!open || !product) return null;
  const post = product.Post || {};
  const shop = product.shop || {};
  const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
  const imageUrl =
    firstMedia && firstMedia.image_url && firstMedia.image_url !== "string"
      ? firstMedia.image_url
      : "/placeholder.svg";
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full md:w-1/2 h-64 object-cover rounded-lg"
          />
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-bold text-pink-600 mb-2">
              {post.title}
            </h2>
            <div className="text-gray-500 mb-2">{shop.business_name}</div>
            <div className="mb-2 text-lg font-semibold text-pink-500">
              ${product.price}
            </div>
            <div className="mb-2 text-gray-700">{post.description}</div>
            <div className="text-xs text-gray-400 mb-2">
              Expiry:{" "}
              {product.expiry_date
                ? new Date(product.expiry_date).toLocaleDateString()
                : "-"}
            </div>
            <div className="flex gap-2 mt-auto">
              <button className="bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition">
                Add to Cart
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={onClose}
              >
                Close
              </button>
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

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
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1 flex items-center bg-white border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products, shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f.id
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((item) => {
          const post = item.Post || {};
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 text-left mb-1">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2 text-left">
                  {shop.business_name || "Unknown Shop"}
                </p>
                <div className="flex items-center space-x-1 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    ${item.price}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {item.available ? "Available" : "Out of stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Expiry:{" "}
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString()
                      : "-"}
                  </span>
                  <button
                    className="bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ProductDetailModal
        open={!!selected}
        product={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default ProductsList;
