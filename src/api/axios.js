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
