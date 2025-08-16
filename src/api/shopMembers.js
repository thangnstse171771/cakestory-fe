export const deleteMemberFromShop = async (userId) => {
  const response = await axiosInstance.delete(`/shop-members/${userId}`);
  return response.data;
};

export const fetchAllShopMembers = async () => {
  const response = await axiosInstance.get("/shop-members/all");
  return response.data;
};

export const activateShopMember = async () => {
  const response = await axiosInstance.put("/shop-members/activate");
  return response.data;
};
import axiosInstance from "./axios";

export const fetchShopMembers = async () => {
  const response = await axiosInstance.get("/shop-members");
  return response.data;
};

export const fetchAllActiveUsers = async () => {
  const response = await axiosInstance.get("/users");
  // Chỉ lấy user active
  return response.data.users.filter((u) => u.is_active);
};

export const addMemberToShop = async (userId) => {
  // API thêm thành viên vào shop
  const response = await axiosInstance.post("/shop-members", {
    newUserId: userId,
  });
  return response.data;
};
