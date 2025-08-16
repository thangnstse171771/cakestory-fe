import axiosInstance from "./axios";

// Lấy thống kê khách hàng của shop
export const fetchShopCustomers = async (shopId) => {
  try {
    const response = await axiosInstance.get(`/shops/${shopId}/customers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop customers:", error);
    throw error;
  }
};

// Lấy thống kê đơn hàng của shop
export const fetchShopOrderStats = async (shopId) => {
  try {
    const response = await axiosInstance.get(`/shops/${shopId}/orderStats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop order stats:", error);
    throw error;
  }
};

// Lấy thống kê doanh thu của shop
export const fetchShopRevenue = async (shopId) => {
  try {
    const response = await axiosInstance.get(`/shops/${shopId}/revenue`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop revenue:", error);
    throw error;
  }
};

// Lấy thống kê doanh thu theo tháng của shop
export const fetchShopMonthlyRevenue = async (shopId) => {
  try {
    const response = await axiosInstance.get(`/shops/${shopId}/revenue/month`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop monthly revenue:", error);
    throw error;
  }
};
