import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Edit3, Trash2, CheckCircle } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { checkExistingReview, deleteReview } from "../api/reviews";

const ReviewButton = ({
  orderId,
  orderStatus,
  marketplacePostId,
  productInfo = {},
  onReviewChange,
}) => {
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (orderId && orderStatus === "completed") {
      checkForExistingReview();
    }
  }, [orderId, orderStatus]);

  const checkForExistingReview = async () => {
    try {
      setLoading(true);
      const response = await checkExistingReview(orderId);
      // API trả về { reviews: [...], totalReviews: number }
      const review =
        response?.reviews && response.reviews.length > 0
          ? response.reviews[0]
          : null;
      setExistingReview(review);
    } catch (error) {
      console.error("Error checking existing review:", error);
      setExistingReview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteReview(existingReview.id);
      setExistingReview(null);
      if (onReviewChange) {
        onReviewChange();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Có lỗi xảy ra khi xóa đánh giá!");
    } finally {
      setDeleting(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setExistingReview(newReview.review || newReview);
    if (onReviewChange) {
      onReviewChange();
    }
  };

  // Chỉ hiển thị nút đánh giá nếu đơn hàng đã hoàn thành
  if (orderStatus !== "completed") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Đánh giá sản phẩm
          </h3>
        </div>

        {existingReview ? (
          <div className="space-y-4">
            {/* Existing Review Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Bạn đã đánh giá sản phẩm này
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Đánh giá:</span>
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

                <div>
                  <span className="text-sm text-gray-600">Nhận xét:</span>
                  <p className="text-gray-800 mt-1 bg-white rounded-lg p-3 border">
                    {existingReview.comment}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Đánh giá vào:{" "}
                  {new Date(existingReview.created_at).toLocaleDateString(
                    "vi-VN"
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 justify-center"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa đánh giá</span>
              </button>

              <button
                onClick={handleDeleteReview}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{deleting ? "Đang xóa..." : "Xóa"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* No Review State */}
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Chia sẻ trải nghiệm của bạn
              </h4>
              <p className="text-gray-500 mb-4">
                Đánh giá sản phẩm để giúp người mua khác có quyết định tốt hơn
              </p>

              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Star className="w-5 h-5" />
                <span>Viết đánh giá</span>
              </button>
            </div>

            {/* Review Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Chia sẻ trải nghiệm</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Giúp shop cải thiện</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Hỗ trợ cộng đồng</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        orderId={orderId}
        marketplacePostId={marketplacePostId}
        existingReview={existingReview}
        onReviewSubmitted={handleReviewSubmitted}
        productInfo={productInfo}
      />
    </>
  );
};

export default ReviewButton;
