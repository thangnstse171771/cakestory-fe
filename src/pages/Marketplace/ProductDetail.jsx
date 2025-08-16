import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Users,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Calendar,
  Check,
  MessageCircle,
  Eye,
  ThumbsUp,
} from "lucide-react";
import axios from "../../api/axios";
import ProductDetailSkeleton from "../../components/ProductDetailSkeleton";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      // Gọi API lấy chi tiết sản phẩm theo endpoint đã cung cấp
      const response = await axios.get(`/marketplace-posts/${productId}`);
      const productData = response.data.post;
      setProduct(productData);

      // Chọn size có giá thấp nhất làm mặc định
      if (productData?.cakeSizes && productData.cakeSizes.length > 0) {
        const sortedSizes = [...productData.cakeSizes].sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        setSelectedSize(sortedSizes[0].size);
      }

      // Lấy sản phẩm liên quan từ cùng shop
      fetchRelatedProducts(productData.shop_id);
    } catch (error) {
      console.error("Error fetching product detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (shopId) => {
    try {
      // Giả sử có API lấy sản phẩm theo shop hoặc sử dụng marketplace posts với filter
      const response = await axios.get(`/marketplace-posts?shop_id=${shopId}`);
      setRelatedProducts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching related products:", error);
      // Fallback: lấy tất cả sản phẩm và filter trong frontend
      try {
        const allResponse = await axios.get("/marketplace-posts");
        const filtered = (allResponse.data.posts || []).filter(
          (p) => p.shop_id === shopId && p.post_id !== parseInt(productId)
        );
        setRelatedProducts(filtered.slice(0, 4));
      } catch (fallbackError) {
        console.error("Error fetching all products:", fallbackError);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const shopId = product.shop_id || product.shop?.shop_id;
    if (shopId) {
      navigate(`/order/customize/${shopId}`, {
        state: {
          shopData: product.shop,
          productData: product,
          selectedSize: selectedSize,
        },
      });
    }
  };

  const handleShopVisit = () => {
    navigate(`/marketplace/shop/${shop.user_id}`);
  };

  // Kiểm tra xem sản phẩm có Hết hàng không
  const isExpired = () => {
    if (!product.expiry_date) return false;
    const currentDate = new Date();
    const expiryDate = new Date(product.expiry_date);
    return currentDate > expiryDate;
  };

  // Kiểm tra trạng thái sản phẩm (còn hàng và chưa Hết hàng)
  const isProductAvailable = () => {
    return product.available && !isExpired();
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Quay lại Khu Mua Sắm
          </button>
        </div>
      </div>
    );
  }

  const post = product.post || {};
  const shop = product.shop || {};
  const media = post.media || [];
  const currentImage = media[selectedImageIndex] || media[0];
  const imageUrl = currentImage?.image_url || "/placeholder.svg";

  const cakeSizes = product.cakeSizes || [];
  const sortedCakeSizes = [...cakeSizes].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price)
  );

  const selectedSizePrice =
    sortedCakeSizes.find((s) => s.size === selectedSize)?.price ||
    product.price;
  const getMinPrice = (sizes) => {
    if (!sizes || sizes.length === 0) return 0;
    return Math.min(...sizes.map((size) => parseFloat(size.price) || 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-full transition-colors ${
                  isWishlisted
                    ? "bg-pink-100 text-pink-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Image Gallery Thumbnails */}
              {media.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {media.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-pink-500 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${post.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                    isProductAvailable()
                      ? "bg-green-500/90 text-white"
                      : isExpired()
                      ? "bg-orange-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {isProductAvailable()
                      ? "Còn hàng"
                      : isExpired()
                      ? "Hết hàng"
                      : "Hết hàng"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {parseInt(selectedSizePrice).toLocaleString()} VND
              </div>
              {selectedSize && (
                <div className="text-pink-600 font-medium">
                  Giá cho kích cỡ {selectedSize}
                </div>
              )}
              {sortedCakeSizes.length > 1 && (
                <div className="text-sm text-gray-500 mt-1">
                  Bắt Đầu từ {getMinPrice(sortedCakeSizes).toLocaleString()} VND
                </div>
              )}
            </div>

            {/* Size Selection */}
            {sortedCakeSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chọn Kích Cỡ
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sortedCakeSizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedSize === size.size
                          ? "border-pink-500 bg-pink-50 text-pink-700 shadow-lg"
                          : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-bold text-lg">{size.size}</div>
                      <div className="text-sm text-gray-600">
                        {parseInt(size.price).toLocaleString()} VND
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Ngày Hết hàng</div>
                    <div className="font-medium">
                      {product.expiry_date
                        ? new Date(product.expiry_date).toLocaleDateString()
                        : "Không xác định"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Ngày tạo</div>
                    <div className="font-medium">
                      {product.created_at
                        ? new Date(product.created_at).toLocaleDateString()
                        : "Không xác định"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isProductAvailable() ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Đặt Ngay
                    </div>
                  </button>

                  <button
                    onClick={handleShopVisit}
                    className="px-6 py-4 rounded-xl border-2 border-pink-500 text-pink-500 font-semibold hover:bg-pink-50 transition-all duration-300 flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Trò chuyện
                  </button>
                </>
              ) : (
                <button
                  onClick={handleShopVisit}
                  className="w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Liên Hệ
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đánh giá của khách hàng
          </h2>

          {/* Rating Summary */}
          <div className="flex items-center gap-8 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600">4.8</div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 5 ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">124 đánh giá</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          star === 5
                            ? 70
                            : star === 4
                            ? 20
                            : star === 3
                            ? 5
                            : star === 2
                            ? 3
                            : 2
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {star === 5
                      ? 87
                      : star === 4
                      ? 25
                      : star === 3
                      ? 6
                      : star === 2
                      ? 4
                      : 2}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-6">
            {[
              {
                name: "Nguyễn Thị Mai",
                rating: 5,
                comment:
                  "Bánh rất ngon, đúng như mong đợi. Shop phục vụ tận tình!",
                date: "2 days ago",
                avatar:
                  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64",
              },
              {
                name: "Trần Văn Nam",
                rating: 4,
                comment:
                  "Chất lượng tốt, giao hàng nhanh. Sẽ ủng hộ shop tiếp.",
                date: "1 week ago",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64",
              },
              {
                name: "Lê Thị Hoa",
                rating: 5,
                comment:
                  "Bánh đẹp và ngon, phù hợp cho tiệc sinh nhật. Highly recommended!",
                date: "2 weeks ago",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64",
              },
            ].map((review, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        {review.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Information */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin cửa hàng
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 shadow-lg">
                {shop.avatar_image ? (
                  <img
                    src={shop.avatar_image}
                    alt={shop.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {shop.business_name?.charAt(0) || "S"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {shop.business_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      (4.9 • 2.1k reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {shop.bio}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Address</div>
                      <div className="font-medium">{shop.business_address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Điện thoại</div>
                      <div className="font-medium">{shop.phone_number}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Giờ làm việc</div>
                      <div className="font-medium">{shop.business_hours}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Chuyên môn</div>
                      <div className="font-medium">{shop.specialty}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleShopVisit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Xem Cửa Hàng
                </button>
                <button
                  onClick={handleShopVisit}
                  className="px-6 py-4 rounded-xl border-2 border-pink-500 text-pink-500 font-semibold hover:bg-pink-50 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Trò chuyện
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More on Marketplace
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((item) => item.post_id !== product.post_id)
                .slice(0, 4)
                .map((item) => {
                  const itemPost = item.post || {};
                  const itemMedia =
                    itemPost.media && itemPost.media.length > 0
                      ? itemPost.media[0]
                      : null;
                  const itemImageUrl =
                    itemMedia?.image_url || "/placeholder.svg";
                  const itemSizes = item.cakeSizes || [];
                  const itemMinPrice =
                    itemSizes.length > 0
                      ? Math.min(
                          ...itemSizes.map((s) => parseFloat(s.price) || 0)
                        )
                      : item.price || 0;

                  // Kiểm tra xem item có Hết hàng không
                  const itemIsExpired = () => {
                    if (!item.expiry_date) return false;
                    const currentDate = new Date();
                    const expiryDate = new Date(item.expiry_date);
                    return currentDate > expiryDate;
                  };

                  const itemIsAvailable = () => {
                    return item.available && !itemIsExpired();
                  };

                  return (
                    <div
                      key={item.post_id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() =>
                        navigate(`/marketplace/product/${item.post_id}`)
                      }
                    >
                      <div className="relative">
                        <img
                          src={itemImageUrl}
                          alt={itemPost.title}
                          className="w-full h-48 object-cover"
                        />
                        <div
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                            itemIsAvailable()
                              ? "bg-green-500/90 text-white"
                              : itemIsExpired()
                              ? "bg-orange-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {itemIsAvailable()
                            ? "Còn hàng"
                            : itemIsExpired()
                            ? "Hết hàng"
                            : "Hết hàng"}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {itemPost.title}
                        </h3>
                        <div className="text-lg font-bold text-pink-600">
                          {itemMinPrice.toLocaleString()} VND
                        </div>
                        {itemSizes.length > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {itemSizes.length} kích cỡ có sẵn
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
