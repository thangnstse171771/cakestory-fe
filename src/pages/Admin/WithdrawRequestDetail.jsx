import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchWithdrawRequestById,
  fetchAllUsers,
  confirmWithdrawRequest,
  cancelWithdrawRequest,
} from "../../api/axios";

export default function WithdrawRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users data for mapping user IDs to names
  const fetchUsersData = async () => {
    try {
      const response = await fetchAllUsers();
      let usersData = [];
      if (response?.users && Array.isArray(response.users))
        usersData = response.users;
      else if (Array.isArray(response?.data)) usersData = response.data;
      else if (Array.isArray(response)) usersData = response;
      setUsers(usersData);
      return usersData;
    } catch {
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
        phone: user.phone || "Chưa cập nhật",
      };
    }
    return {
      username: `User ${userId}`,
      email: `user${userId}@example.com`,
      phone: "Chưa cập nhật",
    };
  };

  // Fetch withdraw request detail
  const fetchWithdrawDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("ID yêu cầu rút tiền không hợp lệ");
        return;
      }
      const [usersData, withdrawResponse] = await Promise.all([
        fetchUsersData(),
        fetchWithdrawRequestById(id),
      ]);
      let withdrawData = null;
      if (withdrawResponse?.withdrawHistory)
        withdrawData = withdrawResponse.withdrawHistory;
      else if (withdrawResponse?.data?.withdrawHistory)
        withdrawData = withdrawResponse.data.withdrawHistory;
      else if (withdrawResponse?.data?.withdraw)
        withdrawData = withdrawResponse.data.withdraw;
      else if (withdrawResponse?.withdraw)
        withdrawData = withdrawResponse.withdraw;
      else if (withdrawResponse?.data) withdrawData = withdrawResponse.data;
      else if (withdrawResponse) withdrawData = withdrawResponse;
      if (!withdrawData) {
        setError("Không tìm thấy yêu cầu rút tiền");
        return;
      }
      const userInfo = getUserInfo(
        withdrawData.user_id || withdrawData.userId,
        usersData
      );
      const transformedRequest = {
        id: withdrawData.id,
        userId: withdrawData.user_id || withdrawData.userId,
        username: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone,
        bankName:
          withdrawData.bank_name || withdrawData.bankName || "Chưa cập nhật",
        accountNumber:
          withdrawData.account_number ||
          withdrawData.accountNumber ||
          "Chưa cập nhật",
        accountName:
          withdrawData.account_name ||
          withdrawData.accountName ||
          userInfo.username ||
          "Chưa cập nhật",
        amount: parseFloat(withdrawData.amount) || 0,
        status:
          withdrawData.status === "pending"
            ? "pending"
            : withdrawData.status === "completed"
            ? "completed"
            : withdrawData.status === "cancelled"
            ? "cancelled"
            : withdrawData.status,
        requestDate:
          withdrawData.created_at ||
          withdrawData.createdAt ||
          withdrawData.requestDate,
        processedDate:
          withdrawData.updated_at ||
          withdrawData.updatedAt ||
          withdrawData.processedDate,
        note:
          withdrawData.note || withdrawData.description || "Không có ghi chú",
        adminNote: withdrawData.admin_note || withdrawData.adminNote || "",
      };
      setRequest(transformedRequest);
    } catch (error) {
      let errorMessage = "Không thể tải chi tiết yêu cầu rút tiền";
      if (error.response?.status === 404) {
        errorMessage =
          "Không tìm thấy yêu cầu rút tiền với ID này. Có thể ID không tồn tại hoặc đã bị xóa.";
        setTimeout(() => navigate("/admin/withdraw-requests"), 3000);
      } else if (error.response?.data?.message)
        errorMessage = error.response.data.message;
      else if (error.response?.data?.error)
        errorMessage = error.response.data.error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchWithdrawDetail();
  }, [id]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const handleAction = (type) => {
    setActionType(type);
    setShowAction(true);
  };

  const handleConfirmAction = async () => {
    try {
      setActionLoading(true);
      try {
        if (actionType === "approve") await confirmWithdrawRequest(id);
        else await cancelWithdrawRequest(id);
        alert(
          `${actionType === "approve" ? "Duyệt" : "Hủy"} yêu cầu thành công!`
        );
        setRequest((prev) => ({
          ...prev,
          status: actionType === "approve" ? "completed" : "cancelled",
          processedDate: new Date().toISOString(),
        }));
        setShowAction(false);
        setActionType("");
        await fetchWithdrawDetail();
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          const continueAnyway = window.confirm(
            `⚠️ Backend chưa hỗ trợ API ${
              actionType === "approve" ? "duyệt" : "hủy"
            } yêu cầu rút tiền.\n\nBạn có muốn cập nhật trạng thái local tạm thời không?\n(Lưu ý: Trạng thái này chỉ hiển thị trên frontend và sẽ bị reset khi refresh trang)`
          );
          if (continueAnyway) {
            setRequest((prev) => ({
              ...prev,
              status: actionType === "approve" ? "completed" : "cancelled",
              processedDate: new Date().toISOString(),
              adminNote: `[LOCAL UPDATE] ${
                actionType === "approve" ? "Duyệt" : "Hủy"
              } tạm thời bởi admin lúc ${new Date().toLocaleString("vi-VN")}`,
            }));
            alert(
              `✅ Đã cập nhật trạng thái local thành công!\n\n⚠️ Lưu ý: Đây chỉ là cập nhật tạm thời trên giao diện.\nBackend cần được cập nhật để hỗ trợ API này.`
            );
            setShowAction(false);
            setActionType("");
          } else throw apiError;
        } else throw apiError;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Lỗi khi ${actionType === "approve" ? "duyệt" : "hủy"} yêu cầu`;
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-pink-600 font-medium">Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-pink-600 hover:underline"
          >
            ← Quay lại danh sách
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600">⚠️ {error}</span>
              <button
                onClick={fetchWithdrawDetail}
                className="ml-auto text-red-600 hover:text-red-700 font-medium mr-3"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate("/admin/withdraw-requests")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Về danh sách
              </button>
            </div>
            {error.includes("ID này") && (
              <div className="mt-2 text-sm text-gray-600">
                Sẽ tự động chuyển về danh sách sau 3 giây...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No request found
  if (!request) {
    return (
      <div className="min-h-screen bg-pink-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-pink-600 hover:underline"
          >
            ← Quay lại danh sách
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Không tìm thấy yêu cầu rút tiền
            </p>
            <button
              onClick={fetchWithdrawDetail}
              className="text-pink-600 hover:text-pink-700 font-medium"
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
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-pink-600 hover:underline"
          >
            ← Quay lại danh sách
          </button>
          <button
            onClick={fetchWithdrawDetail}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            disabled={loading}
          >
            Làm Mới
          </button>
        </div>
        <h1 className="text-2xl font-bold text-pink-600 mb-4">
          Chi tiết yêu cầu #{request.id}
        </h1>
        <div className="mb-4">
          <span className="font-semibold">Trạng thái: </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              request.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : request.status === "completed"
                ? "bg-green-100 text-green-700"
                : request.status === "cancelled"
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {request.status === "pending" && "Chờ xử lý"}
            {request.status === "completed" && "Hoàn thành"}
            {request.status === "cancelled" && "Đã hủy"}
          </span>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold mb-1">Tên người dùng</div>
            <div>{request.username}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Email</div>
            <div>{request.email}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Số điện thoại</div>
            <div>{request.phone}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">User ID</div>
            <div>{request.userId}</div>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold mb-1">Ngân hàng</div>
            <div>{request.bankName}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Số tài khoản</div>
            <div>{request.accountNumber}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Tên tài khoản</div>
            <div>{request.accountName}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Số tiền</div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(request.amount)}
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Ngày yêu cầu</div>
          <div>{new Date(request.requestDate).toLocaleString("vi-VN")}</div>
        </div>
        {request.processedDate && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Ngày xử lý</div>
            <div>{new Date(request.processedDate).toLocaleString("vi-VN")}</div>
          </div>
        )}
        <div className="mb-4">
          <div className="font-semibold mb-1">Ghi chú của user</div>
          <div className="bg-gray-50 p-3 rounded-lg">
            {request.note || "Người dùng không để lại ghi chú"}
          </div>
        </div>
        {request.adminNote && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Ghi chú của admin</div>
            <div className="bg-blue-50 p-3 rounded-lg">{request.adminNote}</div>
          </div>
        )}
        {/* Action buttons */}
        {request.status === "pending" && (
          <>
            <div className="mb-2 text-sm text-gray-600">
              Debug: Status = "{request.status}"
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleAction("approve")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                {actionLoading ? "Đang xử lý..." : "Duyệt"}
              </button>
              <button
                onClick={() => handleAction("cancel")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                {actionLoading ? "Đang xử lý..." : "Hủy"}
              </button>
            </div>
          </>
        )}
        {request.status !== "pending" && (
          <div className="mb-2 text-sm text-gray-600">
            Debug: Status = "{request.status}" (không phải pending, không hiển
            thị buttons)
          </div>
        )}
        {/* Action dialog */}
        {showAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="text-lg font-bold mb-4">
                Xác nhận {actionType === "approve" ? "duyệt" : "hủy"} yêu cầu
              </div>
              <div className="mb-6 text-gray-600">
                Bạn có chắc chắn muốn{" "}
                {actionType === "approve" ? "duyệt" : "hủy"} yêu cầu rút tiền #
                {request.id} không?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAction(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Đang xử lý..."
                    : actionType === "approve"
                    ? "Duyệt"
                    : "Hủy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
