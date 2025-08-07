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
