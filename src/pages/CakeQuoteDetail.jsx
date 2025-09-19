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

const CakeQuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cakeQuote, setCakeQuote] = useState(null);
  const [shopQuotes, setShopQuotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quotesPerPage] = useState(5); // Show 5 quotes per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCakeQuoteDetail();
  }, [id]);

  const fetchCakeQuoteDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cake quote details
      const response = await getCakeQuoteById(id);
      if (response.success) {
        setCakeQuote(response.data);

        // Fetch shop quotes for this cake quote
        const shopQuotesResponse = await getShopQuotesForCakeQuote(id);
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
      } else {
        setError("Không thể tải chi tiết cake quote");
      }
    } catch (err) {
      console.error("Error fetching cake quote detail:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    document.getElementById("shop-quotes-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !cakeQuote) {
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
                      src={cakeQuote.imageDesign || "/placeholder-cake.jpg"}
                      alt={cakeQuote.title}
                      className="w-full h-64 object-cover"
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
                      {cakeQuote.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Mô tả:
                    </span>
                    <p className="text-gray-800">{cakeQuote.description}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Kích thước:
                    </span>
                    <p className="text-gray-800">{cakeQuote.cake_size}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Ngân sách:
                    </span>
                    <p className="text-gray-800">{cakeQuote.budget_range}</p>
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
                              src={quote.shop.avatar}
                              alt={quote.shop.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {quote.shop.name}
                              </h4>
                              <p className="text-gray-500 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {quote.shop.address}
                              </p>
                              {quote.shop.rating > 0 && (
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
                            {quote.status === "pending" && "Đang chờ"}
                            {quote.status === "accepted" && "Đã chấp nhận"}
                            {quote.status === "rejected" && "Đã từ chối"}
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
                              {quote.preparationTime}
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
                    {cakeQuote.status === "active" && "Đang hoạt động"}
                    {cakeQuote.status === "closed" && "Đã đóng"}
                    {cakeQuote.status === "expired" && "Đã hết hạn"}
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

                <div>
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hạn chót:
                  </span>
                  <p className="text-gray-800 font-medium">
                    {formatDate(cakeQuote.expires_at)}
                  </p>
                </div>
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
                      {cakeQuote.user.username || cakeQuote.user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cakeQuote.user.email}
                    </p>
                  </div>
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
