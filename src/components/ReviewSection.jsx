import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  User,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getReviewsByMarketplaceId } from "../api/reviews";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ReviewSection = ({ marketplacePostId, productInfo = {} }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest
  const [filterRating, setFilterRating] = useState("all"); // all, 5, 4, 3, 2, 1
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const reviewsPerPage = 5;

  useEffect(() => {
    fetchReviews();
  }, [marketplacePostId, sortBy, filterRating, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getReviewsByMarketplaceId(marketplacePostId);

      let filteredReviews = response.reviews || [];

      // Filter by rating
      if (filterRating !== "all") {
        filteredReviews = filteredReviews.filter(
          (review) => review.rating === parseInt(filterRating)
        );
      }

      // Sort reviews
      switch (sortBy) {
        case "newest":
          filteredReviews.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          break;
        case "oldest":
          filteredReviews.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          break;
        case "highest":
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case "lowest":
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        default:
          break;
      }

      setReviews(filteredReviews);
      setTotalReviews(response.totalReviews || 0);
      setTotalOrders(response.totalOrders || 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  // Paginate reviews
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = reviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-white border rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đánh giá từ khách hàng
            </h3>
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <div className="text-4xl font-bold text-yellow-500">
                {averageRating}
              </div>
              <div>
                {renderStars(Math.round(averageRating), "w-5 h-5")}
                <p className="text-sm text-gray-600 mt-1">
                  {totalReviews} đánh giá từ {totalOrders} đơn hàng
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating];
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Tất cả đánh giá ({reviews.length})
        </h4>

        <div className="flex items-center space-x-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Lọc</span>
          </button>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Lọc theo số sao:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterRating("all")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterRating === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tất cả
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating.toString())}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    filterRating === rating.toString()
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{rating}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.full_name || review.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {review.user?.full_name ||
                        review.user?.username ||
                        "Người dùng"}
                    </h5>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTimeAgo(review.created_at)}</span>
                      <span>•</span>
                      <span>Đơn hàng #{review.order_id}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Review Content */}
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-500">
              {filterRating !== "all"
                ? `Không có đánh giá ${filterRating} sao nào`
                : "Hãy là người đầu tiên đánh giá sản phẩm này!"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, reviews.length)} trong{" "}
            {reviews.length} đánh giá
          </div>

          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
