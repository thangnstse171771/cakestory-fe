import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  User,
  MessageCircle,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChefHat,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import {
  getCakeQuotes,
  getCakeQuoteById,
  deleteCakeQuote,
  updateCakeQuoteStatus,
  getShopQuotesForCakeQuote,
  createShopQuote,
  updateShopQuote,
  acceptShopQuote,
} from "../api/cakeOrder";
import { toast } from "react-hot-toast";

const CakeQuotes = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [cakeQuotes, setCakeQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch cake quotes
  useEffect(() => {
    fetchCakeQuotes();
  }, [currentPage]);

  const fetchCakeQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCakeQuotes(currentPage, 10);

      if (response.success) {
        // Transform API data to match UI expectations
        const transformedQuotes = response.data.quotes.map((quote) => ({
          id: quote.id,
          cakeDesign: {
            id: quote.id,
            image: quote.imageDesign,
            title: quote.title,
            description: quote.description,
            created_at: quote.created_at,
          },
          quotes: [], // Will be populated with shop quotes
          status: quote.status === "open" ? "active" : quote.status,
          user: quote.user,
          cake_size: quote.cake_size,
          special_requirements: quote.special_requirements,
          budget_range: quote.budget_range,
          expires_at: quote.expires_at,
        }));

        setCakeQuotes(transformedQuotes);
        setPagination(response.data.pagination);

        // Fetch shop quotes for each cake quote
        for (const quote of transformedQuotes) {
          try {
            const shopQuotesResponse = await getShopQuotesForCakeQuote(
              quote.id
            );
            if (shopQuotesResponse.success) {
              // Transform shop quotes data
              const transformedShopQuotes = shopQuotesResponse.data.quotes.map(
                (shopQuote) => ({
                  id: shopQuote.id,
                  shop: {
                    id: shopQuote.shop?.id || 0,
                    name: shopQuote.shop?.name || "Unknown Shop",
                    avatar: shopQuote.shop?.avatar || "/placeholder-shop.jpg",
                    rating: shopQuote.shop?.rating || 0,
                    reviewCount: shopQuote.shop?.review_count || 0,
                    location: shopQuote.shop?.location || "Unknown",
                    distance: "N/A", // API doesn't provide distance
                    phone: shopQuote.shop?.phone || "",
                    email: shopQuote.shop?.email || "",
                  },
                  price: shopQuote.quoted_price,
                  estimatedTime: `${shopQuote.preparation_time} giờ`,
                  status: shopQuote.status || "pending",
                  message: shopQuote.message,
                  created_at: shopQuote.created_at,
                  validUntil: shopQuote.expires_at,
                  ingredients_breakdown: shopQuote.ingredients_breakdown,
                })
              );

              // Update the quote with shop quotes
              setCakeQuotes((prev) =>
                prev.map((q) =>
                  q.id === quote.id
                    ? { ...q, quotes: transformedShopQuotes }
                    : q
                )
              );
            }
          } catch (shopError) {
            console.error(
              `Error fetching shop quotes for cake quote ${quote.id}:`,
              shopError
            );
          }
        }
      } else {
        setError("Không thể tải danh sách cake quotes");
      }
    } catch (err) {
      console.error("Error fetching cake quotes:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Filter quotes based on search and status
  const filteredQuotes = cakeQuotes.filter((quote) => {
    const matchesSearch =
      quote.cakeDesign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedTab === "all" || quote.status === selectedTab;

    return matchesSearch && matchesStatus;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle view cake quote details
  const handleViewCakeQuote = async (id) => {
    try {
      const response = await getCakeQuoteById(id);
      if (response.success) {
        // For now, just show a toast with details
        toast.success(`Xem chi tiết cake quote ${id}`);
        console.log("Cake quote details:", response.data);
      }
    } catch (error) {
      console.error("Error fetching cake quote details:", error);
      toast.error("Không thể tải chi tiết cake quote");
    }
  };

  // Handle delete cake quote
  const handleDeleteCakeQuote = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cake quote này?")) {
      return;
    }

    try {
      const response = await deleteCakeQuote(id);
      if (response.success) {
        toast.success("Đã xóa cake quote thành công");
        fetchCakeQuotes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting cake quote:", error);
      toast.error("Không thể xóa cake quote");
    }
  };

  // Handle update cake quote status
  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await updateCakeQuoteStatus(id, status);
      if (response.success) {
        toast.success("Đã cập nhật trạng thái thành công");
        fetchCakeQuotes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating cake quote status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  // Handle accept shop quote
  const handleAcceptShopQuote = async (shopQuoteId) => {
    try {
      const response = await acceptShopQuote(shopQuoteId);
      if (response.success) {
        toast.success("Đã chấp nhận báo giá thành công");
        fetchCakeQuotes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error accepting shop quote:", error);
      toast.error("Không thể chấp nhận báo giá");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách cake quotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCakeQuotes}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-500 bg-clip-text text-transparent">
                Tìm thợ làm bánh
              </h1>
              <p className="text-sm text-gray-600">
                Kết nối với các tiệm bánh chuyên nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bánh hoặc tiệm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            {
              id: "active",
              label: "Đang tìm thợ",
              count: cakeQuotes.filter((q) => q.status === "active").length,
            },
            {
              id: "completed",
              label: "Hoàn thành",
              count: cakeQuotes.filter((q) => q.status === "completed").length,
            },
            { id: "all", label: "Tất cả", count: cakeQuotes.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.id
                  ? "bg-white text-pink-600 shadow-md"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Cake Quotes List */}
        <div className="space-y-8">
          {filteredQuotes.map((cakeQuote) => (
            <div
              key={cakeQuote.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Cake Design Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex items-start gap-4">
                  <img
                    src={cakeQuote.cakeDesign.image}
                    alt={cakeQuote.cakeDesign.title}
                    className="w-20 h-20 object-cover rounded-xl border-4 border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {cakeQuote.cakeDesign.title}
                    </h3>
                    <p className="text-pink-100 mb-3">
                      {cakeQuote.cakeDesign.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(cakeQuote.cakeDesign.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {cakeQuote.user?.full_name || cakeQuote.user?.username}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cakeQuote.status === "active"
                            ? "bg-green-500/20 text-green-100"
                            : "bg-blue-500/20 text-blue-100"
                        }`}
                      >
                        {cakeQuote.status === "active"
                          ? "Đang tìm thợ"
                          : "Hoàn thành"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteCakeQuote(cakeQuote.id)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Xóa"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewCakeQuote(cakeQuote.id)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cake Quote Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Chi tiết yêu cầu
                  </h4>
                  {cakeQuote.status === "active" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateStatus(cakeQuote.id, "closed")
                        }
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-colors"
                      >
                        Đóng yêu cầu
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-colors">
                        Tìm thêm thợ
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-4 bg-blue-500 rounded-full mr-2"></span>
                        Thông tin cơ bản
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kích thước:</span>
                          <span className="font-medium">
                            {cakeQuote.cake_size}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngân sách:</span>
                          <span className="font-medium">
                            {formatPrice(cakeQuote.budget_range)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hết hạn:</span>
                          <span className="font-medium">
                            {formatDate(cakeQuote.expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-4 bg-green-500 rounded-full mr-2"></span>
                        Yêu cầu đặc biệt
                      </h5>
                      <p className="text-sm text-gray-700">
                        {cakeQuote.special_requirements ||
                          "Không có yêu cầu đặc biệt"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shop Quotes Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Báo giá từ tiệm bánh ({cakeQuote.quotes.length})
                    </h4>
                    {cakeQuote.status === "active" && (
                      <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-colors">
                        Tìm thêm thợ
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {cakeQuote.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-pink-300 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Shop Avatar */}
                          <img
                            src={quote.shop.avatar}
                            alt={quote.shop.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />

                          {/* Shop Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-800 text-lg">
                                  {quote.shop.name}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    {quote.shop.rating} (
                                    {quote.shop.reviewCount})
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {quote.shop.location}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                                  quote.status
                                )}`}
                              >
                                {getStatusIcon(quote.status)}
                                {quote.status === "pending" && "Chờ phản hồi"}
                                {quote.status === "accepted" && "Đã chấp nhận"}
                                {quote.status === "rejected" && "Đã từ chối"}
                                {quote.status === "completed" && "Hoàn thành"}
                              </div>
                            </div>

                            {/* Quote Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 mb-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Giá báo
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-green-800">
                                  {formatPrice(quote.price)}
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 mb-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Thời gian
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-blue-800">
                                  {quote.estimatedTime}
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-purple-700 mb-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Hết hạn
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-purple-800">
                                  {formatDate(quote.validUntil)}
                                </div>
                              </div>
                            </div>

                            {/* Message */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {quote.message}
                              </p>
                            </div>

                            {/* Ingredients Breakdown */}
                            {quote.ingredients_breakdown && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                <h6 className="text-sm font-medium text-blue-800 mb-2">
                                  Chi tiết nguyên liệu:
                                </h6>
                                <p className="text-sm text-blue-700">
                                  {quote.ingredients_breakdown}
                                </p>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {quote.shop.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {quote.shop.email}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {quote.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAcceptShopQuote(quote.id)
                                    }
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
                                  >
                                    Chấp nhận
                                  </button>
                                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {quote.status === "accepted" && (
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors">
                                  Theo dõi đơn hàng
                                </button>
                              )}
                              <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Nhắn tin
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cakeQuote.quotes.length === 0 && (
                    <div className="text-center py-8">
                      <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-600 mb-2">
                        Chưa có báo giá nào
                      </h5>
                      <p className="text-gray-500">
                        Hãy chờ các tiệm bánh gửi báo giá cho thiết kế của bạn
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-500">
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CakeQuotes;
