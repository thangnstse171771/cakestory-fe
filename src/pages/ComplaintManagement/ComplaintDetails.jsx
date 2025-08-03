"use client";
import {
  ArrowLeft,
  User,
  ListOrdered,
  CalendarDays,
  Clock,
  MessageSquareWarning,
  ImageIcon,
  Phone,
  Mail,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export default function ComplaintDetails({ complaint, onBack }) {
  // Thêm ảnh ví dụ nếu chưa có
  const exampleImg = "/Cake Design/Base Cake Layer/Tier 1 Round.png";
  const complaintWithImage = {
    ...complaint,
    images:
      complaint?.images && complaint.images.length > 0
        ? complaint.images
        : [exampleImg],
  };
  const [status, setStatus] = useState(complaintWithImage?.status || "pending");
  const [response, setResponse] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const complaintStatusMap = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    complete: {
      label: "Đã hoàn tiền",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    rejected: {
      label: "Đã từ chối",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: XCircle,
    },
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      alert("Cập nhật trạng thái thành công!");
    }, 1000);
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      alert("Vui lòng nhập phản hồi");
      return;
    }

    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      setResponse("");
      alert("Gửi phản hồi thành công!");
    }, 1000);
  };

  if (!complaint) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <MessageSquareWarning className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600">
              Không tìm thấy thông tin khiếu nại
            </p>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = complaintStatusMap[status]?.icon || AlertCircle;

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại danh sách
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{complaint.subject}</h1>
                <div className="flex items-center gap-4 text-red-100">
                  <span className="flex items-center gap-1">
                    <ListOrdered className="h-4 w-4" />
                    Mã đơn: {complaint.orderNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {complaint.date} lúc {complaint.time}
                  </span>
                </div>
              </div>
              <div
                className={`${complaintStatusMap[status]?.color} px-4 py-2 rounded-full flex items-center gap-2 bg-white/20 backdrop-blur-sm border-white/30`}
              >
                <StatusIcon className="h-4 w-4" />
                <span className="font-semibold text-white">
                  {complaintStatusMap[status]?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Complaint Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 text-red-600" />
                    Nội dung khiếu nại
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Images */}
                {complaint.imageUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-red-600" />
                      Hình ảnh đính kèm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <img
                          src={complaint.imageUrl}
                          alt="Hình ảnh khiếu nại"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                            Click để phóng to
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Report Images */}
                {complaintWithImage.images &&
                  complaintWithImage.images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-red-600" />
                        Hình ảnh báo cáo từ khách hàng
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complaintWithImage.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Báo cáo ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Column - Customer Info & Actions */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Họ tên:</label>
                      <p className="font-medium text-gray-800">
                        {complaint.customerName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Số điện thoại:
                      </label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        0123 456 789
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email:</label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        customer@email.com
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Địa chỉ:</label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        123 Đường ABC, Quận 1, TP.HCM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accept/Reject Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Xử lý khiếu nại
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Nhập lý do xử lý khiếu nại..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    />
                    <button
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                      disabled={
                        isUpdating || !response.trim() || status === "complete"
                      }
                      onClick={() => {
                        setIsUpdating(true);
                        setTimeout(() => {
                          setIsUpdating(false);
                          setStatus("complete");
                          alert(
                            "Đã chấp nhận hoàn tiền cho khách hàng. Hệ thống sẽ tự động hoàn tiền.\nLý do: " +
                              response
                          );
                          setResponse("");
                        }, 1000);
                      }}
                    >
                      {isUpdating
                        ? "Đang xử lý..."
                        : status === "complete"
                        ? "Đã hoàn tiền"
                        : "Chấp nhận hoàn tiền"}
                    </button>
                    <button
                      className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors font-semibold"
                      disabled={
                        isUpdating || !response.trim() || status === "rejected"
                      }
                      onClick={() => {
                        setIsUpdating(true);
                        setTimeout(() => {
                          setIsUpdating(false);
                          setStatus("rejected");
                          alert("Đã từ chối khiếu nại.\nLý do: " + response);
                          setResponse("");
                        }, 1000);
                      }}
                    >
                      {isUpdating
                        ? "Đang xử lý..."
                        : status === "rejected"
                        ? "Đã từ chối"
                        : "Từ chối khiếu nại"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
