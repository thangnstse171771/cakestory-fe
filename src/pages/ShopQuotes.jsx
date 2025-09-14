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
} from "lucide-react";

// Mock data for shop quotes (from shop's perspective)
const mockShopQuotes = [
  {
    id: 1,
    customer: {
      id: 101,
      name: "Nguyễn Thị Mai",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      location: "Quận 1, TP.HCM",
      phone: "0987 123 456",
      email: "mai.nguyen@email.com",
    },
    cakeDesign: {
      id: 201,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      title: "Bánh kem sinh nhật 3 tầng",
      description: "Bánh kem hình tròn 3 tầng với frosting màu hồng và trang trí hoa tươi. Cần hoàn thành trong 3 ngày.",
      created_at: "2025-09-12T10:30:00Z",
      deadline: "2025-09-15T23:59:00Z",
      budget: "700,000 - 1,000,000 VND",
    },
    status: "pending", // pending, quoted, accepted, rejected, completed
    myQuote: null, // will be set when shop quotes
    created_at: "2025-09-12T10:30:00Z",
  },
  {
    id: 2,
    customer: {
      id: 102,
      name: "Trần Văn Minh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      location: "Quận 7, TP.HCM",
      phone: "0912 345 678",
      email: "minh.tran@email.com",
    },
    cakeDesign: {
      id: 202,
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400",
      title: "Bánh cưới 2 tầng",
      description: "Bánh cưới sang trọng với hoa tươi và trang trí tinh tế. Phong cách cổ điển, màu trắng hồng.",
      created_at: "2025-09-10T15:20:00Z",
      deadline: "2025-09-20T23:59:00Z",
      budget: "1,200,000 - 1,800,000 VND",
    },
    status: "quoted",
    myQuote: {
      price: 1450000,
      estimatedTime: "5-7 ngày",
      message: "Chúng tôi chuyên về bánh cưới cao cấp. Sẽ sử dụng nguyên liệu nhập khẩu và hoa tươi thật. Đảm bảo chất lượng và đúng deadline.",
      created_at: "2025-09-11T09:15:00Z",
      validUntil: "2025-09-18T23:59:00Z",
    },
    created_at: "2025-09-10T15:20:00Z",
  },
  {
    id: 3,
    customer: {
      id: 103,
      name: "Lê Thị Hoa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      location: "Quận 3, TP.HCM",
      phone: "0987 654 321",
      email: "hoa.le@email.com",
    },
    cakeDesign: {
      id: 203,
      image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400",
      title: "Bánh sinh nhật trẻ em",
      description: "Bánh vui nhộn cho bé gái 5 tuổi với nhân vật hoạt hình. Cần giao tận nhà.",
      created_at: "2025-09-08T08:45:00Z",
      deadline: "2025-09-12T23:59:00Z",
      budget: "400,000 - 600,000 VND",
    },
    status: "accepted",
    myQuote: {
      price: 520000,
      estimatedTime: "2 ngày",
      message: "Chúng tôi có kinh nghiệm làm bánh cho trẻ em. Sẽ làm theo đúng yêu cầu và đảm bảo an toàn vệ sinh thực phẩm.",
      created_at: "2025-09-08T14:30:00Z",
      validUntil: "2025-09-15T23:59:00Z",
    },
    created_at: "2025-09-08T08:45:00Z",
  },
  {
    id: 4,
    customer: {
      id: 104,
      name: "Phạm Văn Đức",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      location: "Quận Bình Thạnh, TP.HCM",
      phone: "0918 765 432",
      email: "duc.pham@email.com",
    },
    cakeDesign: {
      id: 204,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      title: "Bánh kem mừng tốt nghiệp",
      description: "Bánh kem hình cuốn sách mở với chủ đề tốt nghiệp. Màu xanh dương và vàng.",
      created_at: "2025-09-13T11:00:00Z",
      deadline: "2025-09-18T23:59:00Z",
      budget: "800,000 - 1,200,000 VND",
    },
    status: "rejected",
    myQuote: {
      price: 950000,
      estimatedTime: "4 ngày",
      message: "Chúng tôi có thể làm bánh theo thiết kế này với chất lượng cao.",
      created_at: "2025-09-13T16:45:00Z",
      validUntil: "2025-09-20T23:59:00Z",
    },
    created_at: "2025-09-13T11:00:00Z",
  },
];

const ShopQuotes = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    price: "",
    estimatedTime: "",
    message: "",
  });
  const [shopQuotes, setShopQuotes] = useState(mockShopQuotes);

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

  const handleQuoteSubmit = () => {
    if (!selectedRequest || !quoteForm.price || !quoteForm.estimatedTime) {
      alert("Vui lòng điền đầy đủ thông tin báo giá");
      return;
    }

    // Update the quote in mock data
    const updatedQuotes = shopQuotes.map((quote) => {
      if (quote.id === selectedRequest.id) {
        return {
          ...quote,
          status: "quoted",
          myQuote: {
            price: parseInt(quoteForm.price.replace(/[^\d]/g, "")),
            estimatedTime: quoteForm.estimatedTime,
            message: quoteForm.message,
            created_at: new Date().toISOString(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
      }
      return quote;
    });

    setShopQuotes(updatedQuotes);
    setShowQuoteModal(false);
    setSelectedRequest(null);
    setQuoteForm({ price: "", estimatedTime: "", message: "" });
    alert("Đã gửi báo giá thành công!");
  };

  const handleAcceptQuote = (quoteId) => {
    const updatedQuotes = shopQuotes.map((quote) => {
      if (quote.id === quoteId) {
        return { ...quote, status: "accepted" };
      }
      return quote;
    });
    setShopQuotes(updatedQuotes);
    alert("Đã chấp nhận yêu cầu!");
  };

  const handleRejectQuote = (quoteId) => {
    const updatedQuotes = shopQuotes.map((quote) => {
      if (quote.id === quoteId) {
        return { ...quote, status: "rejected" };
      }
      return quote;
    });
    setShopQuotes(updatedQuotes);
    alert("Đã từ chối yêu cầu!");
  };

  const openQuoteModal = (request) => {
    setSelectedRequest(request);
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-100 px-6 py-4 sticky top-0 z-50">
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
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
                Yêu cầu thiết kế
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý đơn hàng từ khách hàng
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
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ báo giá</p>
                <p className="text-2xl font-bold text-blue-600">
                  {shopQuotes.filter(q => q.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã báo giá</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {shopQuotes.filter(q => q.status === "quoted").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã chấp nhận</p>
                <p className="text-2xl font-bold text-green-600">
                  {shopQuotes.filter(q => q.status === "accepted").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(
                    shopQuotes
                      .filter(q => q.status === "accepted" || q.status === "completed")
                      .reduce((sum, q) => sum + (q.myQuote?.price || 0), 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { id: "pending", label: "Chờ báo giá", count: shopQuotes.filter(q => q.status === "pending").length },
            { id: "quoted", label: "Đã báo giá", count: shopQuotes.filter(q => q.status === "quoted").length },
            { id: "accepted", label: "Đã chấp nhận", count: shopQuotes.filter(q => q.status === "accepted").length },
            { id: "all", label: "Tất cả", count: shopQuotes.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.id
                  ? "bg-white text-green-600 shadow-md"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredQuotes.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Customer and Design Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                <div className="flex items-start gap-4">
                  <img
                    src={request.customer.avatar}
                    alt={request.customer.name}
                    className="w-16 h-16 rounded-full border-4 border-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {request.customer.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-green-100">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.customer.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status === "pending" && "Chờ báo giá"}
                        {request.status === "quoted" && "Đã báo giá"}
                        {request.status === "accepted" && "Đã chấp nhận"}
                        {request.status === "rejected" && "Đã từ chối"}
                        {request.status === "completed" && "Hoàn thành"}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm text-green-100">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {request.customer.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {request.customer.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cake Design Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Design Image and Info */}
                  <div className="space-y-4">
                    <img
                      src={request.cakeDesign.image}
                      alt={request.cakeDesign.title}
                      className="w-full h-48 object-cover rounded-xl shadow-sm"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {request.cakeDesign.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {request.cakeDesign.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-700 mb-1">Deadline</div>
                          <div className="text-gray-600">{formatDate(request.cakeDesign.deadline)}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-700 mb-1">Ngân sách</div>
                          <div className="text-gray-600">{request.cakeDesign.budget}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Section */}
                  <div className="space-y-4">
                    {request.myQuote ? (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                        <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2" />
                          Báo giá của bạn
                        </h5>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Giá</div>
                            <div className="font-bold text-green-700">
                              {formatPrice(request.myQuote.price)}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Thời gian</div>
                            <div className="font-bold text-blue-700">
                              {request.myQuote.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {request.myQuote.message}
                        </p>
                        <div className="text-xs text-gray-500">
                          Báo giá lúc: {formatDate(request.myQuote.created_at)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h5 className="font-medium text-gray-600 mb-2">
                          Chưa có báo giá
                        </h5>
                        <p className="text-sm text-gray-500">
                          Gửi báo giá để khách hàng xem xét
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <button
                          onClick={() => openQuoteModal(request)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2 inline" />
                          Gửi báo giá
                        </button>
                      )}

                      {request.status === "quoted" && (
                        <>
                          <button
                            onClick={() => handleAcceptQuote(request.id)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => handleRejectQuote(request.id)}
                            className="px-4 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2 inline" />
                            Từ chối
                          </button>
                        </>
                      )}

                      {request.status === "accepted" && (
                        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors">
                          <Eye className="w-4 h-4 mr-2 inline" />
                          Theo dõi đơn hàng
                        </button>
                      )}

                      <button className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Nhắn tin
                      </button>
                    </div>
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
              Không tìm thấy yêu cầu nào
            </h3>
            <p className="text-gray-500">
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc
            </p>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Gửi báo giá
                </h3>
                <p className="text-gray-600">
                  Đề xuất giá và thời gian thực hiện cho yêu cầu này
                </p>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={selectedRequest.customer.avatar}
                    alt={selectedRequest.customer.name}
                    className="w-10 h-10 rounded-full"
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
                <p className="text-sm text-gray-700">
                  {selectedRequest.cakeDesign.title}
                </p>
              </div>

              {/* Quote Form */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá báo (VND) *
                    </label>
                    <input
                      type="text"
                      value={quoteForm.price}
                      onChange={(e) => setQuoteForm({...quoteForm, price: e.target.value})}
                      placeholder="Ví dụ: 850000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian thực hiện *
                    </label>
                    <input
                      type="text"
                      value={quoteForm.estimatedTime}
                      onChange={(e) => setQuoteForm({...quoteForm, estimatedTime: e.target.value})}
                      placeholder="Ví dụ: 3-4 ngày"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông điệp cho khách hàng
                  </label>
                  <textarea
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                    placeholder="Mô tả chi tiết về báo giá, nguyên liệu, quy trình..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleQuoteSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2 inline" />
                  Gửi báo giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopQuotes;
