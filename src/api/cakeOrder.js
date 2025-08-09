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
