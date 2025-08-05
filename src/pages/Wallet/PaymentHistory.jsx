import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  RefreshCw,
  FileText,
} from "lucide-react";
import { fetchWalletHistory } from "../../api/axios";

const PaymentHistory = ({ refreshTrigger = 0 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, completed, failed

  useEffect(() => {
    loadTransactionHistory();
  }, [refreshTrigger]); // Thêm refreshTrigger vào dependency

  const loadTransactionHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWalletHistory();
      console.log("Transaction history data:", data);

      // Xử lý data từ API - có thể là array hoặc object chứa array
      let transactionList = [];

      if (Array.isArray(data)) {
        transactionList = data;
      } else if (data && Array.isArray(data.transactions)) {
        transactionList = data.transactions;
      } else if (data && Array.isArray(data.deposits)) {
        transactionList = data.deposits;
      } else if (data && typeof data === "object") {
        // Nếu data là object, tìm property đầu tiên là array
        const arrayProperty = Object.values(data).find((value) =>
          Array.isArray(value)
        );
        if (arrayProperty) {
          transactionList = arrayProperty;
        }
      }

      console.log("Processed transaction list:", transactionList);
      setTransactions(transactionList);
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          label: "Thành công",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "pending":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          label: "Đang xử lý",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "failed":
      case "cancelled":
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          label: "Thất bại",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          label: "Không xác định",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("vi-VN"),
        time: date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return { date: "N/A", time: "N/A" };
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === "number") {
      return amount.toLocaleString("vi-VN");
    } else if (typeof amount === "string" && !isNaN(parseFloat(amount))) {
      return parseFloat(amount).toLocaleString("vi-VN");
    }
    return "0";
  };

  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((transaction) => {
        if (filter === "all") return true;
        return transaction.status?.toLowerCase() === filter;
      })
    : [];

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">
            Đang tải lịch sử giao dịch...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTransactionHistory}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" />
          <span className="text-lg font-semibold text-gray-700">
            Chi tiết giao dịch
          </span>
        </div>
        <button
          onClick={loadTransactionHistory}
          className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Tất cả" },
          { key: "completed", label: "Thành công" },
          { key: "pending", label: "Đang xử lý" },
          { key: "failed", label: "Thất bại" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {!Array.isArray(transactions) ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <p className="text-orange-600 text-lg mb-2">Dữ liệu không hợp lệ</p>
          <p className="text-gray-500 text-sm mb-4">
            API trả về dữ liệu không đúng định dạng array
          </p>
          <button
            onClick={loadTransactionHistory}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === "all"
              ? "Chưa có giao dịch nào"
              : `Không có giao dịch ${
                  filter === "completed"
                    ? "thành công"
                    : filter === "pending"
                    ? "đang xử lý"
                    : "thất bại"
                }`}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Các giao dịch nạp tiền sẽ hiển thị tại đây
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction, index) => {
            const statusInfo = getStatusInfo(transaction.status);
            const { date, time } = formatDate(
              transaction.created_at || transaction.createdAt
            );

            return (
              <div
                key={transaction.id || index}
                className={`border rounded-xl p-4 transition-all hover:shadow-md ${statusInfo.borderColor} ${statusInfo.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {statusInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          Nạp tiền ví
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </span>
                        {transaction.deposit_code && (
                          <span className="text-xs text-gray-400">
                            Mã: {transaction.deposit_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                      <DollarSign className="w-4 h-4" />+
                      {formatAmount(transaction.amount)} đ
                    </div>
                    {transaction.user_id && (
                      <div className="text-xs text-gray-400">
                        ID: {transaction.user_id}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {Array.isArray(transactions) && filteredTransactions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Tổng {filteredTransactions.length} giao dịch</span>
            <span>
              Tổng tiền:{" "}
              <span className="font-semibold text-green-600">
                {formatAmount(
                  filteredTransactions
                    .filter((t) => t.status?.toLowerCase() === "completed")
                    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
                )}{" "}
                đ
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
