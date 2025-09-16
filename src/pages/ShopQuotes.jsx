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
  getCakeQuoteById,
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
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [quotedQuotes, setQuotedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch shop quotes
  useEffect(() => {
    fetchAllQuotes();
  }, [currentPage]);

  // Update shopQuotes when tab changes
  useEffect(() => {
    if (selectedTab === "pending") {
      setShopQuotes(pendingQuotes);
    } else if (selectedTab === "quoted") {
      setShopQuotes(quotedQuotes);
    }
  }, [selectedTab, pendingQuotes, quotedQuotes]);

  const fetchAllQuotes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both pending and quoted quotes simultaneously
      const [pendingResponse, quotedResponse] = await Promise.all([
        getCakeQuotes(currentPage, 50),
        getMyShopQuotes(currentPage, 50),
      ]);

      // Process pending quotes
      if (pendingResponse.success) {
        const allQuotes = pendingResponse.data.quotes || [];
        console.log("All cake quotes from API:", allQuotes);

        const transformedPendingQuotes = allQuotes
          .filter((quote) => quote.status === "open")
          .map((quote) => ({
            id: quote.id,
            customer: {
              id: quote.user?.id || 0,
              name:
                quote.user?.full_name ||
                quote.user?.username ||
                "Unknown Customer",
              avatar: quote.user?.avatar || "/placeholder-user.jpg",
              location: "N/A",
              phone: "N/A",
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
            status: "pending",
            myQuote: null,
            created_at: quote.created_at,
          }));

        setPendingQuotes(transformedPendingQuotes);

        // Get current shop ID and update quote statuses
        let currentShopId = null;
        if (quotedResponse.success && quotedResponse.data.quotes.length > 0) {
          currentShopId = quotedResponse.data.quotes[0].shop_id;
        }

        if (currentShopId) {
          for (const quote of transformedPendingQuotes) {
            try {
              const shopQuotesResponse = await getShopQuotesForCakeQuote(
                quote.id
              );
              if (
                shopQuotesResponse.success &&
                shopQuotesResponse.data.quotes.length > 0
              ) {
                const currentShopQuote = shopQuotesResponse.data.quotes.find(
                  (q) => q.shop_id === currentShopId
                );
                if (currentShopQuote) {
                  setPendingQuotes((prev) =>
                    prev.map((q) =>
                      q.id === quote.id
                        ? {
                            ...q,
                            status:
                              currentShopQuote.status === "pending"
                                ? "quoted"
                                : currentShopQuote.status,
                            myQuote: {
                              id: currentShopQuote.id,
                              price: currentShopQuote.quoted_price,
                              estimatedTime: `${currentShopQuote.preparation_time} giờ`,
                              message: currentShopQuote.message,
                              ingredients_breakdown:
                                currentShopQuote.ingredients_breakdown,
                              created_at: currentShopQuote.created_at,
                              validUntil: currentShopQuote.expires_at,
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
        }
      }

      // Process quoted quotes
      if (quotedResponse.success) {
        const myQuotes = quotedResponse.data.quotes || [];
        console.log("My shop quotes from API:", myQuotes);

        const transformedQuotedQuotes = await Promise.all(
          myQuotes.map(async (quote) => {
            let cakeQuoteDetails = null;
            try {
              const cakeQuoteResponse = await getCakeQuoteById(
                quote.cake_quote_id
              );
              if (cakeQuoteResponse.success) {
                cakeQuoteDetails = cakeQuoteResponse.data;
              }
            } catch (error) {
              console.error(
                `Error fetching cake quote ${quote.cake_quote_id}:`,
                error
              );
            }

            return {
              id: quote.cake_quote_id,
              customer: {
                id: cakeQuoteDetails?.user?.id || 0,
                name:
                  cakeQuoteDetails?.user?.full_name ||
                  cakeQuoteDetails?.user?.username ||
                  "Unknown Customer",
                avatar:
                  cakeQuoteDetails?.user?.avatar || "/placeholder-user.jpg",
                location: "N/A",
                phone: "N/A",
                email: cakeQuoteDetails?.user?.email || "",
              },
              cakeDesign: {
                id: quote.cake_quote_id,
                image: cakeQuoteDetails?.imageDesign || "/placeholder-cake.jpg",
                title: cakeQuoteDetails?.title || "Cake Design",
                description: cakeQuoteDetails?.description || "",
                created_at: cakeQuoteDetails?.created_at || quote.created_at,
                deadline: cakeQuoteDetails?.expires_at || null,
                budget: `${cakeQuoteDetails?.budget_range || "N/A"} VND`,
              },
              status: "quoted",
              myQuote: {
                id: quote.id,
                price: quote.quoted_price,
                estimatedTime: `${quote.preparation_time} giờ`,
                message: quote.message,
                ingredients_breakdown: quote.ingredients_breakdown,
                created_at: quote.created_at,
                validUntil: quote.expires_at,
              },
              created_at: quote.created_at,
            };
          })
        );

        setQuotedQuotes(transformedQuotedQuotes);
      }

      // Set pagination from the current tab's response
      const currentResponse =
        selectedTab === "pending" ? pendingResponse : quotedResponse;
      if (currentResponse.success) {
        setPagination(currentResponse.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching shop quotes:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchShopQuotes = fetchAllQuotes; // For backward compatibility

  // Filter quotes based on search and status
  const filteredQuotes = shopQuotes.filter((quote) => {
    const matchesSearch =
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.cakeDesign.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = quote.status === selectedTab;

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-indigo-600 font-semibold text-lg">
            Đang tải danh sách yêu cầu báo giá...
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
            onClick={fetchShopQuotes}
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
              <svg
                className="w-5 h-5 text-indigo-600"
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
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quản lý báo giá
              </h1>
              <p className="text-sm text-gray-600">
                Xem và quản lý các yêu cầu báo giá từ khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng hoặc bánh..."
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
              id: "pending",
              label: "Chưa báo giá",
              count: pendingQuotes.filter((q) => q.status === "pending").length,
              icon: <AlertCircle className="w-4 h-4" />,
              color: "orange",
            },
            {
              id: "quoted",
              label: "Đã báo giá",
              count: quotedQuotes.length,
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

        {/* Shop Quotes List */}
        <div className="space-y-6">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              {/* Customer & Cake Design Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={quote.customer.avatar}
                      alt={quote.customer.name}
                      className="w-20 h-20 rounded-2xl border-4 border-white/30 object-cover shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1">
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-bold border-2 border-white shadow-lg flex items-center gap-1 ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {getStatusIcon(quote.status)}
                        <span>
                          {quote.status === "pending" && "Chưa báo giá"}
                          {quote.status === "quoted" && "Đã báo giá"}
                          {quote.status === "accepted" && "Đã chấp nhận"}
                          {quote.status === "rejected" && "Đã từ chối"}
                          {quote.status === "completed" && "Hoàn thành"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {quote.customer.name}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-indigo-100 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{quote.customer.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(quote.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-indigo-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{quote.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{quote.customer.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cake Design & Quote Section */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cake Design */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                      Yêu cầu bánh
                    </h4>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <img
                        src={quote.cakeDesign.image}
                        alt={quote.cakeDesign.title}
                        className="w-full h-56 object-cover rounded-xl mb-6 shadow-lg"
                      />
                      <h5 className="font-bold text-gray-900 text-lg mb-3">
                        {quote.cakeDesign.title}
                      </h5>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {quote.cakeDesign.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-gray-500 text-sm font-medium">
                            Deadline:
                          </span>
                          <div className="font-bold text-gray-900 text-lg">
                            {formatDate(quote.cakeDesign.deadline)}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-gray-500 text-sm font-medium">
                            Ngân sách:
                          </span>
                          <div className="font-bold text-emerald-700 text-lg">
                            {quote.cakeDesign.budget}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Quote */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                      Báo giá của tôi
                    </h4>
                    {quote.myQuote ? (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-700 mb-2">
                              <DollarSign className="w-5 h-5" />
                              <span className="text-sm font-bold">Giá báo</span>
                            </div>
                            <div className="text-2xl font-black text-emerald-800">
                              {formatPrice(quote.myQuote.price)}
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-700 mb-2">
                              <Clock className="w-5 h-5" />
                              <span className="text-sm font-bold">
                                Thời gian
                              </span>
                            </div>
                            <div className="text-2xl font-black text-emerald-800">
                              {quote.myQuote.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl mb-6 border border-emerald-200">
                          <h6 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Thông điệp:
                          </h6>
                          <p className="text-emerald-700 leading-relaxed">
                            {quote.myQuote.message}
                          </p>
                        </div>
                        {quote.myQuote.ingredients_breakdown && (
                          <div className="bg-white p-4 rounded-xl mb-6 border border-emerald-200">
                            <h6 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                              <ChefHat className="w-4 h-4" />
                              Chi tiết nguyên liệu:
                            </h6>
                            <p className="text-emerald-700 leading-relaxed">
                              {quote.myQuote.ingredients_breakdown}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => openQuoteModal(quote)}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Edit3 className="w-4 h-4 mr-2 inline" />
                            Chỉnh sửa
                          </button>
                          <button className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                            <MessageCircle className="w-4 h-4 mr-2 inline" />
                            Nhắn tin
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                        <Plus className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                        <h5 className="text-xl font-bold text-gray-600 mb-3">
                          Chưa báo giá
                        </h5>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                          Gửi báo giá chuyên nghiệp cho khách hàng này
                        </p>
                        <button
                          onClick={() => openQuoteModal(quote)}
                          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Send className="w-5 h-5 mr-2 inline" />
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
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-xl border border-white/50">
              <Search className="w-24 h-24 text-indigo-300 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {selectedTab === "pending"
                  ? "Không có yêu cầu báo giá mới"
                  : "Chưa có báo giá nào được gửi"}
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {selectedTab === "pending"
                  ? "Hiện tại không có khách hàng nào đang tìm thợ làm bánh. Hãy kiểm tra lại sau!"
                  : "Bạn chưa gửi báo giá cho yêu cầu nào. Hãy bắt đầu bằng cách xem các yêu cầu mới!"}
              </p>
              {selectedTab === "pending" && (
                <button
                  onClick={fetchShopQuotes}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Làm mới danh sách
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/50">
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h3 className="text-2xl font-bold">
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
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Customer & Cake Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedRequest.customer.avatar}
                    alt={selectedRequest.customer.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl">
                      {selectedRequest.customer.name}
                    </h4>
                    <p className="text-gray-600">
                      {selectedRequest.customer.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium">
                      Bánh yêu cầu:
                    </span>
                    <div className="font-bold text-gray-900 text-lg">
                      {selectedRequest.cakeDesign.title}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <span className="text-gray-500 font-medium">Deadline:</span>
                    <div className="font-bold text-red-700 text-lg">
                      {formatDate(selectedRequest.cakeDesign.deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Giá báo (VND) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.price}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
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
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                      placeholder="24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Thông điệp cho khách hàng *
                  </label>
                  <textarea
                    value={quoteForm.message}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                    placeholder="Mô tả chi tiết về báo giá của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
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
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                    placeholder="Liệt kê các nguyên liệu sẽ sử dụng..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
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
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={
                  selectedRequest.myQuote
                    ? handleUpdateQuote
                    : handleCreateQuote
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
