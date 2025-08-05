import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  RefreshCw,
  Building,
} from "lucide-react";
import { fetchWithdrawHistory } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const WithdrawHistory = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchWithdrawHistory();

      // Handle different response formats
      if (response?.success && Array.isArray(response.withdrawHistory)) {
        setWithdrawals(response.withdrawHistory);
      } else if (Array.isArray(response?.withdrawHistory)) {
        setWithdrawals(response.withdrawHistory);
      } else if (Array.isArray(response)) {
        setWithdrawals(response);
      } else {
        setWithdrawals([]);
      }
    } catch (error) {
      console.error("Error fetching withdraw history:", error);
      setError("Không thể tải lịch sử rút tiền. Vui lòng thử lại.");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "đang xử lý":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Đang xử lý",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "completed":
      case "hoàn thành":
      case "thành công":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Hoàn thành",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "rejected":
      case "từ chối":
      case "thất bại":
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: "Từ chối",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: status || "Không xác định",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử rút tiền...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/withdraw")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Lịch sử rút tiền
                </h1>
                <p className="text-sm text-gray-600">
                  {withdrawals.length} yêu cầu
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Lỗi</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-2 text-red-600 text-sm underline hover:no-underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Chưa có yêu cầu rút tiền
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa tạo yêu cầu rút tiền nào
            </p>
            <button
              onClick={() => navigate("/withdraw")}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Tạo yêu cầu rút tiền
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal, index) => {
              const statusInfo = getStatusInfo(withdrawal.status);

              return (
                <div
                  key={withdrawal.id || index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
                    >
                      <span className={statusInfo.color}>
                        {statusInfo.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      #{withdrawal.id || index + 1}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatAmount(withdrawal.amount)} VNĐ
                      </p>
                      <p className="text-sm text-gray-600">Số tiền rút</p>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">
                        Thông tin ngân hàng
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-medium">
                          {withdrawal.bank_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tài khoản:</span>
                        <span className="font-medium">
                          {withdrawal.account_number
                            ? `***${withdrawal.account_number.slice(-4)}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Tạo: {formatDate(withdrawal.created_at)}</span>
                    </div>
                    {withdrawal.processed_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Xử lý: {formatDate(withdrawal.processed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/wallet")}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Về ví
          </button>
          <button
            onClick={() => navigate("/withdraw")}
            className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Tạo yêu cầu mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawHistory;
