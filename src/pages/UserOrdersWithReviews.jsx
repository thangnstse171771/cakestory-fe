import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Package,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Clock,
  Truck,
  Edit,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ReviewModal from "../components/ReviewModal";
import {
  createReview,
  updateReview,
  checkExistingReview,
} from "../api/reviews";
import axiosInstance from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const UserOrdersWithReviews = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [existingReviews, setExistingReviews] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const statusConfig = {
    pending: {
      label: "Đang chờ",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    ordered: {
      label: "Đã nhận",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    shipped: {
      label: "Đang giao",
      color: "bg-orange-100 text-orange-800",
      icon: Truck,
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800",
      icon: Clock,
    },
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/cake-orders/user/${user.id}`);
      const ordersData = response.data || [];

      setOrders(ordersData);

      // Check existing reviews for completed orders
      const completedOrders = ordersData.filter(
        (order) => order.status === "completed"
      );
      const reviewPromises = completedOrders.map((order) =>
        checkExistingReview(order.id).catch(() => null)
      );

      const reviewResults = await Promise.all(reviewPromises);
      const reviewsMap = {};

      completedOrders.forEach((order, index) => {
        const reviewData = reviewResults[index];

        // API trả về { reviews: [...], totalReviews: number }
        if (reviewData && reviewData.reviews && reviewData.reviews.length > 0) {
          // Lấy đánh giá đầu tiên (user chỉ có thể có 1 đánh giá per order)
          reviewsMap[order.id] = reviewData.reviews[0];
        }
      });

      setExistingReviews(reviewsMap);
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = (newReview) => {
    // Update existing reviews map
    setExistingReviews((prev) => ({
      ...prev,
      [selectedOrder.id]: newReview.review || newReview,
    }));

    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "Vừa xong";
    }
  };

  // Filter completed orders with search
  const filteredOrders = orders
    .filter((order) => order.status === "completed")
    .filter((order) => {
      if (searchTerm === "") return true;
      return (
        order.id.toString().includes(searchTerm) ||
        order.special_instructions
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const completedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng & đánh giá của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý đơn hàng và chia sẻ đánh giá về sản phẩm
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã đánh giá</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(existingReviews).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chưa đánh giá</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedOrders.length - Object.keys(existingReviews).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID đơn hàng hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Completed Orders - Ready for Review */}
        {completedOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Đơn hàng đã hoàn thành ({filteredOrders.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedOrders.map((order) => {
                const existingReview = existingReviews[order.id];
                const StatusIcon = statusConfig[order.status]?.icon || Package;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <StatusIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Đơn hàng #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatTimeAgo(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[order.status]?.color
                        }`}
                      >
                        {statusConfig[order.status]?.label}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="font-semibold text-lg text-green-600">
                          {parseFloat(order.total_price).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Kích thước:</span>
                        <span className="font-medium">{order.size}</span>
                      </div>

                      {order.special_instructions && (
                        <div>
                          <span className="text-gray-600">Ghi chú:</span>
                          <p className="text-gray-800 bg-gray-50 rounded-lg p-3 mt-1">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Review Section */}
                    <div className="border-t border-gray-200 pt-4">
                      {existingReview ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              Đã đánh giá
                            </span>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= existingReview.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                ({existingReview.rating}/5)
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {existingReview.comment}
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa đánh giá</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="p-6 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            <h4 className="font-medium text-gray-900 mb-2">
                              Chia sẻ trải nghiệm của bạn
                            </h4>
                            <p className="text-gray-600 text-sm mb-4">
                              Đánh giá sản phẩm để giúp người khác có quyết định
                              tốt hơn
                            </p>
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center space-x-2"
                            >
                              <Star className="w-5 h-5" />
                              <span>Viết đánh giá ngay</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                      <Link
                        to={`/order-tracking-user/${order.id}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </Link>

                      {order.marketplace_post_id && (
                        <Link
                          to={`/marketplace/product/${order.marketplace_post_id}`}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span>Xem sản phẩm</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-
                  {Math.min(endIndex, filteredOrders.length)} trong{" "}
                  {filteredOrders.length} đơn hàng
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNumber
                              ? "bg-pink-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Không tìm thấy đơn hàng đã hoàn thành
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Bạn chưa có đơn hàng hoàn thành nào để đánh giá"}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          marketplacePostId={selectedOrder.marketplace_post_id}
          existingReview={existingReviews[selectedOrder.id]}
          onReviewSubmitted={handleReviewSubmitted}
          productInfo={{
            title: `Đơn hàng #${selectedOrder.id}`,
            image: null, // Could fetch from marketplace post if needed
          }}
        />
      )}
    </div>
  );
};

export default UserOrdersWithReviews;
