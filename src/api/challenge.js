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
    console.log(
      "Challenge Data Structure:",
      JSON.stringify(response.data, null, 2)
    );
    if (Array.isArray(response.data)) {
      const firstChallenge = response.data[0];
      console.log("First Challenge Full Data:", firstChallenge);
      console.log("Available fields:", Object.keys(firstChallenge || {}));
      console.log("Hashtag field:", firstChallenge?.hashtag);
      console.log("Hashtag type:", typeof firstChallenge?.hashtag);
    }
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

// Lấy chi tiết đầy đủ một challenge theo ID (cho trang details)
export const getChallengeById = async (challengeId) => {
  try {
    const response = await axiosInstance.get(`/challenges/${challengeId}`);
    console.log("Challenge Details API Response:", response);
    console.log(
      "Challenge Details Data:",
      JSON.stringify(response.data, null, 2)
    );

    // Xử lý dữ liệu trả về từ API
    const challengeData = response.data?.challenge || response.data;

    if (!challengeData) {
      throw new Error("Không tìm thấy thông tin challenge");
    }

    // Log để debug
    console.log("Processed Challenge Details:", challengeData);
    console.log("Challenge fields:", Object.keys(challengeData));

    return {
      success: true,
      challenge: challengeData,
    };
  } catch (error) {
    console.error("Error fetching challenge details:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin chi tiết challenge",
      challenge: null,
    };
  }
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
