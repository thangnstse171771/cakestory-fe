import axiosInstance from "./axios";

// Tạo một challenge mới
export const createChallenge = async (challengeData) => {
  const response = await axiosInstance.post("/challenges", challengeData);
  return response.data;
};

// Lấy danh sách tất cả challenges
export const getAllChallenges = async () => {
  try {
    const response = await axiosInstance.get("/challenges");
    console.log("Raw Challenge API Response:", response);
    return {
      success: true,
      challenges: Array.isArray(response.data)
        ? response.data
        : response.data?.challenges || response.data?.data || [],
    };
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Không thể tải danh sách thử thách",
    };
  }
};

// Lấy chi tiết một challenge theo ID
export const getChallengeById = async (challengeId) => {
  const response = await axiosInstance.get(`/challenges/${challengeId}`);
  return response.data;
};

// Cập nhật thông tin một challenge
export const updateChallenge = async (challengeId, updateData) => {
  const response = await axiosInstance.put(
    `/challenges/${challengeId}`,
    updateData
  );
  return response.data;
};

// Xóa một challenge
export const deleteChallenge = async (challengeId) => {
  const response = await axiosInstance.delete(`/challenges/${challengeId}`);
  return response.data;
};

// Tham gia một challenge
export const joinChallenge = async (challengeId) => {
  const response = await axiosInstance.post(`/challenges/${challengeId}/join`);
  return response.data;
};

// Rời khỏi một challenge
export const leaveChallenge = async (challengeId) => {
  const response = await axiosInstance.post(`/challenges/${challengeId}/leave`);
  return response.data;
};

// Lấy danh sách người tham gia một challenge
export const getChallengeMember = async (challengeId) => {
  const response = await axiosInstance.get(
    `/challenges/${challengeId}/members`
  );
  return response.data;
};
