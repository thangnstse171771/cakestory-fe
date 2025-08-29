import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllWalletTransactions, fetchOrderById } from "../../api/axios";

const statusMap = {
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  pending: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
};

const typeLabel = {
  order_payment: "Thanh toán đơn hàng",
  ai_generation: "AI Generation",
  withdraw: "Rút tiền",
  deposit: "Nạp tiền",
};

// Map trạng thái đơn hàng giống OrderTrackingForm
const orderStatusVN = (s) => {
  const v = String(s || "").toLowerCase();
  if (["pending", "new"].includes(v)) return "Đang chờ xử lý";
  if (
    ["accepted", "confirmed", "order_accepted", "received", "ordered"].includes(
      v
    )
  )
    return "Đã tiếp nhận";
  if (
    [
      "ready",
      "ready_to_ship",
      "prepared",
      "preparing",
      "preparedfordelivery",
      "prepared_for_delivery",
    ].includes(v)
  )
    return "Sẵn sàng giao hàng";
  if (["shipping", "delivering", "in_transit", "shipped"].includes(v))
    return "Đang vận chuyển";
  if (["done", "delivered", "completed", "complete"].includes(v))
    return "Hoàn tất";
  if (["complaint", "complaining", "disputed"].includes(v))
    return "Đang khiếu nại";
  if (["cancel", "canceled", "cancelled"].includes(v)) return "Đã hủy";
  return s || "—";
};

// Chuẩn hoá key trạng thái để gán màu
const normalizeOrderStatusKey = (s) => {
  const v = String(s || "").toLowerCase();
  if (["pending", "new"].includes(v)) return "pending";
  if (
    ["accepted", "confirmed", "order_accepted", "received", "ordered"].includes(
      v
    )
  )
    return "ordered";
  if (
    [
      "ready",
      "ready_to_ship",
      "prepared",
      "preparing",
      "preparedfordelivery",
      "prepared_for_delivery",
    ].includes(v)
  )
    return "prepared";
  if (["shipping", "delivering", "in_transit", "shipped"].includes(v))
    return "shipped";
  if (["done", "delivered", "completed", "complete"].includes(v))
    return "completed";
  if (["complaint", "complaining", "disputed"].includes(v))
    return "complaining";
  if (["cancel", "canceled", "cancelled"].includes(v)) return "cancelled";
  return "other";
};

const orderStatusBadgeClass = (key) => {
  switch (key) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "ordered":
      return "bg-cyan-100 text-cyan-700";
    case "prepared":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-orange-100 text-orange-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "complaining":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// Localize mô tả giao dịch AI Generation
const localizeAIDescription = (rawDesc = "", status) => {
  const statusStr = String(status || "").toLowerCase();
  const designMatch = rawDesc.match(/design ID\s*(\d+)/i) || rawDesc.match(/design\s*#?(\d+)/i);
  const designId = designMatch ? designMatch[1] : null;
  const action = designId ? `Tạo hình AI cho thiết kế #${designId}` : 'Tạo hình AI';
  if (statusStr.includes('pend')) return `${action} đang xử lý`;
  if (/(fail|error|reject|cancel)/i.test(statusStr) || /(fail|error|cancel)/i.test(rawDesc)) return `${action} thất bại`;
  if (statusStr.includes('complete') || statusStr.includes('success')) return `${action} đã hoàn thành`;
  if (/completed successfully/i.test(rawDesc)) return `${action} đã hoàn thành`;
  return action;
};

export default function TransactionDetails() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllWalletTransactions();
        const list = Array.isArray(res?.transactions)
          ? res.transactions
          : Array.isArray(res?.data?.transactions)
          ? res.data.transactions
          : Array.isArray(res)
          ? res
          : [];
        const found = list.find((t) => String(t.id) === String(transactionId));
        if (!found) {
          setError("Không tìm thấy giao dịch");
        } else {
          const v = String(found.status || "").toLowerCase();
          let norm = "completed";
          if (v.includes("pend")) norm = "pending";
          else if (/fail|reject|cancel|error/.test(v)) norm = "failed";
          const amount = parseFloat(found.amount) || 0;
          let shopShare = null,
            systemShare = null;
          if (found.transaction_type === "order_payment") {
            shopShare = Math.round(amount * 0.95);
            systemShare = amount - shopShare;
          }
          setTx({
            id: found.id,
            type: found.transaction_type || found.type,
            status: norm,
            amount,
            order_id: found.order_id || found.orderId,
            description: found.description || "",
            created_at:
              found.created_at ||
              found.createdAt ||
              found.updated_at ||
              found.updatedAt,
            fromWallet: found.fromWallet,
            toWallet: found.toWallet,
            shopShare,
            systemShare,
          });
          if (
            (found.order_id || found.orderId) &&
            found.transaction_type === "order_payment"
          ) {
            try {
              const ord = await fetchOrderById(found.order_id || found.orderId);
              const data = ord?.order || ord?.data || ord;
              setOrderInfo(data || null);
            } catch (e) {
              // silent
            }
          }
        }
      } catch (e) {
        setError("Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, [transactionId]);

  const fmt = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error)
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded"
        >
          ← Quay lại
        </button>
        <div className="text-red-600">{error}</div>
      </div>
    );
  if (!tx) return null;

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          ← Quay lại
        </button>
        <div className="bg-white p-6 rounded-xl shadow border border-pink-100">
          <h1 className="text-2xl font-bold text-pink-600 mb-6">
            Chi Tiết Giao Dịch #{tx.id}
          </h1>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-800">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Loại:</span>
                <span>{typeLabel[tx.type] || tx.type}</span>
              </div>
              {tx.order_id && (
                <div className="flex justify-between">
                  <span className="font-medium">Đơn hàng:</span>
                  <span>#{tx.order_id}</span>
                </div>
              )}
              {orderInfo && (
                <div className="flex justify-between">
                  <span className="font-medium">Shop ID:</span>
                  <span>{orderInfo.shop_id ?? "—"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Số tiền tổng:</span>
                <span>{fmt(tx.amount)}</span>
              </div>
              {tx.type === "order_payment" && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Phần Shop (95%):</span>
                    <span>{fmt(tx.shopShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phần Hệ thống (5%):</span>
                    <span>{fmt(tx.systemShare)}</span>
                  </div>
                  {tx.status === "pending" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái dòng tiền:</span>
                      <span className="text-yellow-600">
                        Đang giữ tạm (escrow)
                      </span>
                    </div>
                  )}
                  {tx.status === "completed" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái dòng tiền:</span>
                      <span className="text-green-600">Đã giải ngân</span>
                    </div>
                  )}
                  {tx.status === "failed" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái dòng tiền:</span>
                      <span className="text-red-600">Đã hoàn về ví nguồn</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    statusMap[tx.status]?.color
                  }`}
                >
                  {statusMap[tx.status]?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Thời gian:</span>
                <span>
                  {tx.created_at
                    ? new Date(tx.created_at).toLocaleString("vi-VN")
                    : "—"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Dòng chuyển tiền
                </h3>
                <div className="text-xs leading-5">
                  <div>
                    <span className="font-medium">Từ ví (From): </span>
                    {tx.fromWallet
                      ? `#${tx.fromWallet.id} • User ${
                          tx.fromWallet.user_id
                        } (${
                          tx.fromWallet.User?.full_name ||
                          tx.fromWallet.User?.username ||
                          "—"
                        })`
                      : "—"}
                  </div>
                  <div>
                    <span className="font-medium">Đến ví (To): </span>
                    {tx.toWallet
                      ? `#${tx.toWallet.id} • User ${tx.toWallet.user_id} (${
                          tx.toWallet.User?.full_name ||
                          tx.toWallet.User?.username ||
                          "Ví Hệ Thống"
                        })`
                      : "Ví Hệ Thống"}
                  </div>
                  {tx.type === "order_payment" && (
                    <div className="mt-2 text-gray-600">
                      {tx.status === "pending" && "Số tiền đang được tạm giữ"}
                      {tx.status === "completed" &&
                        "Số tiền đã được phân chia cho shop & hệ thống."}
                      {tx.status === "failed" &&
                        "Số tiền đã hoàn trả đầy đủ về ví khách hàng."}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-700 mb-2">Mô tả</h3>
                <p className="text-sm text-gray-700">
                  {(() => {
                    if (tx.type === 'order_payment') {
                      if (tx.status === 'pending') return `Thanh toán đơn hàng #${tx.order_id} đang giữ tạm (escrow).`;
                      if (tx.status === 'completed') return `Thanh toán đơn hàng #${tx.order_id} đã giải ngân: Shop nhận ${fmt(tx.shopShare)}, Hệ thống nhận ${fmt(tx.systemShare)}.`;
                      if (tx.status === 'failed') return `Thanh toán đơn hàng #${tx.order_id} đã bị hủy/ thất bại và hoàn ${fmt(tx.amount)} về ví nguồn.`;
                    }
                    if (tx.type === 'ai_generation') {
                      return localizeAIDescription(tx.description, tx.status);
                    }
                    return tx.description || '—';
                  })()}
                </p>
              </div>
              {orderInfo && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Thông tin đơn hàng
                  </h3>
                  <ul className="text-xs space-y-1">
                    <li>
                      <span className="font-medium">Order ID:</span>{" "}
                      {orderInfo.id}
                    </li>
                    <li>
                      <span className="font-medium">Shop ID:</span>{" "}
                      {orderInfo.shop_id ?? "—"}
                    </li>
                    <li>
                      <span className="font-medium">Tổng tiền đơn:</span>{" "}
                      {fmt(parseFloat(orderInfo.total_price) || 0)}
                    </li>
                    <li className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Trạng thái đơn:</span>
                      {(() => {
                        const key = normalizeOrderStatusKey(orderInfo.status);
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold tracking-wide ${orderStatusBadgeClass(
                              key
                            )}`}
                          >
                            {orderStatusVN(orderInfo.status)}
                          </span>
                        );
                      })()}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
