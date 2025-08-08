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
  const response = await axiosInstance.post("/wallet/deposit", { amount });
  return response.data;
};

export const fetchWalletBalance = async () => {
  const response = await axiosInstance.get("/wallet/balance");
  return response.data;
};

export const joinChallenge = async (challengeId) => {
  const response = await axiosInstance.post("/challenge-entries", {
    challenge_id: challengeId,
    user_id: JSON.parse(localStorage.getItem("user"))?.id,
  });
  return response.data;
};

// Lấy thông tin chi tiết một challenge entry theo ID
export const fetchChallengeEntryById = async (entryId) => {
  try {
    console.log("Gọi API fetchChallengeEntryById với ID:", entryId);
    const response = await axiosInstance.get(`/challenge-entries/${entryId}`);
    console.log("Challenge entry response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchChallengeEntryById:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy danh sách tất cả user tham gia một challenge
export const fetchChallengeParticipants = async (challengeId) => {
  try {
    console.log(
      "Gọi API fetchChallengeParticipants với challengeId:",
      challengeId
    );
    const response = await axiosInstance.get(
      `/challenge-entries/challenge/${challengeId}`
    );
    console.log("Challenge participants response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchChallengeParticipants:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Đếm số lượng participants của một challenge
export const getChallengeParticipantCount = async (challengeId) => {
  try {
    console.log(
      "Gọi API getChallengeParticipantCount với challengeId:",
      challengeId
    );
    const response = await fetchChallengeParticipants(challengeId);

    let count = 0;
    if (response && response.entries && Array.isArray(response.entries)) {
      count = response.entries.length;
    } else if (Array.isArray(response)) {
      count = response.length;
    } else if (
      response &&
      response.data &&
      Array.isArray(response.data.entries)
    ) {
      count = response.data.entries.length;
    } else if (response && response.data && Array.isArray(response.data)) {
      count = response.data.length;
    }

    console.log("Challenge participant count:", count);
    return count;
  } catch (error) {
    console.error("Lỗi khi gọi getChallengeParticipantCount:", error);
    return 0; // Trả về 0 nếu có lỗi
  }
};

// Lấy danh sách tất cả challenges
export const getAllChallenges = async () => {
  try {
    console.log("Gọi API getAllChallenges");
    const response = await axiosInstance.get("/challenges");
    console.log("All challenges response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getAllChallenges:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy danh sách challenge entries của một user
export const fetchUserChallengeEntries = async (userId) => {
  try {
    console.log("Gọi API fetchUserChallengeEntries với userId:", userId);
    const response = await axiosInstance.get(
      `/challenge-entries/user/${userId}`
    );
    console.log("User challenge entries response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi fetchUserChallengeEntries:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Lấy thông tin chi tiết một challenge theo ID
export const getChallengeById = async (challengeId) => {
  try {
    console.log("Gọi API getChallengeById với challengeId:", challengeId);
    const response = await axiosInstance.get(`/challenges/${challengeId}`);
    console.log("Challenge detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getChallengeById:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Tạo challenge mới
export const createChallenge = async (challengeData) => {
  try {
    console.log("Gọi API createChallenge với data:", challengeData);
    const response = await axiosInstance.post("/challenges", challengeData);
    console.log("Create challenge response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi createChallenge:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Cập nhật challenge
export const updateChallenge = async (challengeId, challengeData) => {
  try {
    console.log(
      "Gọi API updateChallenge với challengeId:",
      challengeId,
      "data:",
      challengeData
    );
    const response = await axiosInstance.put(
      `/challenges/${challengeId}`,
      challengeData
    );
    console.log("Update challenge response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi updateChallenge:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Xóa challenge
export const deleteChallenge = async (challengeId) => {
  try {
    console.log("Gọi API deleteChallenge với challengeId:", challengeId);
    const response = await axiosInstance.delete(`/challenges/${challengeId}`);
    console.log("Delete challenge response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi deleteChallenge:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Xóa challenge entry (remove user from challenge)
export const deleteChallengeEntry = async (entryId) => {
  try {
    console.log("Gọi API deleteChallengeEntry với entryId:", entryId);
    const response = await axiosInstance.delete(
      `/challenge-entries/${entryId}`
    );
    console.log("Delete challenge entry response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi deleteChallengeEntry:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
