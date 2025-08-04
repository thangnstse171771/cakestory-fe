import axios from "axios";

const baseURL = "https://cakestory-be.onrender.com/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

export const fetchAllUsers = async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const fetchAllShops = async () => {
  const response = await axiosInstance.get("/shops");
  return response.data;
};

export const deactivateShop = async (userId) => {
  const response = await axiosInstance.delete(`/shops/${userId}`);
};
export const createShop = async (shopData) => {
  const response = await axiosInstance.post("/shops", shopData);
  return response.data;
};

export const fetchShopByUserId = async (userId) => {
  const response = await axiosInstance.get(`/shops/${userId}`);
  return response.data;
};

export const updateShopByUserId = async (userId, data) => {
  const response = await axiosInstance.put(`/shops/${userId}`, data);
  return response.data;
};

export const fetchMarketplacePosts = async () => {
  // Lấy token từ localStorage nếu có
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(
    "/marketplace-posts",
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      : undefined
  );
  return response.data;
};

export const createMarketplacePost = async (data) => {
  // Lấy token từ localStorage (nếu chưa có sẵn trong axiosInstance)
  const token = localStorage.getItem("token");
  const response = await axiosInstance.post(
    "/marketplace-posts",
    data,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            accept: "*/*",
          },
        }
      : undefined
  );
  return response.data;
};

export const updateMarketplacePost = async (postId, data) => {
  const response = await axiosInstance.put(
    `/marketplace-posts/${postId}`,
    data
  );
  return response.data;
};

export const deleteMarketplacePost = async (postId) => {
  const response = await axiosInstance.delete(`/marketplace-posts/${postId}`);
  return response.data;
};

export const depositToWallet = async (amount) => {
  try {
    console.log("Gửi yêu cầu nạp tiền với amount:", amount);
    const response = await axiosInstance.post("/wallet/deposit", { amount });
    console.log("Response từ /wallet/deposit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi depositToWallet:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const fetchWalletBalance = async () => {
  try {
    console.log("Gọi API fetchWalletBalance...");
    const response = await axiosInstance.get("/wallet/balance");
    console.log("API response từ /wallet/balance:", response);
    console.log("Response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchWalletBalance:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const fetchWalletBalanceByUserId = async (userId) => {
  const response = await axiosInstance.get(`/wallet/balance/${userId}`);
  return response.data;
};

// PayOS webhook để xử lý callback thanh toán
export const handlePayOSWebhook = async (webhookData, signature) => {
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
};

// Lấy thông tin PayOS webhook
export const getPayOSWebhook = async () => {
  try {
    console.log("Gọi API getPayOSWebhook...");
    const response = await axiosInstance.get("/wallet/payos-webhook");
    console.log("PayOS webhook response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getPayOSWebhook:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán qua deposit record
export const checkDepositStatus = async (depositCode) => {
  try {
    console.log("Kiểm tra trạng thái deposit cho depositCode:", depositCode);
    const response = await axiosInstance.get(
      `/wallet/deposit-status/${depositCode}`
    );
    console.log("Deposit status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra deposit status:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (orderId) => {
  try {
    console.log("Kiểm tra trạng thái thanh toán cho orderId:", orderId);
    const response = await axiosInstance.get(
      `/wallet/payment-status/${orderId}`
    );
    console.log("Payment status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra payment status:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const joinChallenge = async (challengeId) => {
  const response = await axiosInstance.post("/challenge-entries", {
    challenge_id: challengeId,
    user_id: JSON.parse(localStorage.getItem("user"))?.id,
  });
  return response.data;
};
