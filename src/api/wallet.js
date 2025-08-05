import axiosInstance from "./axios";

// Wallet API services
export const walletAPI = {
  // 1. Tạo yêu cầu nạp tiền (Deposit Request)
  createDepositRequest: async (amount) => {
    try {
      console.log("Tạo yêu cầu nạp tiền với amount:", amount);
      const response = await axiosInstance.post("/wallet/deposit", { amount });
      console.log("Response từ /wallet/deposit:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo yêu cầu nạp tiền:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // 2. Lấy số dư ví
  getBalance: async () => {
    try {
      console.log("Lấy số dư ví...");
      const response = await axiosInstance.get("/wallet/balance");
      console.log("Response từ /wallet/balance:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy số dú ví:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // 3. Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (orderId) => {
    try {
      console.log("Kiểm tra trạng thái thanh toán cho orderId:", orderId);
      const response = await axiosInstance.get(
        `/wallet/payment-status/${orderId}`
      );
      console.log("Payment status response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // 4. Xử lý PayOS webhook (thường được gọi từ backend)
  handlePayOSWebhook: async (webhookData, signature) => {
    try {
      console.log("Xử lý PayOS webhook:", webhookData);
      const response = await axiosInstance.post(
        "/wallet/payos-webhook",
        webhookData,
        {
          headers: {
            "x-payos-signature": signature,
          },
        }
      );
      console.log("PayOS webhook response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xử lý PayOS webhook:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  // 5. Test webhook endpoint (dùng để PayOS validate URL)
  testWebhookEndpoint: async () => {
    try {
      console.log("Test PayOS webhook endpoint...");
      const response = await axiosInstance.get("/wallet/payos-webhook");
      console.log("Webhook test response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi test webhook endpoint:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },
};

// Export individual functions để backward compatibility
export const {
  createDepositRequest: depositToWallet,
  getBalance: fetchWalletBalance,
  checkPaymentStatus,
  handlePayOSWebhook,
  testWebhookEndpoint: getPayOSWebhook,
} = walletAPI;
