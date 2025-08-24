import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { fetchWalletHistory } from "../../api/axios";

const DepositHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deposit, setDeposit] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchWalletHistory();

        let deposits = [];
        if (Array.isArray(res)) deposits = res;
        else if (Array.isArray(res?.transactions)) deposits = res.transactions;
        else if (Array.isArray(res?.deposits)) deposits = res.deposits;
        else if (Array.isArray(res?.data)) deposits = res.data;

        const found = deposits.find(
          (d) =>
            String(
              d.id || d.deposit_id || d.transaction_id || d.deposit_code
            ) === String(id)
        );
        if (!found) throw new Error("Không tìm thấy giao dịch nạp tiền");

        setDeposit(found);
      } catch (e) {
        setError(e.message || "Lỗi tải chi tiết nạp tiền");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN").format(Number(amount || 0));

  const statusInfo = (status) => {
    const s = String(status || "").toLowerCase();
    if (["completed", "success", "hoàn thành", "thành công"].includes(s))
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Thành công",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    if (["pending", "đang xử lý", "processing"].includes(s))
      return {
        icon: <Clock className="w-4 h-4" />,
        text: "Đang xử lý",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      };
    return {
      icon: <XCircle className="w-4 h-4" />,
      text: "Thất bại",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  };

  if (loading) return <div className="p-8">Đang tải chi tiết...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!deposit) return <div className="p-8">Không có dữ liệu</div>;

  const sInfo = statusInfo(deposit.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết nạp tiền #{deposit.id}
              </h1>
              <div
                className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sInfo.bg} ${sInfo.color} border ${sInfo.border}`}
              >
                {sInfo.icon}
                {sInfo.text}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600">Số tiền</div>
              <div className="font-semibold text-green-600 text-xl">
                +{formatAmount(deposit.amount)} đ
              </div>
            </div>
            <div>
              <div className="text-gray-600">Mã giao dịch</div>
              <div className="font-semibold">
                {deposit.deposit_code || deposit.transaction_id || deposit.id}
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              Thời gian
            </div>
            <div className="font-semibold">
              {new Date(deposit.created_at || deposit.createdAt).toLocaleString(
                "vi-VN"
              )}
            </div>
            {deposit.bank_name && (
              <div className="md:col-span-2 flex items-center gap-2 text-gray-700">
                <Building className="w-4 h-4" /> Ngân hàng:{" "}
                <span className="font-medium">{deposit.bank_name}</span>
              </div>
            )}
            {deposit.description && (
              <div className="md:col-span-2">
                <div className="text-gray-600">Mô tả</div>
                <div className="font-medium">{deposit.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositHistoryDetails;
