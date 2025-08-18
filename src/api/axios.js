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
  return response.data;
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

// Lấy lịch sử giao dịch của user
export const fetchWalletHistory = async () => {
  try {
    console.log("Gọi API fetchWalletHistory...");
    const response = await axiosInstance.get("/wallet/AllDepositHistoryUser");
    console.log("Wallet history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchWalletHistory:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Tạo yêu cầu rút tiền
export const createWithdrawRequest = async (
  amount,
  bankName,
  accountNumber
) => {
  try {
    console.log("Tạo yêu cầu rút tiền:", { amount, bankName, accountNumber });
    const response = await axiosInstance.post("/wallet/withdraw", {
      amount,
      bank_name: bankName,
      account_number: accountNumber,
    });
    console.log("Withdraw request response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu rút tiền:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy lịch sử yêu cầu rút tiền của user
export const fetchWithdrawHistory = async () => {
  try {
    console.log("Gọi API fetchWithdrawHistory...");
    const response = await axiosInstance.get("/wallet/withdrawAll-historyUser");
    console.log("Withdraw history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchWithdrawHistory:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy thông tin yêu cầu rút tiền cụ thể theo ID
export const fetchWithdrawRequestById = async (id) => {
  try {
    console.log("Gọi API fetchWithdrawRequestById với id:", id);
    const response = await axiosInstance.get(
      `/wallet/withdraw-historyAdmin/${id}`
    );
    console.log("Withdraw request by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchWithdrawRequestById:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy tất cả lịch sử rút tiền
export const fetchAllWithdrawHistory = async () => {
  try {
    console.log("Gọi API fetchAllWithdrawHistory...");
    const response = await axiosInstance.get(
      "/wallet/withdrawAll-historyAdmin"
    );
    console.log("All withdraw history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchAllWithdrawHistory:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy lịch sử rút tiền cụ thể theo ID user
export const fetchWithdrawHistoryByUserId = async (userId) => {
  try {
    console.log("Gọi API fetchWithdrawHistoryByUserId với userId:", userId);
    const response = await axiosInstance.get(
      `/wallet/withdraw-historyUserId/${userId}`
    );
    console.log("Withdraw history by user ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchWithdrawHistoryByUserId:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Duyệt yêu cầu rút tiền
export const confirmWithdrawRequest = async (withdrawId) => {
  try {
    if (!withdrawId) throw new Error("Thiếu withdrawId");
    console.log("Confirm withdraw:", withdrawId);
    const response = await axiosInstance.put(
      `/wallet/confirmRequestByAdmin/${withdrawId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Confirm withdraw failed:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

export const cancelWithdrawRequest = async (withdrawId) => {
  try {
    if (!withdrawId) throw new Error("Thiếu withdrawId");
    console.log("Reject withdraw by admin:", withdrawId);
    const response = await axiosInstance.put(
      `/wallet/rejectRequestbyAdmin/${withdrawId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Reject withdraw failed:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Lấy tổng số tiền chờ rút của user hiện tại
export const fetchTotalPendingWithdraw = async () => {
  try {
    console.log("Gọi API fetchTotalPendingWithdraw...");
    const response = await axiosInstance.get("/wallet/totalWithdrawUser");
    console.log("Total pending withdraw response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchTotalPendingWithdraw:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy tổng số dư ví admin
export const fetchAdminWalletBalance = async () => {
  try {
    console.log("Gọi API fetchAdminWalletBalance...");
    const response = await axiosInstance.get("/wallet/AdminWallet");
    console.log("Admin wallet balance response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchAdminWalletBalance:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy tất cả ví của user
export const fetchAllUserWallets = async () => {
  try {
    console.log("Gọi API fetchAllUserWallets...");
    const response = await axiosInstance.get("/wallet/allWalletAdmin");
    console.log("All user wallets response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchAllUserWallets:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy tổng số dư ví hệ thống (tạm giữ tiền của tất cả user)
export const fetchSystemWalletBalance = async () => {
  try {
    console.log("Gọi API fetchSystemWalletBalance...");
    const response = await axiosInstance.get("/wallet/allDepositsAdmin", {
      params: {
        page: 1,
        limit: 1, // Chỉ cần lấy summary, không cần data
      },
    });
    console.log("System wallet balance response:", response.data);

    // Lấy completed_amount từ summary thay vì tính từ user wallets
    const completedAmount = response.data?.data?.summary?.completed_amount || 0;
    const totalDeposits = response.data?.data?.summary?.total_deposits || 0;

    console.log("Completed amount from summary:", completedAmount);
    console.log("Total deposits:", totalDeposits);

    return {
      totalSystemBalance: parseFloat(completedAmount),
      totalDeposits: totalDeposits,
      summary: response.data?.data?.summary || {},
    };
  } catch (error) {
    console.error("Lỗi khi gọi fetchSystemWalletBalance:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy thông tin ví của user cụ thể theo ID
export const fetchUserWalletById = async (userId) => {
  try {
    console.log("Gọi API fetchUserWalletById với userId:", userId);
    const response = await axiosInstance.get(
      `/wallet/getUserWalletbyId/${userId}`
    );
    console.log("User wallet by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchUserWalletById:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Admin: Lấy tất cả giao dịch nạp tiền (fetch all không pagination)
export const fetchAllDepositsAdmin = async (filters = {}) => {
  try {
    console.log("Gọi API fetchAllDepositsAdmin với filters:", filters);
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 999999,
    };
    if (filters.status) params.status = filters.status;
    if (filters.user_id) params.user_id = filters.user_id;
    const response = await axiosInstance.get("/wallet/allDepositsAdmin", {
      params,
    });
    console.log("All deposits response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchAllDepositsAdmin:", error);
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

// Admin: Lấy tổng doanh thu từ AI Generation
export const fetchTotalAmountAiGenerate = async () => {
  try {
    console.log("Gọi API fetchTotalAmountAiGenerate...");
    const response = await axiosInstance.get("/ai/totalAmountAiGenerate");
    console.log("Total AI revenue response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchTotalAmountAiGenerate:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy chi tiết order theo ID
export const fetchOrderById = async (orderId) => {
  try {
    console.log("Gọi API fetchOrderById với orderId:", orderId);
    const response = await axiosInstance.get(`/cake-orders/${orderId}`);
    console.log("Order detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchOrderById:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy danh sách orders của shop
export const fetchShopOrders = async (shopId) => {
  try {
    console.log("Gọi API fetchShopOrders với shopId:", shopId);
    const response = await axiosInstance.get(`/cake-orders/shop/${shopId}`);
    console.log("Shop orders response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchShopOrders:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy tất cả orders (admin)
export const fetchAllOrders = async () => {
  try {
    const response = await axiosInstance.get("/cake-orders");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả orders:", error);
    throw error;
  }
};

// Lấy orders theo user (customer)
export const fetchUserOrders = async (userId) => {
  try {
    if (!userId) throw new Error("Thiếu userId");
    const response = await axiosInstance.get(`/cake-orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy orders theo user:", error);
    throw error;
  }
};

// Lấy orders theo shop (nếu cần dùng endpoint chuẩn thay vì fetchShopOrders cũ)
export const fetchOrdersByShopId = async (shopId) => {
  try {
    if (!shopId) throw new Error("Thiếu shopId");
    const response = await axiosInstance.get(`/cake-orders/shop/${shopId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy orders theo shop:", error);
    throw error;
  }
};

// Cập nhật trạng thái order
export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log("Cập nhật trạng thái order:", { orderId, status });
    let endpoint = "";
    switch (status) {
      case "ordered":
        endpoint = `/cake-orders/${orderId}/ordered`;
        break;
      case "preparedForDelivery":
      case "prepared":
        endpoint = `/cake-orders/${orderId}/prepared`;
        break;
      case "shipped":
        endpoint = `/cake-orders/${orderId}/ship`;
        break;
      case "completed":
        endpoint = `/cake-orders/${orderId}/complete`;
        break;
      case "cancelled":
        endpoint = `/cake-orders/${orderId}/cancel`;
        break;
      default:
        throw new Error("Trạng thái không hợp lệ");
    }
    const response = await axiosInstance.put(endpoint, {});
    console.log("Update order status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái order:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Tạo complaint mới
export const createComplaint = async (complaintData) => {
  try {
    console.log("Tạo complaint:", complaintData);
    const response = await axiosInstance.post("/complaints", complaintData);
    console.log("Create complaint response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo complaint:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy complaints của một shop
export const fetchComplaintsByShop = async (shopId) => {
  try {
    if (!shopId) throw new Error("Thiếu shopId");
    const res = await axiosInstance.get(`/complaints/shop/${shopId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy complaints theo shop:", error);
    throw error;
  }
};

export const fetchComplaintsByCustomer = async (customerId) => {
  try {
    if (!customerId) throw new Error("Thiếu customerId");
    const res = await axiosInstance.get(`/complaints/customer/${customerId}`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.complaints)) return data.complaints;
    return [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Lỗi khi lấy complaints theo customer:", error);
    throw error;
  }
};

export const fetchComplaintById = async (complaintId) => {
  try {
    if (!complaintId) throw new Error("Thiếu complaintId");
    const res = await axiosInstance.get(`/complaints/${complaintId}`);
    return res.data;
  } catch (error) {
    console.warn(
      "fetchComplaintById thất bại:",
      complaintId,
      error.response?.status
    );
    throw error;
  }
};

// Admin: lấy tất cả complaints
export const fetchAllComplaints = async () => {
  try {
    const res = await axiosInstance.get(`/complaints`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả complaints:", error);
    throw error;
  }
};

// Lấy ingredients sử dụng trong order của complaint (nếu backend có endpoint)
export const fetchComplaintIngredientsByShop = async (shopId) => {
  try {
    if (!shopId) throw new Error("Thiếu shopId");
    const res = await axiosInstance.get(`/ingredients?shop_id=${shopId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy ingredients shop:", error);
    throw error;
  }
};

export const fetchMarketplacePostById = async (postId) => {
  try {
    if (!postId) throw new Error("Thiếu postId");
    console.log("Gọi API fetchMarketplacePostById với postId:", postId);
    const res = await axiosInstance.get(`/marketplace-posts/${postId}`);
    return res.data; // expects { message, post }
  } catch (error) {
    console.error(
      "Lỗi khi fetchMarketplacePostById:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Admin: approve complaint (cancel related order)
export const approveComplaint = async (complaintId) => {
  try {
    if (!complaintId) throw new Error("Thiếu complaintId");
    console.log("Approve complaint:", complaintId);
    const res = await axiosInstance.put(`/complaints/${complaintId}/approve`);
    return res.data;
  } catch (error) {
    console.error(
      "Lỗi approve complaint:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Admin: reject complaint (mark related order as completed)
export const rejectComplaint = async (complaintId) => {
  try {
    if (!complaintId) throw new Error("Thiếu complaintId");
    console.log("Reject complaint:", complaintId);
    const res = await axiosInstance.put(`/complaints/${complaintId}/reject`);
    return res.data;
  } catch (error) {
    console.error(
      "Lỗi reject complaint:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Admin: update complaint admin note
export const updateComplaintAdminNote = async (complaintId, adminNote) => {
  try {
    if (!complaintId) throw new Error("Thiếu complaintId");
    console.log("Update complaint admin note:", { complaintId, adminNote });
    const res = await axiosInstance.put(`/complaints/${complaintId}`, {
      admin_note: adminNote ?? "",
    });
    return res.data;
  } catch (error) {
    console.error(
      "Lỗi update complaint admin note:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Lấy đơn mua bánh theo userId (để hiển thị vào lịch sử giao dịch)
export const fetchCakeOrdersByUserId = async (userId) => {
  try {
    if (!userId) throw new Error("Thiếu userId");
    const response = await axiosInstance.get(`/cake-orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchCakeOrdersByUserId:", error);
    throw error;
  }
};
