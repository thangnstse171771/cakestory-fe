import axiosInstance from "./axios";

export const createCakeOrder = async (orderData) => {
  try {
    console.log("Creating cake order:", orderData);
    const response = await axiosInstance.post("/cake-orders", orderData);
    console.log("Cake order created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating cake order:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Cake Quotes API functions
export const createCakeQuote = async (quoteData) => {
  try {
    console.log("Creating cake quote:", quoteData);
    const response = await axiosInstance.post("/cake-quotes", quoteData);
    console.log("Cake quote created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating cake quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const getCakeQuotes = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `/cake-quotes?page=${page}&limit=${limit}`
    );
    console.log("Cake quotes retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving cake quotes:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const getCakeQuoteById = async (id) => {
  try {
    const response = await axiosInstance.get(`/cake-quotes/${id}`);
    console.log("Cake quote retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving cake quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const deleteCakeQuote = async (id) => {
  try {
    const response = await axiosInstance.delete(`/cake-quotes/${id}`);
    console.log("Cake quote deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting cake quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const updateCakeQuoteStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(`/cake-quotes/${id}/status`, {
      status,
    });
    console.log("Cake quote status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating cake quote status:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const acceptShopQuote = async (quoteId) => {
  try {
    const response = await axiosInstance.put(
      `/cake-quotes/shop-quotes/${quoteId}/accept`
    );
    console.log("Shop quote accepted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error accepting shop quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Shop Quotes API functions
export const getMyShopQuotes = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(
      `/cake-quotes/my-shop-quotes?page=${page}&limit=${limit}`
    );
    console.log("My shop quotes retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving my shop quotes:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const createShopQuote = async (quoteData) => {
  try {
    console.log("Creating shop quote:", quoteData);
    const response = await axiosInstance.post(
      "/cake-quotes/shop-quotes",
      quoteData
    );
    console.log("Shop quote created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating shop quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const getShopQuotesForCakeQuote = async (
  cakeQuoteId,
  page = 1,
  limit = 10
) => {
  try {
    const response = await axiosInstance.get(
      `/cake-quotes/${cakeQuoteId}/shop-quotes?page=${page}&limit=${limit}`
    );
    console.log(
      "Shop quotes for cake quote retrieved successfully:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error retrieving shop quotes for cake quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const updateShopQuote = async (shopQuoteId, updateData) => {
  try {
    console.log("Updating shop quote:", shopQuoteId, updateData);
    const response = await axiosInstance.put(
      `/cake-quotes/shop-quotes/${shopQuoteId}`,
      updateData
    );
    console.log("Shop quote updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating shop quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
