"use client";
import {
  ListOrdered,
  MessageSquareWarning,
  CalendarDays,
  Filter,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchComplaintsByCustomer } from "../../api/axios";
import ComplaintDetails from "./ComplaintDetails";
import { Link, useNavigate } from "react-router-dom";

export default function ComplaintList({ userId }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const complaintStatusMap = {
    pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
    complete: { label: "Đã hoàn tiền", color: "bg-green-100 text-green-700" },
    rejected: { label: "Đã từ chối", color: "bg-gray-100 text-gray-700" },
  };

  // Fetch complaints data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const id = userId || currentUser?.id;
    if (!id) {
      setError("Không tìm thấy user");
      setLoading(false);
      return;
    }

    // Robust normalization for complaint status
    const normalizeStatus = (raw = "") => {
      const v = (raw || "").toString().trim().toLowerCase();
      if (
        [
          "approved",
          "approve",
          "completed",
          "complete",
          "resolved",
          "refunded",
        ].includes(v)
      )
        return "complete";
      if (
        [
          "rejected",
          "reject",
          "denied",
          "refused",
          "closed",
          "cancelled",
        ].includes(v)
      )
        return "rejected";
      // treat complaining as pending in UI filter
      if (["pending", "complaining", "open", "new"].includes(v))
        return "pending";
      return "pending";
    };

    (async () => {
      try {
        setLoading(true);
        const data = await fetchComplaintsByCustomer(id);
        const mapped = (Array.isArray(data) ? data : []).map((c) => {
          const created = c.created_at ? new Date(c.created_at) : null;
          const evidenceImages = [];
          if (c.evidence_images) {
            if (Array.isArray(c.evidence_images))
              evidenceImages.push(...c.evidence_images);
            else if (typeof c.evidence_images === "string")
              evidenceImages.push(...c.evidence_images.split(","));
          }
          if (c.image_url) evidenceImages.push(c.image_url);
          if (c.image) evidenceImages.push(c.image);
          const uniqueImages = [
            ...new Set(
              evidenceImages.map((i) => i && i.trim()).filter(Boolean)
            ),
          ];
          const rawStatus = (
            c.status ||
            c.complaint_status ||
            "pending"
          ).toLowerCase();
          const normalizedStatus = normalizeStatus(rawStatus);
          return {
            id: c.id || c.complaint_id || `comp-${Math.random()}`,
            orderId: c.order_id || c.orderId || "",
            orderNumber: c.order_code || c.orderNumber || c.order_id || "N/A",
            customerName:
              c.customer_name ||
              c.customerName ||
              currentUser?.name ||
              "Khách hàng",
            subject: c.subject || c.title || "Không có tiêu đề",
            description: c.description || c.content || c.reason || "",
            status: normalizedStatus,
            date: created
              ? created.toLocaleDateString("vi-VN")
              : c.date || new Date().toLocaleDateString("vi-VN"),
            time: created
              ? created.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : c.time ||
                new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
            imageUrl: uniqueImages[0] || null,
            images: uniqueImages,
            raw: c,
          };
        });
        setComplaints(mapped);
      } catch (e) {
        setError(e.message || "Lỗi tải dữ liệu");
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilter !== "all") {
      const complaintDate = new Date(
        complaint.date.split("/").reverse().join("-")
      );
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case "today":
          matchesDate = complaintDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          matchesDate =
            complaintDate.toDateString() === yesterday.toDateString();
          break;
        case "week":
          matchesDate = complaintDate >= lastWeek;
          break;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  if (selectedComplaint) {
    return (
      <ComplaintDetails
        complaint={selectedComplaint}
        onBack={() => setSelectedComplaint(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600 animate-pulse">Đang tải khiếu nại...</div>
      </div>
    );
  }

  if (error && complaints.length === 0) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="font-semibold text-red-600 mb-2">{error}</p>
          <p>Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-red-700 flex items-center gap-3">
            <MessageSquareWarning className="h-7 w-7" />
            Danh sách khiếu nại ({filteredComplaints.length})
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề, mã đơn, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 w-64"
              />
            </div>
            <select
              className="px-3 py-2 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="complete">Đã hoàn tiền</option>
              <option value="rejected">Đã từ chối</option>
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">7 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 bg-white rounded-xl shadow-lg">
            <MessageSquareWarning className="h-16 w-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">Không tìm thấy khiếu nại nào.</p>
            <p className="text-sm">Thử thay đổi bộ lọc để xem thêm kết quả.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Link
                to={`/my-complaints/${complaint.id}`}
                key={complaint.id}
                className="block p-6 shadow-lg rounded-xl border border-red-100 hover:shadow-xl transition-all duration-200 bg-white hover:border-red-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-red-700 mb-1">
                          {complaint.subject}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Khách hàng:{" "}
                          <span className="font-medium">
                            {complaint.customerName}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <ListOrdered className="h-4 w-4" />
                          Mã đơn hàng:{" "}
                          <span className="font-medium">
                            {complaint.orderNumber}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`${
                          complaintStatusMap[complaint.status]?.color ||
                          "bg-gray-200 text-gray-700"
                        } text-sm px-3 py-1 rounded-full font-semibold whitespace-nowrap`}
                      >
                        {complaintStatusMap[complaint.status]?.label ||
                          complaint.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {complaint.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-red-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    Ngày gửi: {complaint.date} lúc {complaint.time}
                  </div>
                  <span className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Xem chi tiết →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
