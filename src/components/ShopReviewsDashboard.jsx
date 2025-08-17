import React, { useState, useEffect } from "react";
import {
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Filter,
} from "lucide-react";
import { getReviewsByMarketplaceId, getReviewStats } from "../../api/reviews";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ShopReviewsDashboard = ({ shopId, marketplacePosts = [] }) => {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all"); // all, week, month, quarter
  const [selectedRating, setSelectedRating] = useState("all"); // all, 5, 4, 3, 2, 1
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentTrend: 0,
  });

  useEffect(() => {
    if (marketplacePosts.length > 0) {
      fetchAllReviews();
    }
  }, [marketplacePosts, selectedTimeRange, selectedRating]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const reviewPromises = marketplacePosts.map((post) =>
        getReviewsByMarketplaceId(post.id || post.post_id).catch((error) => {
          console.error(`Error fetching reviews for post ${post.id}:`, error);
          return { reviews: [], totalReviews: 0 };
        })
      );

      const reviewsData = await Promise.all(reviewPromises);

      // Combine all reviews
      let combinedReviews = [];
      reviewsData.forEach((data, index) => {
        if (data.reviews) {
          combinedReviews = [
            ...combinedReviews,
            ...data.reviews.map((review) => ({
              ...review,
              marketplace_post: marketplacePosts[index],
            })),
          ];
        }
      });

      // Apply time filter
      if (selectedTimeRange !== "all") {
        const now = new Date();
        const timeThresholds = {
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          quarter: 90 * 24 * 60 * 60 * 1000,
        };

        const threshold = timeThresholds[selectedTimeRange];
        if (threshold) {
          combinedReviews = combinedReviews.filter((review) => {
            const reviewDate = new Date(review.created_at);
            return now - reviewDate <= threshold;
          });
        }
      }

      // Apply rating filter
      if (selectedRating !== "all") {
        combinedReviews = combinedReviews.filter(
          (review) => review.rating === parseInt(selectedRating)
        );
      }

      // Sort by newest first
      combinedReviews.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setAllReviews(combinedReviews);
      calculateStats(combinedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviews) => {
    if (reviews.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recentTrend: 0,
      });
      return;
    }

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    // Calculate trend (compare last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = reviews.filter((review) => {
      const reviewDate = new Date(review.created_at);
      return now - reviewDate <= 7 * 24 * 60 * 60 * 1000;
    });
    const previous7Days = reviews.filter((review) => {
      const reviewDate = new Date(review.created_at);
      const timeDiff = now - reviewDate;
      return (
        timeDiff > 7 * 24 * 60 * 60 * 1000 &&
        timeDiff <= 14 * 24 * 60 * 60 * 1000
      );
    });

    const recentAvg =
      last7Days.length > 0
        ? last7Days.reduce((sum, review) => sum + review.rating, 0) /
          last7Days.length
        : 0;
    const previousAvg =
      previous7Days.length > 0
        ? previous7Days.reduce((sum, review) => sum + review.rating, 0) /
          previous7Days.length
        : 0;

    const recentTrend =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    setStats({
      totalReviews,
      averageRating,
      ratingDistribution,
      recentTrend,
    });
  };

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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Đánh giá khách hàng
        </h2>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">90 ngày qua</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-500" />
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả rating</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReviews}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Điểm trung bình</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">5 sao</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.ratingDistribution[5]}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalReviews > 0
                  ? `${(
                      (stats.ratingDistribution[5] / stats.totalReviews) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Xu hướng (7 ngày)</p>
              <div className="flex items-center space-x-1">
                <p
                  className={`text-2xl font-bold ${
                    stats.recentTrend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.recentTrend >= 0 ? "+" : ""}
                  {stats.recentTrend.toFixed(1)}%
                </p>
                <TrendingUp
                  className={`w-4 h-4 ${
                    stats.recentTrend >= 0
                      ? "text-green-600"
                      : "text-red-600 rotate-180"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phân bố đánh giá
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating];
            const percentage =
              stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 w-12">{count}</div>
                <div className="text-sm text-gray-500 w-12">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Đánh giá gần đây{" "}
          {selectedTimeRange !== "all" && `(${selectedTimeRange})`}
        </h3>

        {allReviews.length > 0 ? (
          <div className="space-y-4">
            {allReviews.slice(0, 10).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.full_name || review.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.user?.full_name ||
                          review.user?.username ||
                          "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(review.created_at)} • Đơn #
                        {review.order_id}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 text-sm mb-2">{review.comment}</p>

                {review.marketplace_post && (
                  <p className="text-xs text-gray-500">
                    Sản phẩm:{" "}
                    {review.marketplace_post.title ||
                      review.marketplace_post.name}
                  </p>
                )}
              </div>
            ))}

            {allReviews.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Và {allReviews.length - 10} đánh giá khác...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá
            </h4>
            <p className="text-gray-500">
              {selectedTimeRange !== "all" || selectedRating !== "all"
                ? "Không có đánh giá nào phù hợp với bộ lọc đã chọn"
                : "Chưa có khách hàng nào đánh giá sản phẩm của bạn"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopReviewsDashboard;
