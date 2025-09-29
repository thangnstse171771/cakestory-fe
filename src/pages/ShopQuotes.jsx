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
  getAcceptedQuotesByShop,
} from "../api/cakeOrder";
import { authAPI } from "../api/auth";
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
  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasShop, setHasShop] = useState(true);
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
    } else if (selectedTab === "accepted") {
      setShopQuotes(acceptedQuotes);
    }
  }, [selectedTab, pendingQuotes, quotedQuotes, acceptedQuotes]);

  // Fetch all users to get complete user data
  const fetchAllUsers = async () => {
    try {
      const response = await authAPI.getAllActiveUsers();
      if (response && response.users) {
        const usersMap = {};
        response.users.forEach((user) => {
          usersMap[user.id] = user;
        });
        setAllUsers(usersMap);
        return usersMap;
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
      return {};
    }
  };

  // Enhanced user data mapping
  const enhanceUserData = (user, usersMap = {}) => {
    const enhancedUser = usersMap[user?.id] || user || {};
    return {
      id: enhancedUser.id || 0,
      name:
        enhancedUser.full_name || enhancedUser.username || "Unknown Customer",
      username: enhancedUser.username || "N/A",
      avatar: enhancedUser.avatar || "/placeholder-user.jpg",
      address: enhancedUser.address || "Chưa cập nhật",
      phone_number: enhancedUser.phone_number || "Chưa cập nhật",
      email: enhancedUser.email || "N/A",
    };
  };

  const fetchAllQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasShop(true); // Reset shop status

      // Fetch users data first
      const usersMap = await fetchAllUsers();

      // First, try to fetch shop quotes to check if user has a shop
      let quotedResponse;
      try {
        quotedResponse = await getMyShopQuotes(currentPage, 50);
        // If this succeeds, user has a shop
        setHasShop(true);
      } catch (shopError) {
        console.error("Error checking shop status:", shopError);
        // Check if the error indicates no shop
        if (shopError.response?.status === 404 || 
            shopError.response?.status === 403 || 
            shopError.message?.toLowerCase().includes('shop') || 
            shopError.response?.data?.message?.toLowerCase().includes('shop')) {
          setHasShop(false);
          return; // Exit early if no shop
        }
        // If it's a different error, continue and handle later
        quotedResponse = { success: false, data: { quotes: [] } };
      }

      // Fetch other quotes simultaneously
      const [pendingResponse, acceptedResponse] = await Promise.all([
        getCakeQuotes(currentPage, 50),
        getAcceptedQuotesByShop(currentPage, 50),
      ]);

      // Process pending quotes
      if (pendingResponse.success) {
        const allQuotes = pendingResponse.data.quotes || [];
        console.log("All cake quotes from API:", allQuotes);

        const transformedPendingQuotes = allQuotes
          .filter((quote) => quote.status === "open")
          .map((quote) => ({
            id: quote.id,
            customer: enhanceUserData(quote.user, usersMap),
            cakeDesign: {
              id: quote.id,
              image: quote.imageDesign,
              title: quote.title,
              description: quote.description,
              created_at: quote.created_at,
              deadline: quote.expires_at,
              budget: `${quote.budget_range} VND`,
              cake_size: quote.cake_size || "N/A",
              special_requirements: quote.special_requirements || "N/A",
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

        // Get list of accepted quote IDs to filter them out
        const acceptedQuoteIds = new Set();
        if (acceptedResponse.success && acceptedResponse.data.acceptedQuotes) {
          acceptedResponse.data.acceptedQuotes.forEach((quote) => {
            acceptedQuoteIds.add(quote.id);
          });
        }

        const transformedQuotedQuotes = await Promise.all(
          myQuotes
            .filter((quote) => !acceptedQuoteIds.has(quote.cake_quote_id)) // Filter out accepted quotes
            .map(async (quote) => {
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
                customer: enhanceUserData(cakeQuoteDetails?.user, usersMap),
                cakeDesign: {
                  id: quote.cake_quote_id,
                  image:
                    cakeQuoteDetails?.imageDesign || "/placeholder-cake.jpg",
                  title: cakeQuoteDetails?.title || "Cake Design",
                  description: cakeQuoteDetails?.description || "",
                  created_at: cakeQuoteDetails?.created_at || quote.created_at,
                  deadline: cakeQuoteDetails?.expires_at || null,
                  budget: `${cakeQuoteDetails?.budget_range || "N/A"} VND`,
                  cake_size: cakeQuoteDetails?.cake_size || "N/A",
                  special_requirements:
                    cakeQuoteDetails?.special_requirements || "N/A",
                },
                status:
                  cakeQuoteDetails?.status === "closed" ? "closed" : "quoted",
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
                originalCakeQuoteStatus: cakeQuoteDetails?.status, // Keep original status for reference
              };
            })
        );

        setQuotedQuotes(transformedQuotedQuotes);
      }

      // Process accepted quotes
      if (acceptedResponse.success) {
        const acceptedQuotes = acceptedResponse.data.acceptedQuotes || [];
        console.log("Accepted quotes from API:", acceptedQuotes);

        const transformedAcceptedQuotes = acceptedQuotes.map((quote) => ({
          id: quote.id,
          customer: enhanceUserData(quote.user, usersMap),
          cakeDesign: {
            id: quote.id,
            image: quote.imageDesign || "/placeholder-cake.jpg",
            title: quote.title,
            description: quote.description,
            created_at: quote.created_at,
            deadline: quote.expires_at,
            budget: `${quote.budget_range} VND`,
            cake_size: quote.cake_size || "N/A",
            special_requirements: quote.special_requirements || "N/A",
          },
          status: "accepted",
          myQuote:
            quote.shopQuotes && quote.shopQuotes[0]
              ? {
                  id: quote.shopQuotes[0].id,
                  price: quote.shopQuotes[0].quoted_price,
                  estimatedTime: `${quote.shopQuotes[0].preparation_time} giờ`,
                  message: quote.shopQuotes[0].message,
                  ingredients_breakdown:
                    quote.shopQuotes[0].ingredients_breakdown,
                  accepted_at: quote.shopQuotes[0].accepted_at,
                }
              : null,
          created_at: quote.created_at,
        }));

        setAcceptedQuotes(transformedAcceptedQuotes);
      }

      // Set pagination from the current tab's response
      const currentResponse =
        selectedTab === "pending"
          ? pendingResponse
          : selectedTab === "quoted"
          ? quotedResponse
          : acceptedResponse;
      if (currentResponse.success) {
        setPagination(currentResponse.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching shop quotes:", err);
      
      // Check if the error is related to not having a shop
      if (err.response?.status === 404 || err.response?.status === 403 || 
          err.message?.toLowerCase().includes('shop') || 
          err.response?.data?.message?.toLowerCase().includes('shop')) {
        setHasShop(false);
      } else {
        setError("Có lỗi xảy ra khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShopQuotes = fetchAllQuotes; // For backward compatibility

  // Function to retry loading (for when user comes back after creating shop)
  const retryLoading = () => {
    setHasShop(true);
    setError(null);
    fetchAllQuotes();
  };

  // Filter quotes based on search and status
  const filteredQuotes = shopQuotes.filter((quote) => {
    const matchesSearch =
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.cakeDesign.title.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = false;
    if (selectedTab === "quoted") {
      // In "quoted" tab, show both "quoted" and "closed" status quotes
      matchesStatus = quote.status === "quoted" || quote.status === "closed";
    } else {
      matchesStatus = quote.status === selectedTab;
    }

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
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "closed":
        return <XCircle className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-pink-600 font-semibold text-lg">
            Đang tải danh sách yêu cầu báo giá...
          </p>
        </div>
      </div>
    );
  }

  // Show shop creation guide if user doesn't have a shop
  if (!hasShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Tạo Shop Của Bạn
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Bạn cần tạo shop trước khi có thể nhận và quản lý các yêu cầu báo giá từ khách hàng. 
            Hãy tạo shop ngay để bắt đầu kinh doanh bánh kem của bạn!
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Lợi ích khi có shop:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3 text-blue-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Nhận yêu cầu báo giá từ khách hàng</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Quản lý đơn hàng chuyên nghiệp</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Hiển thị sản phẩm trên marketplace</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Xây dựng thương hiệu cá nhân</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/marketplace/create-shop')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Shop Ngay
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 border-2 border-pink-300 text-pink-600 rounded-xl font-bold hover:bg-pink-50 hover:border-pink-400 transition-all duration-200"
            >
              Quay lại
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-600 mb-3">
              Bạn đã có shop? Hãy kiểm tra lại:
            </p>
            <button
              onClick={retryLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 text-sm"
            >
              Kiểm tra lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50 max-w-md mx-auto">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={retryLoading}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-pink-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-pink-50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <svg
                className="w-5 h-5 text-pink-600"
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
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Quản lý báo giá
              </h1>
              <p className="text-sm text-gray-600">
                Xem và quản lý các yêu cầu báo giá từ khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng hoặc bánh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent w-72 bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl w-fit shadow-sm border border-pink-100">
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
            {
              id: "accepted",
              label: "Khách đã chấp nhận báo giá",
              count: acceptedQuotes.length,
              icon: <User className="w-4 h-4" />,
              color: "blue",
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
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={quote.customer.avatar}
                      alt={quote.customer.name}
                      className="w-20 h-20 rounded-2xl border-4 border-white/30 object-cover shadow-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">
                        {quote.customer.name}
                      </h3>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-bold border-2 border-white shadow-lg flex items-center gap-1 ${getStatusColor(
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
                          {quote.status === "closed" &&
                            "Shop khác đã được chọn"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-pink-100 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>@{quote.customer.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(quote.created_at)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {quote.customer.email &&
                        quote.customer.email !== "N/A" && (
                          <div className="flex items-center gap-2 text-sm text-pink-100">
                            <Mail className="w-4 h-4" />
                            <span>{quote.customer.email}</span>
                          </div>
                        )}
                      {quote.customer.phone_number &&
                        quote.customer.phone_number !== "Chưa cập nhật" && (
                          <div className="flex items-center gap-2 text-sm text-pink-100">
                            <Phone className="w-4 h-4" />
                            <span>{quote.customer.phone_number}</span>
                          </div>
                        )}
                      {quote.customer.address &&
                        quote.customer.address !== "Chưa cập nhật" && (
                          <div className="flex items-center gap-2 text-sm text-pink-100">
                            <MapPin className="w-4 h-4" />
                            <span>{quote.customer.address}</span>
                          </div>
                        )}
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
                      <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
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
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-gray-500 text-sm font-medium">
                            Kích thước:
                          </span>
                          <div className="font-bold text-gray-900 text-lg">
                            {quote.cakeDesign.cake_size}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-gray-500 text-sm font-medium">
                            Yêu cầu đặc biệt:
                          </span>
                          <div className="font-bold text-gray-900 text-sm">
                            {quote.cakeDesign.special_requirements}
                          </div>
                        </div>
                      </div>
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
                        {quote.status === "accepted" &&
                          quote.myQuote.accepted_at && (
                            <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
                              <h6 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Thời gian chấp nhận:
                              </h6>
                              <p className="text-green-700 leading-relaxed">
                                {new Date(
                                  quote.myQuote.accepted_at
                                ).toLocaleString("vi-VN")}
                              </p>
                            </div>
                          )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewCakeQuote(quote.id)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Eye className="w-4 h-4 mr-2 inline" />
                            Xem chi tiết
                          </button>
                          {quote.status !== "accepted" &&
                            quote.status !== "closed" && (
                              <button
                                onClick={() => openQuoteModal(quote)}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-pink-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                <Edit3 className="w-4 h-4 mr-2 inline" />
                                Chỉnh sửa
                              </button>
                            )}
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
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleViewCakeQuote(quote.id)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Eye className="w-4 h-4 mr-2 inline" />
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => openQuoteModal(quote)}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Send className="w-5 h-5 mr-2 inline" />
                            Gửi báo giá
                          </button>
                        </div>
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
              <Search className="w-24 h-24 text-pink-300 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {selectedTab === "pending"
                  ? "Không có yêu cầu báo giá mới"
                  : selectedTab === "quoted"
                  ? "Chưa có báo giá nào được gửi"
                  : "Chưa có khách hàng nào chấp nhận báo giá"}
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {selectedTab === "pending"
                  ? "Hiện tại không có khách hàng nào đang tìm thợ làm bánh. Hãy kiểm tra lại sau!"
                  : selectedTab === "quoted"
                  ? "Bạn chưa gửi báo giá cho yêu cầu nào. Hãy bắt đầu bằng cách xem các yêu cầu mới!"
                  : "Chưa có khách hàng nào chấp nhận báo giá của bạn. Hãy tiếp tục gửi báo giá chất lượng!"}
              </p>
              {selectedTab === "pending" && (
                <button
                  onClick={fetchShopQuotes}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-white/50">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-3xl flex-shrink-0">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Customer & Cake Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 mb-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedRequest.customer.avatar}
                    alt={selectedRequest.customer.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-pink-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {selectedRequest.customer.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {selectedRequest.customer.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500 font-medium text-sm">
                      Bánh yêu cầu:
                    </span>
                    <div className="font-bold text-gray-900">
                      {selectedRequest.cakeDesign.title}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500 font-medium text-sm">
                      Ngày hết hạn:
                    </span>
                    <div className="font-bold text-red-700">
                      {formatDate(selectedRequest.cakeDesign.deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Giá báo (VND) *
                    </label>
                    <input
                      type="number"
                      value={quoteForm.price}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
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
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm"
                      placeholder="24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Thông điệp cho khách hàng *
                  </label>
                  <textarea
                    value={quoteForm.message}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, message: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm resize-none"
                    placeholder="Mô tả chi tiết về báo giá của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
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
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm resize-none"
                    placeholder="Liệt kê các nguyên liệu sẽ sử dụng..."
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex gap-4 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-3xl flex-shrink-0">
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
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={
                  selectedRequest.myQuote
                    ? handleUpdateQuote
                    : handleCreateQuote
                }
                className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
