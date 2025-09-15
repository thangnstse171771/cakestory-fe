import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
  MapPin,
  Phone,
  Clock,
  Eye,
  Search,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  fetchShopByUserId,
  fetchMarketplacePosts,
  deleteMarketplacePost,
} from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import CreateMarketplacePost from "./Marketplace/CreateMarketplacePost";
import { DeletePostPopup } from "../components/ShopDetail";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "available", label: "Còn hàng" },
  { id: "expired", label: "hết hạn" },
];

const AllShopCakes = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams(); // This is the user ID from URL
  const { user } = useAuth();
  const [cakes, setCakes] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showMenu, setShowMenu] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if this is the current user's shop (My Shop)
  const isOwner = user && userId === user.id.toString();

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch shop information
      const shopData = await fetchShopByUserId(userId);
      setShopInfo({
        id: shopData.shop.shop_id,
        name: shopData.shop.business_name,
        owner: shopData.shop.user?.username || "Chủ shop",
        avatar:
          shopData.shop.avatar_image ||
          shopData.shop.image_url ||
          "/placeholder.svg",
        rating: 4.8, // Mock rating - replace with real data if available
        followers: 1250, // Mock followers - replace with real data if available
        bio: shopData.shop.bio,
        phone_number: shopData.shop.phone_number,
        business_address: shopData.shop.business_address,
        business_hours: shopData.shop.business_hours,
        specialty: shopData.shop.specialty,
        background_image: shopData.shop.background_image,
        user_id: userId,
      });

      // Fetch all marketplace posts and filter by shop
      const postsData = await fetchMarketplacePosts();
      const shopPosts = (postsData.posts || []).filter(
        (post) => post.shop_id === shopData.shop.shop_id
      );

      setCakes(shopPosts);
    } catch (error) {
      console.error("Error fetching data:", error);
      setShopInfo(null);
      setCakes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (postId, value) => {
    setSelectedSizes((prev) => ({ ...prev, [postId]: value }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOrderCake = (cake) => {
    const shopId = cake.shop_id;
    if (shopId) {
      navigate(`/order/customize/${shopId}`, {
        state: {
          shopData: shopInfo,
          productData: cake,
        },
      });
    }
  };

  const handleViewProduct = (cake) => {
    navigate(`/marketplace/product/${cake.post_id}`);
  };

  const handleShopVisit = () => {
    navigate(`/marketplace/shop/${userId}`);
  };

  const handleEditProduct = (cake) => {
    // Set the product to be edited - modal will handle the editing
    setEditProduct(cake);
  };

  const handleDeleteProduct = (cake) => {
    // Set the product to be deleted - modal will handle the confirmation
    setDeleteProduct(cake);
  };

  // Helper functions
  const getImageUrl = (cake) => {
    const post = cake.post || {};
    const media = post.media || [];
    const firstMedia = media.length > 0 ? media[0] : null;
    return firstMedia?.image_url && firstMedia.image_url !== "string"
      ? firstMedia.image_url
      : "/placeholder.svg";
  };

  const getDisplayPrice = (cake) => {
    const cakeSizes = cake.cakeSizes || [];
    if (cakeSizes.length > 0) {
      // Get minimum price from all sizes
      return Math.min(...cakeSizes.map((s) => parseFloat(s.price) || 0));
    }
    return cake.price || 0;
  };

  const isProductAvailable = (expiryDate) => {
    if (!expiryDate) return true;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry >= today;
  };

  // Filter and search functionality
  const filteredCakes = useMemo(() => {
    return cakes.filter((cake) => {
      const postObj = cake.post || {};
      const available = isProductAvailable(cake.expiry_date);

      const matchesSearch =
        postObj.title?.toLowerCase().includes(search.toLowerCase()) ||
        postObj.description?.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "available") matchesFilter = available;
      if (filter === "expired") matchesFilter = !available;

      return matchesSearch && matchesFilter;
    });
  }, [cakes, search, filter]);

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
                  className="w-12 h-12 rounded-full border-2 border-rose-300 object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {shopInfo.name}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white rounded-xl blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-gray-300 transition-all duration-300 hover:shadow-md">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
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
                      ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg transform hover:scale-105"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCakes.map((cake) => {
            const postObj = cake.post || {};
            const imageUrl = getImageUrl(cake);
            const available = isProductAvailable(cake.expiry_date);
            const cakeSizes = cake.cakeSizes || [];
            const displayPrice = getDisplayPrice(cake);
            const hasMultipleSizes = cakeSizes.length > 1;

            return (
              <div
                key={cake.post_id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => handleViewProduct(cake)}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <img
                    src={imageUrl}
                    alt={postObj.title}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Cake Tiers Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                      {cake.tier || 1}{" "}
                      {(cake.tier || 1) === 1 ? "Tầng" : "Tầng"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-20">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm">
                    Đặt trước {cake.required_time || 0} ngày
                  </span>
                </div>

                  {/* Available/Expired Badge */}
                  {available ? (
                    <div className="absolute top-10 right-3 px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                      Còn hàng
                    </div>
                  ) : (
                    <div className="absolute top-10 right-3 px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full z-20">
                      Hết hạn
                    </div>
                  )}

                  {/* Three dots menu for owner */}
                  {isOwner && (
                    <div className="absolute bottom-3 right-3 z-20">
                      <div className="relative">
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 shadow-md transition-all duration-200 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(
                              showMenu === cake.post_id ? null : cake.post_id
                            );
                          }}
                          aria-label="More options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu === cake.post_id && (
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(cake);
                                setShowMenu(null);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-3" />
                              Chỉnh sửa
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(cake);
                                setShowMenu(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors mb-2 line-clamp-2">
                    {postObj.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {postObj.description &&
                    postObj.description.split(" ").length > 5
                      ? postObj.description.split(" ").slice(0, 5).join(" ") +
                        "..."
                      : postObj.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                        {displayPrice.toLocaleString()} VND
                      </span>
                      {hasMultipleSizes && (
                        <span className="text-xs text-gray-500 mt-1">
                          Từ ({cakeSizes.length} kích cỡ khả dụng)
                        </span>
                      )}
                      {!hasMultipleSizes && cakeSizes.length === 1 && (
                        <span className="text-xs text-gray-500 mt-1">
                          Kích cỡ {cakeSizes[0].size}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      HSD:{" "}
                      {cake.expiry_date
                        ? new Date(cake.expiry_date).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {isOwner ? (
                      <>
                        <button
                          className="group-hover:bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(cake);
                          }}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          className="relative overflow-hidden px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(cake);
                          }}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="group-hover:bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(cake);
                          }}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          className={`relative overflow-hidden px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 ${
                            available
                              ? "bg-gradient-to-r from-pink-500 to-pink-400"
                              : "bg-gradient-to-r from-blue-500 to-blue-400"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (available) {
                              handleOrderCake(cake);
                            } else {
                              // Navigate to shop if product is expired
                              handleShopVisit();
                            }
                          }}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {available ? "Đặt Ngay" : "Liên Hệ"}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCakes.length === 0 && (
          <div className="text-center py-12">
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
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {cakes.length === 0
                ? "Chưa có sản phẩm nào"
                : search
                ? "Không tìm thấy sản phẩm nào"
                : "Không có sản phẩm trong danh mục này"}
            </h3>
            <p className="text-gray-500">
              {cakes.length === 0
                ? "Shop này chưa có sản phẩm nào được đăng tải"
                : search
                ? `Không tìm thấy sản phẩm nào với từ khóa "${search}"`
                : "Thử thay đổi bộ lọc để xem các sản phẩm khác"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <CreateMarketplacePost
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onCreate={async (updatedPost) => {
            setEditProduct(null);
            if (updatedPost) {
              // Update the cakes list with the updated product
              setCakes((prev) =>
                prev.map((cake) =>
                  cake.post_id === updatedPost.post_id
                    ? { ...cake, post: updatedPost }
                    : cake
                )
              );
            }
          }}
          initialData={editProduct}
          isEdit={true}
        />
      )}

      {/* Delete Product Modal */}
      <DeletePostPopup
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onDelete={async () => {
          setDeleteLoading(true);
          try {
            await deleteMarketplacePost(deleteProduct.post_id);
            // Remove the deleted product from the cakes list
            setCakes((prev) =>
              prev.filter((cake) => cake.post_id !== deleteProduct.post_id)
            );
            setDeleteProduct(null);
          } catch (err) {
            alert("Xóa sản phẩm thất bại!");
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AllShopCakes;
