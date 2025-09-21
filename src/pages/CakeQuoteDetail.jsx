import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Package,
  Clock,
  User,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getCakeQuoteById, getShopQuotesForCakeQuote } from "../api/cakeOrder";
import { toast } from "react-hot-toast";

const CakeQuoteDetail = ({
  cakeQuoteId: propId = null,
  cakeQuote: propCakeQuote = null,
  compact = false,
}) => {
  const { id } = useParams();
  const cakeQuoteId = propId ?? id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cakeQuote, setCakeQuote] = useState(propCakeQuote || null);
  const [shopQuotes, setShopQuotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quotesPerPage] = useState(compact ? 3 : 5);
  const [loading, setLoading] = useState(!propCakeQuote);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCakeQuoteDetail();
  }, [cakeQuoteId, propCakeQuote]);

  const fetchCakeQuoteDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // If a prop cakeQuote was provided, use it and skip network fetch
      if (propCakeQuote) {
        setCakeQuote(propCakeQuote);
      } else if (cakeQuoteId) {
        // Fetch cake quote details
        const response = await getCakeQuoteById(cakeQuoteId);
        if (response.success) {
          setCakeQuote(response.data);
        } else {
          setError("Không thể tải chi tiết cake quote");
          return;
        }
      }

      // Fetch shop quotes for this cake quote (if we have an id)
      if (cakeQuoteId) {
        const shopQuotesResponse = await getShopQuotesForCakeQuote(cakeQuoteId);
        if (shopQuotesResponse.success) {
          const transformedShopQuotes = shopQuotesResponse.data.quotes.map(
            (shopQuote) => ({
              id: shopQuote.id,
              shop: {
                id: shopQuote.shop?.shop_id || 0,
                name: shopQuote.shop?.business_name || "Unknown Shop",
                avatar: shopQuote.shop?.avatar_image || "/placeholder-shop.jpg",
                address: shopQuote.shop?.business_address || "Unknown",
                phone: shopQuote.shop?.phone_number || "",
                rating: shopQuote.shop?.rating || 0,
              },
              price: shopQuote.quoted_price,
              preparationTime: `${shopQuote.preparation_time} giờ`,
              message: shopQuote.message,
              ingredients: shopQuote.ingredients_breakdown,
              status: shopQuote.status,
              created_at: shopQuote.created_at,
              accepted_at: shopQuote.accepted_at,
            })
          );
          setShopQuotes(transformedShopQuotes);
        }
      }
    } catch (err) {
      console.error("Error fetching cake quote detail:", err);

      // Enhanced error handling for different scenarios
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.message || "";

        if (status === 404) {
          setError("Không tìm thấy yêu cầu báo giá này");
        } else if (status === 403) {
          setError("Bạn không có quyền xem yêu cầu báo giá này");
        } else if (status === 401) {
          setError("Bạn cần đăng nhập để xem chi tiết");
        } else if (status >= 500) {
          setError("Lỗi server, vui lòng thử lại sau");
        } else {
          setError(errorMessage || "Có lỗi xảy ra khi tải dữ liệu");
        }
      } else if (err.request) {
        setError(
          "Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng"
        );
      } else {
        setError("Có lỗi xảy ra khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "expired":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "accepted":
        return "Đã chấp nhận";
      case "rejected":
        return "Đã từ chối";
      case "completed":
        return "Hoàn thành";
      case "active":
        return "Đang hoạt động";
      case "closed":
        return "Đã đóng";
      case "expired":
        return "Đã hết hạn";
      default:
        return status;
    }
  };

  // Pagination calculations
  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = shopQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(shopQuotes.length / quotesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to shop quotes section
    const element = document.getElementById("shop-quotes-section");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Loading component
  const LoadingSpinner = ({ size = "large" }) => (
    <div
      className={`animate-spin rounded-full border-b-2 border-indigo-500 mx-auto ${
        size === "large" ? "h-32 w-32" : "h-8 w-8"
      }`}
    ></div>
  );

  // Loading state
  if (loading) {
    if (compact) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center h-32">
            <LoadingSpinner size="small" />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Error state
  if (error || !cakeQuote) {
    if (compact) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Không tìm thấy
              </h3>
              <p className="text-gray-600 text-sm">
                {error || "Cake quote không tồn tại hoặc đã bị xóa"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Không tìm thấy
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Cake quote không tồn tại hoặc đã bị xóa"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compact mode: render only Design Info + Shop Quotes (for embedding)
  if (compact) {
    const cq = cakeQuote || {};
    const image = cq.imageDesign || cq.image || "/placeholder-cake.jpg";

    return (
      <div className="space-y-6">
        {/* Compact Design Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin thiết kế
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-1/3 flex-shrink-0">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={cq.title || "Cake design"}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-cake.jpg";
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="md:flex-1 space-y-3">
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Tiêu đề
                </span>
                <p className="font-semibold text-gray-800">
                  {cq.title || "Chưa có tiêu đề"}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-500 font-medium">Mô tả</span>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {cq.description || "Chưa có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Kích thước:</span>
                  <p className="text-gray-800 font-medium">
                    {cq.cake_size || "Chưa xác định"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Ngân sách:</span>
                  <p className="text-gray-800 font-medium">
                    {cq.budget_range || "Chưa xác định"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {cq.special_requirements && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700 block mb-1">
                Yêu cầu đặc biệt:
              </span>
              <p className="text-indigo-800 text-sm">
                {cq.special_requirements}
              </p>
            </div>
          )}
        </div>

        {/* Compact Shop Quotes */}
        <div
          id="shop-quotes-section"
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              Báo giá từ các tiệm ({shopQuotes.length})
            </h3>
          </div>

          {shopQuotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-3xl mb-3">🏪</div>
              <p className="text-gray-500">Chưa có tiệm bánh nào gửi báo giá</p>
              <p className="text-gray-400 text-sm mt-1">
                Hãy chờ các tiệm bánh gửi báo giá cho thiết kế của bạn
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {/* Shop Info Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={quote.shop?.avatar || "/placeholder-shop.jpg"}
                          alt={quote.shop?.name || "Shop"}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = "/placeholder-shop.jpg";
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {quote.shop?.name || "Unknown Shop"}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {quote.shop?.address || "Unknown location"}
                          </p>
                          {quote.shop?.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">
                                {quote.shop.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {getStatusText(quote.status)}
                      </span>
                    </div>

                    {/* Quote Details Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-2 rounded border">
                        <span className="text-xs text-gray-500">Giá báo</span>
                        <p className="font-semibold text-green-800 text-sm">
                          {formatCurrency(quote.price)}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-xs text-gray-500">Thời gian</span>
                        <p className="font-semibold text-blue-800 text-sm">
                          {quote.preparationTime || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-xs text-gray-500">
                          Ngày báo giá
                        </span>
                        <p className="font-semibold text-purple-800 text-sm">
                          {formatDate(quote.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {quote.message && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <span className="text-xs font-medium text-gray-600 block mb-1">
                          Tin nhắn từ tiệm:
                        </span>
                        <p className="text-gray-700 text-sm">{quote.message}</p>
                      </div>
                    )}

                    {/* Ingredients */}
                    {quote.ingredients && (
                      <div className="mt-2 p-3 bg-orange-50 rounded border border-orange-200">
                        <span className="text-xs font-medium text-orange-600 block mb-1">
                          Thành phần nguyên liệu:
                        </span>
                        <p className="text-orange-800 text-sm">
                          {quote.ingredients}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Full mode rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại trang trước
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chi tiết Cake Quote
          </h1>
          <p className="text-gray-600">ID: {cakeQuote.id}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Cake Design Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Thông tin thiết kế
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image */}
                <div>
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={
                        cakeQuote.imageDesign ||
                        cakeQuote.image ||
                        "/placeholder-cake.jpg"
                      }
                      alt={cakeQuote.title || "Cake design"}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-cake.jpg";
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Tiêu đề:
                    </span>
                    <p className="text-lg font-semibold text-gray-800">
                      {cakeQuote.title || "Chưa có tiêu đề"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Mô tả:
                    </span>
                    <p className="text-gray-800">
                      {cakeQuote.description || "Chưa có mô tả"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Kích thước:
                    </span>
                    <p className="text-gray-800">
                      {cakeQuote.cake_size || "Chưa xác định"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Ngân sách:
                    </span>
                    <p className="text-gray-800">
                      {cakeQuote.budget_range || "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {cakeQuote.special_requirements && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-sm font-medium text-indigo-700 block mb-2">
                    Yêu cầu đặc biệt:
                  </span>
                  <p className="text-indigo-800">
                    {cakeQuote.special_requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Shop Quotes */}
            <div
              id="shop-quotes-section"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                Báo giá từ các tiệm ({shopQuotes.length})
              </h2>

              {shopQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🏪</div>
                  <p className="text-gray-500 text-lg">
                    Chưa có tiệm bánh nào gửi báo giá
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Hãy chờ các tiệm bánh gửi báo giá cho thiết kế của bạn
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                quote.shop?.avatar || "/placeholder-shop.jpg"
                              }
                              alt={quote.shop?.name || "Shop"}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-shop.jpg";
                              }}
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {quote.shop?.name || "Unknown Shop"}
                              </h4>
                              <p className="text-gray-500 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {quote.shop?.address || "Unknown location"}
                              </p>
                              {quote.shop?.rating > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">
                                    {quote.shop.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              quote.status
                            )}`}
                          >
                            {getStatusText(quote.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="text-sm text-green-600 font-medium">
                              Giá báo
                            </span>
                            <p className="text-xl font-bold text-green-800">
                              {formatCurrency(quote.price)}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-sm text-blue-600 font-medium">
                              Thời gian
                            </span>
                            <p className="text-lg font-bold text-blue-800">
                              {quote.preparationTime || "N/A"}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="text-sm text-purple-600 font-medium">
                              Ngày báo giá
                            </span>
                            <p className="text-sm font-medium text-purple-800">
                              {formatDate(quote.created_at)}
                            </p>
                          </div>
                        </div>

                        {quote.message && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <span className="text-sm font-medium text-gray-600 block mb-2">
                              Tin nhắn từ tiệm:
                            </span>
                            <p className="text-gray-800">{quote.message}</p>
                          </div>
                        )}

                        {quote.ingredients && (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <span className="text-sm font-medium text-orange-600 block mb-2">
                              Thành phần nguyên liệu:
                            </span>
                            <p className="text-orange-800">
                              {quote.ingredients}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                              currentPage === page
                                ? "bg-indigo-600 text-white shadow-md"
                                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Dates */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin trạng thái
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Trạng thái:</span>
                  <span
                    className={`block mt-1 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(
                      cakeQuote.status
                    )}`}
                  >
                    {getStatusText(cakeQuote.status)}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày tạo:
                  </span>
                  <p className="text-gray-800 font-medium">
                    {formatDate(cakeQuote.created_at)}
                  </p>
                </div>

                {cakeQuote.expires_at && (
                  <div>
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Hạn chót:
                    </span>
                    <p className="text-gray-800 font-medium">
                      {formatDate(cakeQuote.expires_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            {cakeQuote.user && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Thông tin người tạo
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {cakeQuote.user.username ||
                        cakeQuote.user.email ||
                        "Anonymous User"}
                    </p>
                    {cakeQuote.user.email && (
                      <p className="text-sm text-gray-500">
                        {cakeQuote.user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!compact && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="space-y-3">
                  {navigator.share && (
                    <button
                      onClick={() => {
                        navigator
                          .share({
                            title: `Cake Quote: ${cakeQuote.title}`,
                            text: `Chi tiết báo giá bánh: ${cakeQuote.title}`,
                            url: window.location.href,
                          })
                          .catch(console.error);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Chia sẻ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeQuoteDetail;
