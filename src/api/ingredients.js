import axiosInstance from "./axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export const fetchIngredients = async (shopId) => {
  const response = await axiosInstance.get(`/ingredients?shop_id=${shopId}`);
  return response.data;
};

export const createIngredient = async (data) => {
  let imageUrl = data.image;
  if (data.image && typeof data.image !== "string") {
    const imageRef = ref(
      storage,
      `ingredients/${Date.now()}_${data.image.name}`
    );
    await uploadBytes(imageRef, data.image);
    imageUrl = await getDownloadURL(imageRef);
  }
  const payload = {
    name: data.name,
    price: data.price,
    image: imageUrl,
    description: data.description,
  };
  const res = await axiosInstance.post("/ingredients", payload);
  return res.data;
};

export const updateIngredient = async (id, data) => {
  let imageUrl = data.image;
  if (data.image && typeof data.image !== "string") {
    const imageRef = ref(
      storage,
      `ingredients/${Date.now()}_${data.image.name}`
    );
    await uploadBytes(imageRef, data.image);
    imageUrl = await getDownloadURL(imageRef);
  }
  const payload = {
    name: data.name,
    price: data.price,
    image: imageUrl,
    description: data.description,
  };
  const res = await axiosInstance.put(`/ingredients/${id}`, payload);
  return res.data;
};

export const deleteIngredient = async (id) => {
  const response = await axiosInstance.delete(`/ingredients/${id}`);
  return response.data;
};
