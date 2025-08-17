import axiosInstance from "./axios";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const authAPI = {
  getFollowers: async (id) => {
    const response = await axiosInstance.get(`/users/${id}/followers`);
    return response.data;
  },

  getFollowing: async (id) => {
    const response = await axiosInstance.get(`/users/${id}/following`);
    return response.data;
  },
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  verifyEmail: async (email) => {
    const response = await axiosInstance.get(
      `/auth/verify?email=${encodeURIComponent(email)}`
    );
    return response.data;
  },

  resendVerificationEmail: async (email) => {
    const response = await axiosInstance.post("/auth/resend-verification", {
      email,
    });
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

  getAllMemoryPosts: async () => {
    const response = await axiosInstance.get("/memory-posts");
    return response.data;
  },

  getPaginatedMemoryPosts: async (page, limit) => {
    const response = await axiosInstance.get("/memory-posts/paginatedPosts", {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  },

  getMemoryPostByUserId: async (userId) => {
    const response = await axiosInstance.get(`/memory-posts/user/${userId}`);
    return response.data;
  },

  getMemoryPostById: async (postId) => {
    const response = await axiosInstance.get(`/memory-posts/${postId}`);
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

  uploadAvatarToFirebase: async (file, userId) => {
    if (!file) throw new Error("No file provided");
    const ext = file.name.split(".").pop();
    const avatarRef = ref(storage, `avatars/${userId}_${Date.now()}.${ext}`);
    await uploadBytes(avatarRef, file);
    return await getDownloadURL(avatarRef);
  },

  likePost: async (postId) => {
    const response = await axiosInstance.post(`/likes/post/${postId}`);
    return response.data;
  },

  getLikesByPostId: async (postId) => {
    const response = await axiosInstance.get(`/likes/post/${postId}`);
    return response.data;
  },

  createComment: async (postId, commentData) => {
    const response = await axiosInstance.post(
      `/comments/post/${postId}`,
      commentData
    );
    return response.data;
  },

  getCommentsByPostId: async (postId) => {
    const response = await axiosInstance.get(`/comments/post/${postId}`);
    return response.data;
  },

  editComment: async (commentId, commentData) => {
    const response = await axiosInstance.put(
      `/comments/${commentId}`,
      commentData
    );
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response.data;
  },

  followUserById: async (id) => {
    const response = await axiosInstance.post(`/users/follow/${id}`);
    return response.data;
  },

  unfollowUserById: async (id) => {
    const response = await axiosInstance.delete(`/users/follow/${id}`);
    return response.data;
  },

  getAllActiveUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  createAlbum: async (albumData) => {
    const response = await axiosInstance.post("/albums", albumData);
    return response.data;
  },

  updateAlbum: async (id, data) => {
    const response = await axiosInstance.put(`/albums/${id}`, data);
    return response.data;
  },

  getAlbumsByUserId: async (userId) => {
    const response = await axiosInstance.get(`/albums/user/${userId}`);
    return response.data;
  },

  getAlbumById: async (albumId) => {
    const response = await axiosInstance.get(`/albums/${albumId}`);
    return response.data;
  },

  createAlbumPost: async (postData) => {
    const response = await axiosInstance.post(`/albums/posts`, postData);
    return response.data;
  },

  updateAlbumPost: async (postId, postData) => {
    const response = await axiosInstance.put(
      `/albums/posts/${postId}`,
      postData
    );
    return response.data;
  },

  getAlbumPostById: async (postId) => {
    const response = await axiosInstance.get(`/albums/posts/${postId}`);
    return response.data;
  },

  getShopMembersByShopId: async (shopId) => {
    const response = await axiosInstance.get(`/shop-members/shop/${shopId}`);
    return response.data;
  },

  deleteAlbum: async (albumId) => {
    const response = await axiosInstance.delete(`/albums/${albumId}`);
    return response.data;
  },

  deleteAlbumPost: async (postId) => {
    const response = await axiosInstance.delete(`/albums/posts/${postId}`);
    return response.data;
  },

  searchMemoryPost: async (query) => {
    const response = await axiosInstance.get(`/memory-posts/search`, {
      params: { q: query },
    });
    return response.data;
  },

  createChallengePost: async (postData) => {
    const response = await axiosInstance.post(`/challenge-posts`, postData);
    return response.data;
  },

  getChallengePostsByChallengeId: async (challengeId) => {
    const response = await axiosInstance.get(
      `challenge-posts/challenge/${challengeId}`
    );
    return response.data;
  },

  getChallengePostById: async (postId) => {
    const response = await axiosInstance.get(`/challenge-posts/${postId}`);
    return response.data;
  },

  getChallengeLeaderboardById: async (challengeId) => {
    const response = await axiosInstance.get(`challenge-posts/leaderboard`, {
      params: { challenge_id: challengeId },
    });
    return response.data;
  },
};
