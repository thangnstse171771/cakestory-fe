import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Fake dữ liệu trực tiếp trong file (nếu không có localStorage)
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

export default function WithdrawRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mockWithdrawRequests);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState("");
  const [showAction, setShowAction] = useState(false);

  // Luôn lấy được 1 request để hiển thị, nếu không có id thì lấy phần tử đầu tiên
  const request =
    requests.find((r) => String(r.id) === String(id)) || requests[0];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAction = (type) => {
    setActionType(type);
    setShowAction(true);
  };

  const handleConfirmAction = () => {
    if (!adminNote.trim()) {
      alert("Vui lòng nhập ghi chú cho hành động này!");
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: actionType === "approve" ? "approved" : "rejected",
              processedDate: new Date().toISOString(),
              adminNote,
            }
          : r
      )
    );
    setShowAction(false);
    setAdminNote("");
    setActionType("");
  };

  const handleComplete = () => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: "completed",
              processedDate: new Date().toISOString(),
            }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-pink-600 hover:underline"
        >
          ← Quay lại danh sách
        </button>
        <h1 className="text-2xl font-bold text-pink-600 mb-4">
          Chi tiết yêu cầu #{request.id}
        </h1>
        <div className="mb-4">
          <span className="font-semibold">Trạng thái: </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              request.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : request.status === "approved"
                ? "bg-blue-100 text-blue-700"
                : request.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {request.status === "pending" && "Chờ xử lý"}
            {request.status === "approved" && "Đã phê duyệt"}
            {request.status === "rejected" && "Đã từ chối"}
            {request.status === "completed" && "Hoàn thành"}
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
            {request.note || "Không có ghi chú"}
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
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleAction("approve")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Phê duyệt
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Từ chối
            </button>
          </div>
        )}
        {request.status === "approved" && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleComplete}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Hoàn tất
            </button>
          </div>
        )}
        {/* Action dialog */}
        {showAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="text-lg font-bold mb-4">
                {actionType === "approve" ? "Phê duyệt" : "Từ chối"} yêu cầu
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">
                  Ghi chú (bắt buộc)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                  placeholder={`Nhập lý do ${
                    actionType === "approve" ? "phê duyệt" : "từ chối"
                  }...`}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAction(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionType === "approve" ? "Phê duyệt" : "Từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
