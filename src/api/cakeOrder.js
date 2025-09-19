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
    const response = await axiosInstance.post("/cake-quotes", quoteData);

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

    return response.data;
  } catch (error) {
    console.error("Error retrieving my shop quotes:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const createShopQuote = async (quoteData) => {
  try {
    const response = await axiosInstance.post(
      "/cake-quotes/shop-quotes",
      quoteData
    );

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

    return response.data;
  } catch (error) {
    console.error("Error retrieving shop quotes for cake quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const updateShopQuote = async (shopQuoteId, updateData) => {
  try {
    const response = await axiosInstance.put(
      `/cake-quotes/shop-quotes/${shopQuoteId}`,
      updateData
    );

    return response.data;
  } catch (error) {
    console.error("Error updating shop quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const createCakeOrderFromQuote = async (shopQuoteId, orderData) => {
  try {
    const response = await axiosInstance.post(`/cake-quotes/from-quote`, {
      shop_quote_id: shopQuoteId, // must be in body
      ...orderData,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating order from quote:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
