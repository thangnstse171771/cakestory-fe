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

// Mock data for cake quotes
const mockCakeQuotes = [
  {
    id: 1,
    cakeDesign: {
      id: 101,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      title: "Bánh kem sinh nhật 3 tầng",
      description:
        "Bánh kem hình tròn 3 tầng với frosting màu hồng và trang trí hoa tươi",
      created_at: "2025-09-10T10:30:00Z",
    },
    quotes: [
      {
        id: 201,
        shop: {
          id: 301,
          name: "Sweet Dreams Bakery",
          avatar:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100",
          rating: 4.8,
          reviewCount: 156,
          location: "Quận 1, TP.HCM",
          distance: "2.3km",
          phone: "0123 456 789",
          email: "contact@sweetdreams.vn",
        },
        price: 850000,
        estimatedTime: "3-4 ngày",
        status: "pending", // pending, accepted, rejected, completed
        message:
          "Chúng tôi có thể làm bánh theo đúng thiết kế của bạn với nguyên liệu cao cấp. Sẽ hoàn thành trong 3-4 ngày làm việc.",
        created_at: "2025-09-12T14:20:00Z",
        validUntil: "2025-09-20T23:59:00Z",
      },
      {
        id: 202,
        shop: {
          id: 302,
          name: "Cake Paradise",
          avatar:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100",
          rating: 4.6,
          reviewCount: 89,
          location: "Quận 3, TP.HCM",
          distance: "4.1km",
          phone: "0987 654 321",
          email: "info@cakeparadise.vn",
        },
        price: 720000,
        estimatedTime: "2-3 ngày",
        status: "accepted",
        message:
          "Chào bạn! Chúng tôi rất thích thiết kế này. Giá cả cạnh tranh và chất lượng đảm bảo.",
        created_at: "2025-09-11T09:15:00Z",
        validUntil: "2025-09-18T23:59:00Z",
      },
      {
        id: 203,
        shop: {
          id: 303,
          name: "Artisan Cakes",
          avatar:
            "https://images.unsplash.com/photo-1556909114-4c36e03f4b3f?w=100",
          rating: 4.9,
          reviewCount: 203,
          location: "Quận 7, TP.HCM",
          distance: "6.8km",
          phone: "0912 345 678",
          email: "hello@artisancakes.vn",
        },
        price: 950000,
        estimatedTime: "4-5 ngày",
        status: "rejected",
        message:
          "Xin lỗi, hiện tại chúng tôi đang quá tải đơn hàng nên không thể nhận thêm.",
        created_at: "2025-09-13T16:45:00Z",
        validUntil: "2025-09-21T23:59:00Z",
      },
    ],
    status: "active", // active, completed, cancelled
  },
  {
    id: 2,
    cakeDesign: {
      id: 102,
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400",
      title: "Bánh cưới 2 tầng",
      description: "Bánh cưới sang trọng với hoa tươi và trang trí tinh tế",
      created_at: "2025-09-08T15:20:00Z",
    },
    quotes: [
      {
        id: 204,
        shop: {
          id: 304,
          name: "Royal Wedding Cakes",
          avatar:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100",
          rating: 4.7,
          reviewCount: 124,
          location: "Quận 2, TP.HCM",
          distance: "3.5km",
          phone: "0123 987 654",
          email: "wedding@royalcakes.vn",
        },
        price: 1200000,
        estimatedTime: "5-7 ngày",
        status: "pending",
        message:
          "Chúng tôi chuyên về bánh cưới cao cấp. Sẽ sử dụng nguyên liệu nhập khẩu và hoa tươi thật.",
        created_at: "2025-09-09T11:30:00Z",
        validUntil: "2025-09-25T23:59:00Z",
      },
    ],
    status: "active",
  },
  {
    id: 3,
    cakeDesign: {
      id: 103,
      image:
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400",
      title: "Bánh sinh nhật trẻ em",
      description: "Bánh vui nhộn cho bé với nhân vật hoạt hình",
      created_at: "2025-09-05T08:45:00Z",
    },
    quotes: [
      {
        id: 205,
        shop: {
          id: 305,
          name: "Kids Cake Corner",
          avatar:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100",
          rating: 4.5,
          reviewCount: 78,
          location: "Quận 4, TP.HCM",
          distance: "5.2km",
          phone: "0987 123 456",
          email: "kids@kidscakecorner.vn",
        },
        price: 450000,
        estimatedTime: "2 ngày",
        status: "completed",
        message:
          "Đã hoàn thành! Bánh rất đẹp và bé rất thích. Cảm ơn bạn đã tin tưởng!",
        created_at: "2025-09-06T10:00:00Z",
        validUntil: "2025-09-12T23:59:00Z",
      },
    ],
    status: "completed",
  },
];

const CakeQuotes = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [cakeQuotes, setCakeQuotes] = useState(mockCakeQuotes);

  // Filter quotes based on search and status
  const filteredQuotes = cakeQuotes.filter((quote) => {
    const matchesSearch =
      quote.cakeDesign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quotes.some((q) =>
        q.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

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
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotes List */}
              <div className="p-6">
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
                                  {quote.shop.rating} ({quote.shop.reviewCount})
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {quote.shop.location} • {quote.shop.distance}
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
                                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors">
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
