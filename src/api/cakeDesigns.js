import axiosInstance from "./axios";

// Upload cake design image
export const uploadCakeDesignImage = async (formData) => {
  const response = await axiosInstance.post(
    "/cake-designs/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Create magic design with description and image for AI processing
export const createMagicDesign = async (designData) => {
  const response = await axiosInstance.post(
    "/cake-designs/create",
    designData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Generate AI image for cake design
export const generateAIImage = async (cakeDesignId) => {
  const response = await axiosInstance.put(
    "/cake-designs/generate-ai",
    {
      cake_design_id: cakeDesignId,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Get cake designs with pagination
export const getCakeDesigns = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/cake-designs?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Get cake designs by user ID with pagination
export const getCakeDesignsByUserId = async (
  userId,
  page = 1,
  limit = 10,
  includePrivate = false
) => {
  const response = await axiosInstance.get(
    `/cake-designs/user/${userId}?page=${page}&limit=${limit}&include_private=${includePrivate}`
  );
  return response.data;
};
