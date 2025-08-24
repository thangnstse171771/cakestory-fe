import axiosInstance from "./axios";

/**
 * API service for Reviews management
 */

// Tạo đánh giá mới cho một đơn hàng đã hoàn thành
export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post("/reviews", reviewData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// Lấy tất cả đánh giá của một marketplace post
export const getReviewsByMarketplaceId = async (marketplaceId) => {
  try {
    const response = await axiosInstance.get(
      `/reviews/marketplace/${marketplaceId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// Lấy đánh giá theo user ID
export const getReviewsByUserId = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

// Cập nhật đánh giá
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axiosInstance.put(
      `/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Kiểm tra xem user đã đánh giá cho order này chưa
export const checkExistingReview = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/reviews/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking existing review:", error);
    throw error;
  }
};

// Lấy thống kê đánh giá cho marketplace post
export const getReviewStats = async (marketplaceId) => {
  try {
    const response = await axiosInstance.get(`/reviews/stats/${marketplaceId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw error;
  }
};
