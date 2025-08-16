"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWithdrawHistory, fetchAllUsers } from "../../api/axios";

export default function WithdrawRequests() {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [totalStats, setTotalStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const navigate = useNavigate();

  // Fetch withdraw requests from API
  useEffect(() => {
    fetchWithdrawData();
  }, [filter]);

  const fetchWithdrawData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch song song: lịch sử rút tiền + danh sách user (để map tên)
      const [response, usersResponse] = await Promise.all([
        fetchAllWithdrawHistory(),
        fetchAllUsers().catch(() => null),
      ]);
      console.log("Withdraw history response:", response);

      // Chuẩn hoá root để hỗ trợ nhiều dạng trả về
      const root = response?.data ?? response ?? {};

      // Build users map (id -> user)
      const usersRoot = usersResponse?.data ?? usersResponse ?? {};
      let usersArray = [];
      if (Array.isArray(usersRoot?.users)) usersArray = usersRoot.users;
      else if (Array.isArray(usersRoot?.data)) usersArray = usersRoot.data;
      else if (Array.isArray(usersRoot)) usersArray = usersRoot;
      const usersMap = new Map();
      usersArray.forEach((u) => {
        const uid = u?.id ?? u?.user_id ?? u?.userId;
        if (uid != null) usersMap.set(String(uid), u);
      });

      // Tìm mảng withdraws/withdrawHistory ở các vị trí khả dĩ
      let withdraws = [];
      if (Array.isArray(root.withdraws)) withdraws = root.withdraws;
      else if (Array.isArray(root.withdrawHistory))
        withdraws = root.withdrawHistory;
      else if (Array.isArray(root.data?.withdraws))
        withdraws = root.data.withdraws;
      else if (Array.isArray(root.data?.withdrawHistory))
        withdraws = root.data.withdrawHistory;

      if (Array.isArray(withdraws)) {
        const normalizeStatus = (s) => {
          const v = String(s || "").toLowerCase();
          if (
            [
              "completed",
              "complete",
              "done",
              "success",
              "thanh cong",
              "hoàn thành",
              "thành công",
            ].includes(v)
          )
            return "completed";
          if (["approved", "approve"].includes(v)) return "approved";
          if (
            [
              "rejected",
              "reject",
              "failed",
              "fail",
              "error",
              "từ chối",
              "that bai",
            ].includes(v)
          )
            return "rejected";
          if (["cancelled", "canceled", "cancel"].includes(v))
            return "rejected"; // map cancel -> rejected
          return "pending";
        };

        const toNumber = (a) => {
          if (typeof a === "number") return a;
          if (a == null) return 0;
          let s = String(a).trim();
          s = s.replace(/[^0-9.,-]/g, "");
          if (s.includes(",") && s.includes(".")) {
            // xác định dấu thập phân
            const lastComma = s.lastIndexOf(",");
            const lastDot = s.lastIndexOf(".");
            const dec = lastComma > lastDot ? "," : ".";
            if (dec === ",") {
              s = s.replace(/\./g, "");
              s = s.replace(",", ".");
            } else {
              s = s.replace(/,/g, "");
            }
          } else if (s.includes(",")) {
            s = s.replace(/,/g, "");
          }
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : 0;
        };

        // Transform data để phù hợp với UI (có fallback từ usersMap)
        const transformedData = withdraws.map((withdraw) => {
          const uid = withdraw.user_id ?? withdraw.userId ?? "";
          const userFromMap = usersMap.get(String(uid));
          const username =
            withdraw.user?.full_name ||
            withdraw.user?.username ||
            userFromMap?.full_name ||
            userFromMap?.username ||
            `User ${uid}`;
          const email =
            withdraw.user?.email || userFromMap?.email || "Không có email";
          const phone =
            withdraw.user?.phone_number ||
            withdraw.user?.phone ||
            userFromMap?.phone_number ||
            userFromMap?.phone ||
            "Không có SĐT";
          const accountName =
            withdraw.account_name ||
            withdraw.user?.full_name ||
            userFromMap?.full_name ||
            username; // fallback: hiển thị full name/username thay vì N/A

          return {
            id: withdraw.id,
            userId: uid,
            username,
            email,
            phone,
            bankName: withdraw.bank_name || "Không có thông tin ngân hàng",
            accountNumber: withdraw.account_number || "N/A",
            accountName,
            amount: toNumber(withdraw.amount),
            status: normalizeStatus(withdraw.status),
            requestDate: withdraw.created_at || withdraw.createdAt,
            processedDate:
              (withdraw.updated_at || withdraw.updatedAt) !==
              (withdraw.created_at || withdraw.createdAt)
                ? withdraw.updated_at || withdraw.updatedAt
                : null,
            note: withdraw.note || "Không có ghi chú",
            adminNote: withdraw.admin_note || "",
          };
        });

        setWithdrawRequests(transformedData);

        // Tính toán thống kê
        const stats = calculateStats(transformedData);
        setTotalStats(stats);
      } else {
        console.warn("Unexpected API response format:", response);
        setWithdrawRequests([]);
      }
    } catch (error) {
      console.error("Lỗi khi fetch withdraw data:", error);
      setError("Không thể tải dữ liệu yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      totalAmount: 0,
      pendingAmount: 0,
    };

    data.forEach((request) => {
      // Count by status
      if (request.status === "pending") stats.pending++;
      else if (request.status === "approved") stats.approved++;
      else if (request.status === "rejected") stats.rejected++;
      else if (request.status === "completed") stats.completed++;

      // Sum amounts
      stats.totalAmount += request.amount || 0;
      if (request.status === "pending") {
        stats.pendingAmount += request.amount || 0;
      }
    });

    return stats;
  };

  // Lọc theo filter và search
  const filteredRequests = withdrawRequests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter;
    const keyword = (search || "").toLowerCase();
    const matchesSearch =
      keyword === "" ||
      (request.username || "").toLowerCase().includes(keyword) ||
      (request.email || "").toLowerCase().includes(keyword) ||
      String(request.userId || "")
        .toLowerCase()
        .includes(keyword);
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <span className="ml-4 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
            <p className="text-xl font-semibold mb-2">Có lỗi xảy ra</p>
            <p>{error}</p>
            <button
              onClick={fetchWithdrawData}
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">
          Quản Lý Yêu Cầu Rút Tiền
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng yêu cầu
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalStats.total}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {totalStats.pending}
            </div>
            <div className="text-xs text-gray-500">
              {formatCurrency(totalStats.pendingAmount)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Đã hoàn thành
            </div>
            <div className="text-2xl font-bold text-green-600">
              {totalStats.completed}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Tổng tiền</div>
            <div className="text-2xl font-bold text-pink-600">
              {formatCurrency(totalStats.totalAmount)}
            </div>
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : request.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {request.status === "pending" && "Chờ xử lý"}
                      {request.status === "approved" && "Đã phê duyệt"}
                      {request.status === "rejected" && "Đã từ chối"}
                      {request.status === "completed" && "Hoàn thành"}
                      {![
                        "pending",
                        "approved",
                        "rejected",
                        "completed",
                      ].includes(request.status) && request.status}
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
