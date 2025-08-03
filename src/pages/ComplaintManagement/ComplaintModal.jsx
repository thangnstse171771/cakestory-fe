"use client";
import { useState, useEffect } from "react";
import { MessageSquareWarning, X } from "lucide-react";

export default function ComplaintModal({ isOpen, onClose, order, onSubmit }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (isOpen && order) {
      setSubject(`Khiếu nại về đơn hàng ${order.orderNumber}`);
      setDescription("");
      setImageUrl("");
    }
  }, [isOpen, order]);

  const handleSubmit = () => {
    if (subject.trim() && description.trim() && order) {
      const newComplaint = {
        id: `comp-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        subject: subject.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        status: "new",
        date: new Date().toLocaleDateString("vi-VN"),
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      onSubmit(newComplaint);
    }
  };

  if (!order || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-red-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2 text-xl font-bold">
            <MessageSquareWarning className="h-5 w-5" />
            Tạo khiếu nại
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Đơn hàng:</span> {order.orderNumber}
            </p>
            <p>
              <span className="font-medium">Khách hàng:</span>{" "}
              {order.customerName}
            </p>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block font-medium">
              Tiêu đề khiếu nại
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Sản phẩm bị hư hỏng, giao hàng chậm..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-medium">
              Mô tả chi tiết
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="mb-2 block font-medium">
              URL hình ảnh (tùy chọn)
            </label>
            <input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Dán URL hình ảnh vào đây..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {imageUrl && (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Preview"
                className="mt-2 max-h-32 object-contain rounded-md border"
              />
            )}
          </div>

          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg mt-2"
            onClick={handleSubmit}
          >
            Gửi khiếu nại
          </button>
        </div>
      </div>
    </div>
  );
}
