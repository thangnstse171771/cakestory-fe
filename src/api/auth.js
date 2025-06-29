import axiosInstance from "./axios";

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await axiosInstance.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  updateUserById: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  createMemoryPost: async (memoryPostData) => {
    const response = await axiosInstance.post("/memory-posts", memoryPostData);
    return response.data;
  },

  getMemoryPostByUserId: async (userId) => {
    const response = await axiosInstance.get(`/memory-posts/user/${userId}`);
    return response.data;
  },

  updateMemoryPost: async (postId, data) => {
    const response = await axiosInstance.put(`/memory-posts/${postId}`, data);
    return response.data;
  },

  deleteMemoryPost: async (postId) => {
    const response = await axiosInstance.delete(`/memory-posts/${postId}`);
    return response.data;
  },
};
