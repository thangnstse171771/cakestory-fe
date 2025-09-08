import axiosInstance from "./axios";

// Create picture (supports FormData with file or JSON payload)
export const createPicture = async (data) => {
  // If data is FormData (file upload)
  if (data instanceof FormData) {
    const response = await axiosInstance.post("/pictures/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Otherwise send as JSON
  const response = await axiosInstance.post("/pictures/create", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Get pictures by user id with pagination
export const getPicturesByUserId = async (userId, page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/pictures/user/${userId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Delete picture by id
export const deletePicture = async (pictureId) => {
  const response = await axiosInstance.delete(`/pictures/${pictureId}`);
  return response.data;
};

export default {
  createPicture,
  getPicturesByUserId,
  deletePicture,
};
