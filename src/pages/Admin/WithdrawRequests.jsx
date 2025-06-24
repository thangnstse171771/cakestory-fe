"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock data cho yêu cầu rút tiền
const mockWithdrawRequests = [
  {
    id: 1,
    userId: "user1",
    username: "Nguyễn Văn A",
    email: "user1@example.com",
    phone: "0123456789",
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    amount: 2000000,
    status: "pending",
    requestDate: "2024-01-15T10:30:00Z",
    processedDate: null,
    note: "Rút tiền để chi tiêu cá nhân",
    adminNote: "",
  },
  {
    id: 2,
    userId: "user2",
    username: "Trần Thị B",
    email: "user2@example.com",
    phone: "0987654321",
    bankName: "BIDV",
    accountNumber: "0987654321",
    accountName: "TRAN THI B",
    amount: 1500000,
    status: "approved",
    requestDate: "2024-01-14T15:20:00Z",
    processedDate: "2024-01-15T09:15:00Z",
    note: "Cần tiền để mua nguyên liệu làm bánh",
    adminNote: "Đã xác minh thông tin tài khoản",
  },
  {
    id: 3,
    userId: "user3",
    username: "Lê Văn C",
    email: "user3@example.com",
    phone: "0111222333",
    bankName: "Techcombank",
    accountNumber: "1122334455",
    accountName: "LE VAN C",
    amount: 3000000,
    status: "rejected",
    requestDate: "2024-01-13T14:45:00Z",
    processedDate: "2024-01-14T11:30:00Z",
    note: "Rút tiền để đầu tư",
    adminNote: "Số tiền vượt quá hạn mức cho phép",
  },
  {
    id: 4,
    userId: "user4",
    username: "Phạm Thị D",
    email: "user4@example.com",
    phone: "0222333444",
    bankName: "ACB",
    accountNumber: "2233445566",
    accountName: "PHAM THI D",
    amount: 800000,
    status: "pending",
    requestDate: "2024-01-15T16:00:00Z",
    processedDate: null,
    note: "Rút tiền để thanh toán hóa đơn",
    adminNote: "",
  },
  {
    id: 5,
    userId: "user5",
    username: "Nguyễn Thị E",
    email: "user5@example.com",
    phone: "0333444555",
    bankName: "MB Bank",
    accountNumber: "3344556677",
    accountName: "NGUYEN THI E",
    amount: 1200000,
    status: "completed",
    requestDate: "2024-01-12T09:30:00Z",
    processedDate: "2024-01-13T14:20:00Z",
    note: "Rút tiền để mua sắm",
    adminNote: "Giao dịch đã hoàn tất",
  },
];

export default function WithdrawRequests() {
  const [withdrawRequests] = useState(mockWithdrawRequests);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Lọc theo filter và search
  const filteredRequests = withdrawRequests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter;
    const matchesSearch =
      search === "" ||
      request.username.toLowerCase().includes(search.toLowerCase()) ||
      request.email.toLowerCase().includes(search.toLowerCase()) ||
      request.userId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">
          Quản Lý Yêu Cầu Rút Tiền
        </h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, User ID..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Ngân hàng
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Số tiền
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Ngày yêu cầu
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.username}
                      </p>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      <p className="text-xs text-gray-500">
                        ID: {request.userId}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.bankName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.accountNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.accountName}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-lg text-gray-900">
                    {formatCurrency(request.amount)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {request.status === "pending" && "Chờ xử lý"}
                      {request.status === "approved" && "Đã phê duyệt"}
                      {request.status === "rejected" && "Đã từ chối"}
                      {request.status === "completed" && "Hoàn thành"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(request.requestDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        navigate(`/admin/withdraw-requests/${request.id}`)
                      }
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
