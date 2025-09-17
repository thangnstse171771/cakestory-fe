import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  ArrowLeft,
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
import CakeQuoteOrder from "./CakeQuoteOrder";
import { set } from "date-fns";

const CakeQuotes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [cakeQuotes, setCakeQuotes] = useState([]);
  const [orderedQuote, setOrderedQuote] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    completed: 0,
  });

  // Fetch cake quotes
  useEffect(() => {
    fetchCakeQuotes();
  }, [currentPage, selectedTab]);

  const fetchCakeQuotes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const response = await getCakeQuotes(currentPage, 50);

      if (response.success) {
        // Filter only current user's quotes
        const userQuotes = response.data.quotes.filter(
          (quote) => quote.user_id === user.id
        );

        // Transform API data to match UI expectations
        const transformedQuotes = await Promise.all(
          userQuotes.map(async (quote) => {
            // Fetch shop quotes for each cake quote
            let shopQuotes = [];
            try {
              const shopQuotesResponse = await getShopQuotesForCakeQuote(
                quote.id
              );
              if (shopQuotesResponse.success) {
                shopQuotes = shopQuotesResponse.data.quotes.map(
                  (shopQuote) => ({
                    id: shopQuote.id,
                    shop: {
                      id: shopQuote.shop?.shop_id || 0,
                      name: shopQuote.shop?.business_name || "Unknown Shop",
                      avatar:
                        shopQuote.shop?.avatar_image || "/placeholder-shop.jpg",
                      address: shopQuote.shop?.business_address || "Unknown",
                      phone: shopQuote.shop?.phone_number || "",
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
              }
            } catch (error) {
              console.error(
                `Error fetching shop quotes for quote ${quote.id}:`,
                error
              );
            }

            // Determine the status for UI
            let uiStatus = "active";
            if (
              quote.status === "closed" &&
              shopQuotes.some((sq) => sq.status === "accepted")
            ) {
              uiStatus = "completed";
            }

            return {
              id: quote.id,
              cakeDesign: {
                id: quote.id,
                image: quote.imageDesign,
                title: quote.title,
                description: quote.description,
                created_at: quote.created_at,
              },
              quotes: shopQuotes,
              status: uiStatus,
              user: quote.user,
              cake_size: quote.cake_size,
              special_requirements: quote.special_requirements,
              budget_range: quote.budget_range,
              expires_at: quote.expires_at,
              created_at: quote.created_at,
            };
          })
        );

        setCakeQuotes(transformedQuotes);

        // Calculate tab counts
        const activeCount = transformedQuotes.filter(
          (q) => q.status === "active"
        ).length;
        const completedCount = transformedQuotes.filter(
          (q) => q.status === "completed"
        ).length;
        setTabCounts({
          active: activeCount,
          completed: completedCount,
        });

        setPagination(response.data.pagination);
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

    const matchesStatus = quote.status === selectedTab;

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
  const handleViewCakeQuote = (id) => {
    navigate(`/cake-quotes/${id}`);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-indigo-600 font-semibold text-lg">
            Đang tải danh sách cake quotes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50 max-w-md mx-auto">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchCakeQuotes}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-indigo-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-600" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tìm thợ làm bánh
              </h1>
              <p className="text-sm text-gray-600">
                Kết nối với các tiệm bánh chuyên nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bánh hoặc tiệm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-72 bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl w-fit shadow-sm border border-indigo-100">
          {[
            {
              id: "active",
              label: "Đang tìm thợ",
              count: tabCounts.active,
              icon: <Clock className="w-4 h-4" />,
              color: "indigo",
            },
            {
              id: "completed",
              label: "Đã nhận báo giá",
              count: tabCounts.completed,
              icon: <CheckCircle className="w-4 h-4" />,
              color: "emerald",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                selectedTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg scale-105`
                  : "text-gray-600 hover:bg-white/80 hover:text-gray-800 hover:scale-102"
              }`}
            >
              {tab.icon}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Cake Quotes List */}
        <div className="space-y-6">
          {filteredQuotes.map((cakeQuote) => (
            <div
              key={cakeQuote.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              {/* Cake Design Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={cakeQuote.cakeDesign.image}
                      alt={cakeQuote.cakeDesign.title}
                      className="w-24 h-24 object-cover rounded-2xl border-4 border-white/30 shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1">
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          cakeQuote.status === "active"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        } shadow-lg`}
                      >
                        {cakeQuote.status === "active"
                          ? "Đang tìm"
                          : "Hoàn thành"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {cakeQuote.cakeDesign.title}
                    </h3>
                    <p className="text-indigo-100 mb-4 leading-relaxed">
                      {cakeQuote.cakeDesign.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-indigo-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(cakeQuote.cakeDesign.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {cakeQuote.user?.full_name ||
                            cakeQuote.user?.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteCakeQuote(cakeQuote.id)}
                      className="p-3 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-red-300/30"
                      title="Xóa"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewCakeQuote(cakeQuote.id)}
                      className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cake Quote Details */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    Chi tiết yêu cầu
                  </h4>
                  {cakeQuote.status === "active" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleUpdateStatus(cakeQuote.id, "closed")
                        }
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Đóng yêu cầu
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        Thông tin cơ bản
                      </h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="text-gray-600 font-medium">
                            Kích thước:
                          </span>
                          <span className="font-bold text-gray-900 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                            {cakeQuote.cake_size}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="text-gray-600 font-medium">
                            Ngân sách:
                          </span>
                          <span className="font-bold text-emerald-700 px-3 py-1 bg-emerald-100 rounded-lg">
                            {formatPrice(cakeQuote.budget_range)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="text-gray-600 font-medium">
                            Hết hạn:
                          </span>
                          <span className="font-bold text-red-700 px-3 py-1 bg-red-100 rounded-lg">
                            {formatDate(cakeQuote.expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        Yêu cầu đặc biệt
                      </h5>
                      <div className="p-4 bg-white rounded-xl min-h-[120px]">
                        <p className="text-gray-700 leading-relaxed">
                          {cakeQuote.special_requirements ||
                            "Không có yêu cầu đặc biệt"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shop Quotes Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                      Báo giá từ tiệm bánh ({cakeQuote.quotes.length})
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {cakeQuote.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex items-start gap-6">
                          {/* Shop Avatar */}
                          <div className="relative">
                            <img
                              src={quote.shop.avatar}
                              alt={quote.shop.name}
                              className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-lg"
                            />
                            <div
                              className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-bold border-2 border-white shadow-lg flex items-center gap-1 ${getStatusColor(
                                quote.status
                              )}`}
                            >
                              {getStatusIcon(quote.status)}
                              <span>
                                {quote.status === "pending" && "Chờ"}
                                {quote.status === "accepted" && "Nhận"}
                                {quote.status === "rejected" && "Từ chối"}
                                {quote.status === "completed" && "Hoàn thành"}
                              </span>
                            </div>
                          </div>

                          {/* Shop Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h5 className="font-bold text-gray-900 text-xl mb-2">
                                  {quote.shop.name}
                                </h5>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    <span>{quote.shop.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-500" />
                                    <span>{quote.shop.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Quote Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                                <div className="flex items-center gap-3 text-emerald-700 mb-2">
                                  <DollarSign className="w-5 h-5" />
                                  <span className="text-sm font-bold">
                                    Giá báo
                                  </span>
                                </div>
                                <div className="text-2xl font-black text-emerald-800">
                                  {formatPrice(quote.price)}
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-3 text-blue-700 mb-2">
                                  <Clock className="w-5 h-5" />
                                  <span className="text-sm font-bold">
                                    Thời gian
                                  </span>
                                </div>
                                <div className="text-2xl font-black text-blue-800">
                                  {quote.preparationTime}
                                </div>
                              </div>
                            </div>

                            {/* Message */}
                            {quote.message && (
                              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl mb-4 border border-gray-200">
                                <h6 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                                  Thông điệp từ tiệm:
                                </h6>
                                <p className="text-gray-700 leading-relaxed">
                                  {quote.message}
                                </p>
                              </div>
                            )}

                            {/* Ingredients Breakdown */}
                            {quote.ingredients && (
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-6 border border-purple-200">
                                <h6 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                                  <ChefHat className="w-4 h-4 text-purple-600" />
                                  Chi tiết nguyên liệu:
                                </h6>
                                <p className="text-sm text-purple-700 leading-relaxed">
                                  {quote.ingredients}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                              {quote.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAcceptShopQuote(quote.id)
                                    }
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                  >
                                    Chấp nhận
                                  </button>
                                  <button className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-400 transition-all duration-200">
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {quote.status === "accepted" && (
                                <button
                                  onClick={() => {
                                    setIsOrderModalOpen(true);
                                    setOrderedQuote(quote);
                                  }}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  Đặt hàng
                                </button>
                              )}
                              <button className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2">
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
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                      <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h5 className="text-xl font-bold text-gray-600 mb-3">
                        Chưa có báo giá nào
                      </h5>
                      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        Hãy chờ các tiệm bánh gửi báo giá cho thiết kế của bạn.
                        Chúng tôi sẽ thông báo ngay khi có báo giá mới!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-white/50">
              <Search className="w-24 h-24 text-indigo-300 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc của bạn
              </p>
            </div>
          </div>
        )}
      </div>

      <CakeQuoteOrder
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cakeQuote={orderedQuote}
      />
    </div>
  );
};

export default CakeQuotes;
