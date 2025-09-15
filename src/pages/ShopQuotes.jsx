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
  Plus,
  Send,
  X,
} from "lucide-react";
import {
  getMyShopQuotes,
  createShopQuote,
  updateShopQuote,
  getCakeQuotes,
  getShopQuotesForCakeQuote,
} from "../api/cakeOrder";
import { toast } from "react-hot-toast";

const ShopQuotes = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    price: "",
    preparation_time: "",
    message: "",
    ingredients_breakdown: "",
  });
  const [shopQuotes, setShopQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch shop quotes
  useEffect(() => {
    fetchShopQuotes();
  }, [currentPage]);

  const fetchShopQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all cake quotes instead of my-shop-quotes
      const response = await getCakeQuotes(currentPage, 50); // Get more items to filter

      if (response.success) {
        // Filter to show only open quotes or quotes where shop has already quoted
        const allQuotes = response.data.quotes || [];
        console.log("All cake quotes from API:", allQuotes);

        // Transform API data to match UI expectations
        const transformedQuotes = allQuotes
          .filter((quote) => quote.status === "open") // Only show open quotes for shops to quote
          .map((quote) => ({
            id: quote.id,
            customer: {
              id: quote.user?.id || 0,
              name:
                quote.user?.full_name ||
                quote.user?.username ||
                "Unknown Customer",
              avatar: quote.user?.avatar || "/placeholder-user.jpg",
              location: "N/A", // API doesn't provide location
              phone: "N/A", // API doesn't provide phone
              email: quote.user?.email || "",
            },
            cakeDesign: {
              id: quote.id,
              image: quote.imageDesign,
              title: quote.title,
              description: quote.description,
              created_at: quote.created_at,
              deadline: quote.expires_at,
              budget: `${quote.budget_range} VND`,
            },
            status: "pending", // All open quotes are pending for shop
            myQuote: null, // Will be populated if shop has quoted
            created_at: quote.created_at,
          }));

        console.log("Transformed quotes for shop:", transformedQuotes);
        setShopQuotes(transformedQuotes);
        setPagination(response.data.pagination);

        // Fetch existing shop quotes for each cake quote to check if current shop has already quoted
        for (const quote of transformedQuotes) {
          try {
            const shopQuotesResponse = await getShopQuotesForCakeQuote(
              quote.id
            );
            if (
              shopQuotesResponse.success &&
              shopQuotesResponse.data.quotes.length > 0
            ) {
              // Find current shop's quote (assuming shop ID is available from auth context)
              // For now, we'll check if any shop has quoted and show the first one
              const existingShopQuote = shopQuotesResponse.data.quotes[0];
              if (existingShopQuote) {
                setShopQuotes((prev) =>
                  prev.map((q) =>
                    q.id === quote.id
                      ? {
                          ...q,
                          status:
                            existingShopQuote.status === "pending"
                              ? "quoted"
                              : existingShopQuote.status,
                          myQuote: {
                            id: existingShopQuote.id,
                            price: existingShopQuote.quoted_price,
                            estimatedTime: `${existingShopQuote.preparation_time} giờ`,
                            message: existingShopQuote.message,
                            ingredients_breakdown:
                              existingShopQuote.ingredients_breakdown,
                            created_at: existingShopQuote.created_at,
                            validUntil: existingShopQuote.expires_at,
                          },
                        }
                      : q
                  )
                );
              }
            }
          } catch (shopError) {
            console.error(
              `Error fetching shop quotes for cake quote ${quote.id}:`,
              shopError
            );
          }
        }
      } else {
        setError("Không thể tải danh sách yêu cầu báo giá");
      }
    } catch (err) {
      console.error("Error fetching shop quotes:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Filter quotes based on search and status
  const filteredQuotes = shopQuotes.filter((quote) => {
    const matchesSearch =
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.cakeDesign.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedTab === "all" || quote.status === selectedTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "quoted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "quoted":
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

  // Handle create quote
  const handleCreateQuote = async () => {
    if (
      !selectedRequest ||
      !quoteForm.price ||
      !quoteForm.preparation_time ||
      !quoteForm.message
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin báo giá");
      return;
    }

    try {
      const quoteData = {
        cake_quote_id: selectedRequest.id,
        quoted_price: parseInt(quoteForm.price),
        preparation_time: parseInt(quoteForm.preparation_time),
        message: quoteForm.message,
        ingredients_breakdown: quoteForm.ingredients_breakdown,
      };

      const response = await createShopQuote(quoteData);
      if (response.success) {
        toast.success("Đã gửi báo giá thành công!");
        setShowQuoteModal(false);
        setQuoteForm({
          price: "",
          preparation_time: "",
          message: "",
          ingredients_breakdown: "",
        });
        setSelectedRequest(null);
        // Refresh the list to show updated status
        await fetchShopQuotes();
      }
    } catch (error) {
      console.error("Error creating shop quote:", error);
      toast.error("Không thể gửi báo giá");
    }
  };

  // Handle update quote
  const handleUpdateQuote = async () => {
    if (
      !selectedRequest?.myQuote?.id ||
      !quoteForm.price ||
      !quoteForm.preparation_time ||
      !quoteForm.message
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin báo giá");
      return;
    }

    try {
      const updateData = {
        quoted_price: parseInt(quoteForm.price),
        preparation_time: parseInt(quoteForm.preparation_time),
        message: quoteForm.message,
        ingredients_breakdown: quoteForm.ingredients_breakdown,
      };

      const response = await updateShopQuote(
        selectedRequest.myQuote.id,
        updateData
      );
      if (response.success) {
        toast.success("Đã cập nhật báo giá thành công!");
        setShowQuoteModal(false);
        setQuoteForm({
          price: "",
          preparation_time: "",
          message: "",
          ingredients_breakdown: "",
        });
        setSelectedRequest(null);
        // Refresh the list to show updated status
        await fetchShopQuotes();
      }
    } catch (error) {
      console.error("Error updating shop quote:", error);
      toast.error("Không thể cập nhật báo giá");
    }
  };

  // Open quote modal
  const openQuoteModal = (request) => {
    setSelectedRequest(request);
    if (request.myQuote) {
      // Editing existing quote
      setQuoteForm({
        price: request.myQuote.price.toString(),
        preparation_time: request.myQuote.estimatedTime.replace(" giờ", ""),
        message: request.myQuote.message,
        ingredients_breakdown: request.myQuote.ingredients_breakdown || "",
      });
    } else {
      // Creating new quote
      setQuoteForm({
        price: "",
        preparation_time: "",
        message: "",
        ingredients_breakdown: "",
      });
    }
    setShowQuoteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách yêu cầu báo giá...</p>
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
            onClick={fetchShopQuotes}
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
                Quản lý báo giá
              </h1>
              <p className="text-sm text-gray-600">
                Xem và quản lý các yêu cầu báo giá từ khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng hoặc bánh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Debug Info - Remove this in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-yellow-700">
            Tổng số yêu cầu: {shopQuotes.length} | Chưa báo giá:{" "}
            {shopQuotes.filter((q) => q.status === "pending").length} | Đã báo
            giá: {shopQuotes.filter((q) => q.status === "quoted").length}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            {
              id: "pending",
              label: "Chưa báo giá",
              count: shopQuotes.filter((q) => q.status === "pending").length,
            },
            {
              id: "quoted",
              label: "Đã báo giá",
              count: shopQuotes.filter((q) => q.status === "quoted").length,
            },
            { id: "all", label: "Tất cả", count: shopQuotes.length },
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

        {/* Shop Quotes List */}
        <div className="space-y-8">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Customer & Cake Design Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex items-start gap-4">
                  <img
                    src={quote.customer.avatar}
                    alt={quote.customer.name}
                    className="w-16 h-16 rounded-full border-4 border-white/20 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">
                        {quote.customer.name}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {getStatusIcon(quote.status)}
                        {quote.status === "pending" && "Chưa báo giá"}
                        {quote.status === "quoted" && "Đã báo giá"}
                        {quote.status === "accepted" && "Đã chấp nhận"}
                        {quote.status === "rejected" && "Đã từ chối"}
                        {quote.status === "completed" && "Hoàn thành"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-pink-100 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {quote.customer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(quote.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {quote.customer.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {quote.customer.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cake Design & Quote Section */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cake Design */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Yêu cầu bánh
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <img
                        src={quote.cakeDesign.image}
                        alt={quote.cakeDesign.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h5 className="font-semibold text-gray-800 mb-2">
                        {quote.cakeDesign.title}
                      </h5>
                      <p className="text-gray-600 text-sm mb-3">
                        {quote.cakeDesign.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Deadline:</span>
                          <div className="font-medium text-gray-800">
                            {formatDate(quote.cakeDesign.deadline)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Ngân sách:</span>
                          <div className="font-medium text-gray-800">
                            {quote.cakeDesign.budget}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Quote */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Báo giá của tôi
                    </h4>
                    {quote.myQuote ? (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 mb-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Giá báo
                              </span>
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {formatPrice(quote.myQuote.price)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Thời gian
                              </span>
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {quote.myQuote.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg mb-4">
                          <h6 className="text-sm font-medium text-green-800 mb-2">
                            Thông điệp:
                          </h6>
                          <p className="text-sm text-green-700">
                            {quote.myQuote.message}
                          </p>
                        </div>
                        {quote.myQuote.ingredients_breakdown && (
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <h6 className="text-sm font-medium text-green-800 mb-2">
                              Chi tiết nguyên liệu:
                            </h6>
                            <p className="text-sm text-green-700">
                              {quote.myQuote.ingredients_breakdown}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openQuoteModal(quote)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 mr-2 inline" />
                            Chỉnh sửa
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            <MessageCircle className="w-4 h-4 mr-2 inline" />
                            Nhắn tin
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h5 className="text-lg font-medium text-gray-600 mb-2">
                          Chưa báo giá
                        </h5>
                        <p className="text-gray-500 mb-4">
                          Gửi báo giá cho khách hàng này
                        </p>
                        <button
                          onClick={() => openQuoteModal(quote)}
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2 inline" />
                          Gửi báo giá
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedTab === "pending"
                ? "Không có yêu cầu báo giá mới"
                : selectedTab === "quoted"
                ? "Chưa có báo giá nào được gửi"
                : "Không tìm thấy yêu cầu nào"}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedTab === "pending"
                ? "Hiện tại không có khách hàng nào đang tìm thợ làm bánh. Hãy kiểm tra lại sau!"
                : selectedTab === "quoted"
                ? "Bạn chưa gửi báo giá cho yêu cầu nào. Hãy bắt đầu bằng cách xem các yêu cầu mới!"
                : "Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc"}
            </p>
            {selectedTab === "pending" && (
              <button
                onClick={fetchShopQuotes}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Làm mới danh sách
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedRequest.myQuote ? "Chỉnh sửa báo giá" : "Gửi báo giá"}
              </h3>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setSelectedRequest(null);
                  setQuoteForm({
                    price: "",
                    preparation_time: "",
                    message: "",
                    ingredients_breakdown: "",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Customer & Cake Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={selectedRequest.customer.avatar}
                    alt={selectedRequest.customer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {selectedRequest.customer.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.customer.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Bánh:</span>
                    <div className="font-medium text-gray-800">
                      {selectedRequest.cakeDesign.title}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <div className="font-medium text-gray-800">
                      {formatDate(selectedRequest.cakeDesign.deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá báo (VND) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.price}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian chuẩn bị (giờ) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.preparation_time}
                      onChange={(e) =>
                        setQuoteForm({
                          ...quoteForm,
                          preparation_time: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông điệp *
                  </label>
                  <textarea
                    value={quoteForm.message}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về báo giá của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chi tiết nguyên liệu
                  </label>
                  <textarea
                    value={quoteForm.ingredients_breakdown}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        ingredients_breakdown: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Liệt kê các nguyên liệu sẽ sử dụng..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setSelectedRequest(null);
                  setQuoteForm({
                    price: "",
                    preparation_time: "",
                    message: "",
                    ingredients_breakdown: "",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={
                  selectedRequest.myQuote
                    ? handleUpdateQuote
                    : handleCreateQuote
                }
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                {selectedRequest.myQuote ? "Cập nhật báo giá" : "Gửi báo giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopQuotes;
