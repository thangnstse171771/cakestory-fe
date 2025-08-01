import React, { useState, useEffect } from "react";
import { createIngredient, updateIngredient } from "../../api/ingredients";

const IngredientModal = ({ open, onClose, onAdded, initialData, isEdit }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [image, setImage] = useState(null); // file or url
  const [imagePreview, setImagePreview] = useState(initialData?.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialData?.name || "");
    setPrice(initialData?.price || "");
    setDescription(initialData?.description || "");
    setImage(null);
    setImagePreview(initialData?.image || "");
  }, [initialData, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(initialData?.image || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name,
        price: parseFloat(price),
        description,
        image: image || initialData?.image || "",
      };
      if (isEdit && initialData?.id) {
        await updateIngredient(initialData.id, payload);
      } else {
        await createIngredient(payload);
      }
      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
      setImagePreview("");
      onAdded && onAdded();
      onClose();
    } catch (err) {
      setError(
        isEdit ? "Cập nhật topping thất bại!" : "Thêm topping thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4 text-pink-600">
          {isEdit ? "Chỉnh sửa Topping" : "Thêm Topping (Nguyên liệu)"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Tên topping
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Giá topping ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
              placeholder="Mô tả về topping"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Ảnh topping
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded-lg border shadow-sm"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-60"
            >
              {loading
                ? isEdit
                  ? "Đang lưu..."
                  : "Đang thêm..."
                : isEdit
                ? "Lưu"
                : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;
