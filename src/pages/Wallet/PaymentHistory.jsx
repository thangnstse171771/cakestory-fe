import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Calendar,
  DollarSign,
  RefreshCw,
  FileText,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { fetchWalletHistory } from "../../api/axios";

const PaymentHistory = ({ refreshTrigger = 0 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Date filter states (YYYY-MM-DD)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadTransactionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const loadTransactionHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWalletHistory();
      let transactionList = [];
      if (Array.isArray(data)) transactionList = data;
      else if (data && Array.isArray(data.transactions))
        transactionList = data.transactions;
      else if (data && Array.isArray(data.deposits))
        transactionList = data.deposits;
      else if (data && typeof data === "object") {
        const arrayProperty = Object.values(data).find((v) => Array.isArray(v));
        if (arrayProperty) transactionList = arrayProperty;
      }
      setTransactions(transactionList);
    } catch (e) {
      setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Only keep successful (completed/success) deposit top-ups
  const successfulTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => {
        const status = (t.status || t.transaction_status || "").toLowerCase();
        return status === "completed" || status === "success"; // can extend if needed
      })
    : [];

  const normalizeDate = (dStr) => {
    if (!dStr) return null;
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  // Apply date range filter (inclusive)
  const dateFiltered = successfulTransactions.filter((t) => {
    const d = normalizeDate(
      t.created_at || t.createdAt || t.updated_at || t.updatedAt
    );
    if (!d) return false; // skip invalid dates
    if (startDate) {
      const s = new Date(startDate + "T00:00:00");
      if (d < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate + "T23:59:59");
      if (d > e) return false;
    }
    return true;
  });

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("vi-VN"),
        time: date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: "N/A", time: "N/A" };
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === "number") return amount.toLocaleString("vi-VN");
    if (typeof amount === "string" && !isNaN(parseFloat(amount)))
      return parseFloat(amount).toLocaleString("vi-VN");
    return "0";
  };

  const applyPreset = (days) => {
    if (days === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const startObj = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const start = startObj.toISOString().slice(0, 10);
    setStartDate(start);
    setEndDate(end);
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full" />
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
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" />
          <span className="text-lg font-semibold text-gray-700">
            Nạp tiền thành công
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

      {/* Date Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          />
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          <button
            onClick={() => applyPreset(7)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition-colors"
          >
            7 ngày
          </button>
          <button
            onClick={() => applyPreset(30)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition-colors"
          >
            30 ngày
          </button>
          <button
            onClick={() => applyPreset(90)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition-colors"
          >
            90 ngày
          </button>
          <button
            onClick={() => applyPreset("all")}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* List */}
      {dateFiltered.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Không có giao dịch trong khoảng thời gian đã chọn
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Hãy điều chỉnh bộ lọc ngày hoặc nạp tiền vào ví của bạn
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dateFiltered.map((t, idx) => {
            const { date, time } = formatDateTime(
              t.created_at || t.createdAt || t.updated_at || t.updatedAt
            );
            return (
              <div
                key={t.id || idx}
                className="border border-green-200 bg-green-50 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          Nạp tiền ví
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          Thành công
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {time}
                        </span>
                        {t.deposit_code && (
                          <span className="text-xs text-gray-400">
                            Mã: {t.deposit_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-auto">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                      <DollarSign className="w-4 h-4" />+
                      {formatAmount(t.amount)} đ
                    </div>
                    {t.user_id && (
                      <div className="text-xs text-gray-400">
                        ID: {t.user_id}
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
      {dateFiltered.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-2">
            <span>Tổng {dateFiltered.length} giao dịch</span>
            <span>
              Tổng tiền:{" "}
              <span className="font-semibold text-green-600">
                {formatAmount(
                  dateFiltered.reduce(
                    (sum, t) => sum + (parseFloat(t.amount) || 0),
                    0
                  )
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
