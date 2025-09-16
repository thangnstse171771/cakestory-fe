"use client";
import { useState, useEffect } from "react";
import { MessageSquareWarning, X, Upload, Loader2 } from "lucide-react";
import { createComplaint } from "../../api/axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const uploadMediaToFirebase = async (file) => {
  const mediaRef = ref(storage, `media/${Date.now()}-${file.name}`);
  await uploadBytes(mediaRef, file);
  return await getDownloadURL(mediaRef);
};

export default function ComplaintModal({ isOpen, onClose, order, onSubmit }) {
  const [subject, setSubject] = useState("");
  // const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    if (isOpen && order) {
      setSubject("");
      // setDescription("");
      setImageFile(null);
      setImagePreview("");
      setLoading(false);
      setUploading(false);
      setRemainingMs(null);
    }
  }, [isOpen, order]);

  // Countdown logic: allow complaints within 2 hours after shipped timestamp
  useEffect(() => {
    let intervalId = null;

    const shippedRaw =
      order?.shipped_at || order?.shippedAt || order?.shipped_time || order?.shippedTime || order?.shipped || null;

    if (!shippedRaw) {
      setRemainingMs(null);
      return () => {};
    }

    const shippedDate = new Date(shippedRaw);
    if (!isFinite(shippedDate)) {
      setRemainingMs(null);
      return () => {};
    }

    const expiry = shippedDate.getTime() + 2 * 60 * 60 * 1000; // 2 hours

    const update = () => {
      const rem = expiry - Date.now();
      setRemainingMs(rem);
      if (rem <= 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    update();
    intervalId = setInterval(update, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [order?.shipped_at, order?.shippedAt, order?.shipped_time, order?.shippedTime, order?.shipped, isOpen]);

  const formatRemaining = (ms) => {
    if (ms == null) return null;
    if (ms <= 0) return "00:00:00";
    const total = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const isExpired = remainingMs != null && remainingMs <= 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }

      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh!");
        return;
      }

      setImageFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !order) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Prevent submitting if 2-hour shipped window expired
    if (isExpired) {
      alert("Thời gian 2 tiếng để tạo khiếu nại đã hết hạn.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      // Upload ảnh lên Firebase nếu có
      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadMediaToFirebase(imageFile);
        } catch (uploadError) {
          alert("Có lỗi khi upload ảnh. Complaint sẽ được tạo không có ảnh.");
        } finally {
          setUploading(false);
        }
      }

      // Tạo complaint data theo API format
      const complaintData = {
        order_id: order.id,
        reason: subject.trim(),
        evidence_images: imageUrl || "",
      };

      // Gọi API tạo complaint
      const result = await createComplaint(complaintData);

      // Hiển thị thông báo thành công
      alert("Khiếu nại đã được gửi thành công!");

      // Callback với data để parent component xử lý
      if (onSubmit) {
        onSubmit(result);
      }

      // Đóng modal
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi khi gửi khiếu nại";
      alert(errorMessage);
    } finally {
      setLoading(false);
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

          {remainingMs != null && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
              {isExpired ? (
                <div>Hết hạn tạo khiếu nại (đã quá 2 tiếng kể từ khi giao)</div>
              ) : (
                <div>
                  Thời gian còn lại để tạo khiếu nại: <span className="font-semibold">{formatRemaining(remainingMs)}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="subject" className="mb-2 block font-medium">
              Mô tả chi tiết
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Sản phẩm bị hư hỏng, giao hàng chậm..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* <div>
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
          </div> */}

          <div>
            <label htmlFor="imageFile" className="mb-2 block font-medium">
              Hình ảnh bằng chứng (tùy chọn)
            </label>
            <div className="space-y-3">
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang upload ảnh...</span>
                </div>
              )}

              {imagePreview && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 max-w-full object-contain rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                * Chỉ chấp nhận file ảnh, tối đa 5MB
              </p>
            </div>
          </div>

          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={loading || uploading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? "Đang upload..." : "Đang gửi..."}
              </>
            ) : (
              "Gửi khiếu nại"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
