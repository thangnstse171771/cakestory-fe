import axios from "./axios";

const API_BASE_URL = "https://cakestory-be.onrender.com/api";

// Get shop gallery items by shop ID
export const getShopGalleryByShopId = async (shopId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/shop-gallery/shop/${shopId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shop gallery:", error);
    throw error;
  }
};

// Get single gallery item by ID
export const getShopGalleryItem = async (galleryId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/shop-gallery/${galleryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    throw error;
  }
};

// Create new gallery item
export const createShopGalleryItem = async (galleryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/shop-gallery`,
      galleryData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating gallery item:", error);
    throw error;
  }
};

// Update gallery item
export const updateShopGalleryItem = async (galleryId, galleryData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/shop-gallery/${galleryId}`,
      galleryData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating gallery item:", error);
    throw error;
  }
};

// Delete gallery item
export const deleteShopGalleryItem = async (galleryId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/shop-gallery/${galleryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};
