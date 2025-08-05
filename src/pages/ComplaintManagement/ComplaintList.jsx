"use client";
import {
  ListOrdered,
  MessageSquareWarning,
  CalendarDays,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";
import ComplaintDetails from "./ComplaintDetails";

// Fake data khiếu nại
const fakeComplaints = [
  {
    id: "comp-1",
    orderId: "order-1",
    orderNumber: "DH001",
    customerName: "Nguyễn Văn A",
    subject: "Bánh bị hỏng khi nhận hàng",
    description: "Bánh bị vỡ và kem bị chảy khi giao đến.",
    status: "new",
    date: "01/08/2025",
    time: "09:30",
  },
  {
    id: "comp-2",
    orderId: "order-2",
    orderNumber: "DH002",
    customerName: "Trần Thị B",
    subject: "Giao hàng trễ",
    description: "Đơn hàng giao trễ 2 tiếng so với dự kiến.",
    status: "in_progress",
    date: "02/08/2025",
    time: "14:15",
  },
  {
    id: "comp-3",
    orderId: "order-3",
    orderNumber: "DH003",
    customerName: "Lê Văn C",
    subject: "Thiếu phụ kiện đi kèm",
    description: "Không có nến và dao cắt bánh như đã đặt.",
    status: "resolved",
    date: "03/08/2025",
    time: "10:00",
  },
  {
    id: "comp-4",
    orderId: "order-4",
    orderNumber: "DH004",
    customerName: "Phạm Thị D",
    subject: "Bánh không đúng kích thước",
    description: "Bánh nhỏ hơn so với yêu cầu đã đặt.",
    status: "closed",
    date: "31/07/2025",
    time: "16:45",
  },
];

export default function ComplaintList({ complaints }) {
  complaints =
    complaints && complaints.length > 0 ? complaints : fakeComplaints;

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const complaintStatusMap = {
    new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
    in_progress: {
      label: "Đang xử lý",
      color: "bg-yellow-100 text-yellow-700",
    },
    resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-700" },
    closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-700" },
  };

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

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-3">
          <MessageSquareWarning className="h-7 w-7" />
          Danh sách khiếu nại ({filteredComplaints.length})
        </h2>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-700">Lọc khiếu nại</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mã đơn, khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">Mới</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              <div
                key={complaint.id}
                className="p-6 shadow-lg rounded-xl border border-red-100 hover:shadow-xl transition-all duration-200 bg-white cursor-pointer hover:border-red-200"
                onClick={() => handleViewDetails(complaint)}
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
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(complaint);
                    }}
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
