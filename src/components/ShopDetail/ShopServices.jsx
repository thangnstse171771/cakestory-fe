import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ShopServices = ({
  services,
  isOwner,
  onEdit,
  onDelete,
  showMenu,
  setShowMenu,
  shopUserId, // Add shopUserId prop to identify which user's shop this is
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State chọn size cho từng sản phẩm
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeChange = (postId, value) => {
    setSelectedSizes((prev) => ({ ...prev, [postId]: value }));
  };

  const handleViewAll = () => {
    // If this is the current user's shop (My Shop), use user ID
    // Otherwise, get shopId from URL params
    if (isOwner && user) {
      navigate(`/marketplace/shop/${user.id}/all-cakes`);
    } else {
      // For regular shop visits, use the shopUserId or extract from URL
      const userIdToUse = shopUserId || window.location.pathname.split("/")[3];
      navigate(`/marketplace/shop/${userIdToUse}/all-cakes`);
    }
  };

  // Helper function to check if product is available based on expiry date
  const isProductAvailable = (expiryDate) => {
    if (!expiryDate) return true; // No expiry date means always available
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry >= today;
  };

  // Filter services based on visibility
  const visibleServices = services.filter((product) => {
    const postObj = product.Post || product.post || {};
    // If owner, show all products
    if (isOwner) return true;
    // If not owner, only show public products
    return postObj.is_public !== false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-2xl text-gray-800">
            Sản phẩm của chúng tôi
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Khám phá bộ sưu tập bánh tuyệt vời của chúng tôi
          </p>
        </div>
        <button
          onClick={handleViewAll}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition-all duration-200"
        >
          Xem Tất Cả
        </button>
      </div>
      {visibleServices && visibleServices.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleServices.slice(0, 3).map((product) => {
              const postObj = product.Post || product.post || {};
              const firstMedia =
                postObj.media && postObj.media.length > 0
                  ? postObj.media[0]
                  : null;
              const imageUrl =
                firstMedia &&
                firstMedia.image_url &&
                firstMedia.image_url !== "string"
                  ? firstMedia.image_url
                  : "/placeholder.svg";
              const cakeSizes = product.cakeSizes || [];
              const selectedSize =
                selectedSizes[product.post_id] || cakeSizes[0]?.size || "";
              const displayPrice =
                cakeSizes.length > 0
                  ? cakeSizes.find((s) => s.size === selectedSize)?.price ||
                    product.price ||
                    0
                  : product.price || 0;
              const sizeText =
                cakeSizes.length > 0 && selectedSize
                  ? ` (${selectedSize})`
                  : "";
              const available = isProductAvailable(product.expiry_date);

              return (
                <div
                  key={product.post_id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() =>
                    navigate(`/marketplace/product/${product.post_id}`)
                  }
                >
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={imageUrl}
                      alt={postObj.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Cake Tiers Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                        {product.tier || 1}{" "}
                        {(product.tier || 1) === 1 ? "Tầng" : "Tầng"}
                      </span>
                    </div>

                    {/* Public/Private Badge - only show for owner */}
                    {isOwner && (
                      <div
                        className="absolute top-3 left-3"
                        style={{ marginTop: "32px" }}
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                            postObj.is_public !== false
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                          }`}
                        >
                          {postObj.is_public !== false
                            ? "Công khai"
                            : "Riêng tư"}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 z-20">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm">
                        Đặt trước {product.required_time || 0} ngày
                      </span>
                    </div>

                    {/* Available/Expired Status Badge */}
                    <div className="absolute top-10 right-3">
                      {available ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                          Còn hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm">
                          Hết hạn
                        </span>
                      )}
                    </div>

                    {isOwner && (
                      <div className="absolute bottom-3 right-3 z-20">
                        <div className="relative">
                          <button
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 shadow-md transition-all duration-200 hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(
                                showMenu === product.post_id
                                  ? null
                                  : product.post_id
                              );
                            }}
                            aria-label="More options"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          {showMenu === product.post_id && (
                            <div className="absolute right-0 bottom-12 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden">
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(product);
                                  setShowMenu(null);
                                }}
                              >
                                <svg
                                  className="w-4 h-4 mr-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Chỉnh sửa
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(product);
                                  setShowMenu(null);
                                }}
                              >
                                <svg
                                  className="w-4 h-4 mr-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors line-clamp-2">
                      {postObj.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {postObj.description}
                    </p>

                    {/* Chọn size */}
                    {cakeSizes.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chọn kích cỡ bánh:
                        </label>
                        <div className="relative">
                          <select
                            value={selectedSize}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSizeChange(product.post_id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white cursor-pointer transition-all duration-200"
                          >
                            {cakeSizes.map((s) => (
                              <option key={s.size} value={s.size}>
                                {s.size}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">
                          {parseInt(displayPrice).toLocaleString()}{" "}
                          <span className="text-lg text-gray-600">VND</span>
                        </span>
                        {sizeText && (
                          <span className="text-sm text-blue-600 font-medium">
                            kích cỡ {sizeText.replace("(", "").replace(")", "")}
                          </span>
                        )}
                        {cakeSizes.length > 1 && (
                          <span className="text-xs text-gray-500 mt-1">
                            {cakeSizes.length} kích cỡ có sẵn
                          </span>
                        )}
                      </div>
                      {!isOwner && (
                        <div className="flex gap-2">
                          <button
                            className="group-hover:bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/marketplace/product/${product.post_id}`
                              );
                            }}
                          >
                            Xem Chi Tiết
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (available) {
                                navigate(
                                  `/order/customize/${product.shop_id}`,
                                  {
                                    state: {
                                      shopId: product.shop_id,
                                      product: {
                                        id: product.post_id,
                                        name: postObj.title,
                                        description: postObj.description,
                                        basePrice: displayPrice,
                                        image: imageUrl,
                                      },
                                      postDetails: postObj,
                                    },
                                  }
                                );
                              } else {
                                // Navigate to shop if product is expired
                                const userIdToUse =
                                  shopUserId ||
                                  window.location.pathname.split("/")[3];
                                navigate(`/marketplace/shop/${userIdToUse}`);
                              }
                            }}
                            className={`group text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                              available
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d={
                                    available
                                      ? "M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4-2L3 3m4 10v6a1 1 0 001 1h12a1 1 0 001-1v-6M7 13l-1.35-6.5M17 21v-2a4 4 0 00-8 0v2"
                                      : "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  }
                                />
                              </svg>
                              {available ? "Đặt Ngay" : "Liên Hệ"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Bắt đầu xây dựng bộ sưu tập bánh của bạn bằng cách tạo bài đăng đầu
            tiên trên thị trường. Chia sẻ những sáng tạo ngon miệng của bạn với
            khách hàng!
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopServices;
