"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWithdrawHistory, fetchAllUsers } from "../../api/axios";

export default function WithdrawRequests() {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [users, setUsers] = useState([]); // Store all users data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Fetch all users data for mapping user IDs to names
  const fetchUsersData = async () => {
    try {
      console.log("Fetching all users...");
      const response = await fetchAllUsers();
      console.log("Users response:", response);

      let usersData = [];
      if (response?.users && Array.isArray(response.users)) {
        usersData = response.users;
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }

      console.log("Processed users data:", usersData);
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Get user info by ID
  const getUserInfo = (userId, usersData) => {
    const user = usersData.find(
      (u) => u.id === userId || u.id === parseInt(userId)
    );
    if (user) {
      return {
        username:
          user.full_name || user.username || user.name || `User ${userId}`,
        email: user.email || `user${userId}@example.com`,
        phone: user.phone || "N/A",
      };
    }
    return {
      username: `User ${userId}`,
      email: `user${userId}@example.com`,
      phone: "N/A",
    };
  };

  // Fetch withdraw requests from API
  const fetchWithdrawRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both users and withdraw requests
      console.log("Fetching users and withdraw requests...");
      const [usersData, withdrawResponse] = await Promise.all([
        fetchUsersData(),
        fetchAllWithdrawHistory(),
      ]);

      console.log("Withdraw requests response:", withdrawResponse);

      let withdrawsData = [];

      // Handle different possible response structures
      if (
        withdrawResponse?.data?.withdrawHistory &&
        Array.isArray(withdrawResponse.data.withdrawHistory)
      ) {
        withdrawsData = withdrawResponse.data.withdrawHistory;
      } else if (
        withdrawResponse?.withdrawHistory &&
        Array.isArray(withdrawResponse.withdrawHistory)
      ) {
        withdrawsData = withdrawResponse.withdrawHistory;
      } else if (
        withdrawResponse?.data?.withdraws &&
        Array.isArray(withdrawResponse.data.withdraws)
      ) {
        withdrawsData = withdrawResponse.data.withdraws;
      } else if (
        withdrawResponse?.withdraws &&
        Array.isArray(withdrawResponse.withdraws)
      ) {
        withdrawsData = withdrawResponse.withdraws;
      } else if (Array.isArray(withdrawResponse?.data)) {
        withdrawsData = withdrawResponse.data;
      } else if (Array.isArray(withdrawResponse)) {
        withdrawsData = withdrawResponse;
      }

      console.log("Processed withdraws data:", withdrawsData);

      // Transform API data to match component structure
      const transformedData = withdrawsData.map((withdraw) => {
        const userInfo = getUserInfo(
          withdraw.user_id || withdraw.userId,
          usersData
        );

        return {
          id: withdraw.id,
          userId: withdraw.user_id || withdraw.userId,
          username: userInfo.username,
          email: userInfo.email,
          phone: userInfo.phone,
          bankName: withdraw.bank_name || withdraw.bankName || "N/A",
          accountNumber:
            withdraw.account_number || withdraw.accountNumber || "N/A",
          accountName:
            withdraw.account_name ||
            withdraw.accountName ||
            userInfo.username ||
            "N/A",
          amount: parseFloat(withdraw.amount) || 0,
          status:
            withdraw.status === "pending"
              ? "pending"
              : withdraw.status === "completed"
              ? "completed"
              : withdraw.status === "cancelled"
              ? "cancelled"
              : withdraw.status, // Keep original if not recognized
          requestDate:
            withdraw.created_at || withdraw.createdAt || withdraw.requestDate,
          processedDate:
            withdraw.updated_at || withdraw.updatedAt || withdraw.processedDate,
          note: withdraw.note || withdraw.description || "N/A",
          adminNote: withdraw.admin_note || withdraw.adminNote || "",
        };
      });

      console.log("Transformed withdraw requests:", transformedData);
      console.log(
        "Available IDs:",
        transformedData.map((w) => w.id)
      );
      setWithdrawRequests(transformedData);
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      setError("Không thể tải danh sách yêu cầu rút tiền");
      setWithdrawRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchWithdrawRequests();
  }, []);

  // Refresh both users and withdraw requests
  const handleRefresh = async () => {
    await fetchWithdrawRequests();
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-600">
            Quản Lý Yêu Cầu Rút Tiền
          </h1>
          <div className="flex items-center gap-4">
            {loading && (
              <div className="text-pink-600 font-medium">Đang tải...</div>
            )}
            <button
              onClick={handleRefresh}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              Làm Mới
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600">⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">Tổng Yêu Cầu</h3>
            <p className="text-2xl font-bold text-gray-900">
              {withdrawRequests.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">Chờ Duyệt</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {withdrawRequests.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">Đã Hoàn Thành</h3>
            <p className="text-2xl font-bold text-green-600">
              {withdrawRequests.filter((r) => r.status === "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">Đã Hủy</h3>
            <p className="text-2xl font-bold text-gray-600">
              {withdrawRequests.filter((r) => r.status === "cancelled").length}
            </p>
          </div>
        </div>
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
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-pink-600 font-medium">
                Đang tải dữ liệu...
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-2">
                  Không có yêu cầu rút tiền nào
                </p>
                <button
                  onClick={handleRefresh}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
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
                      <span className="px-3 py-1 rounded-full text-xs font-medium">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "cancelled"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status === "pending" && "Chờ xử lý"}
                          {request.status === "completed" && "Hoàn thành"}
                          {request.status === "cancelled" && "Đã hủy"}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(request.requestDate).toLocaleDateString(
                        "vi-VN"
                      )}
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
          )}
        </div>
      </div>
    </div>
  );
}
