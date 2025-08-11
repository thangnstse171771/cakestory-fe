import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchComplaintsByShop } from "../../api/axios";
import ComplaintList from "./ComplaintList";

export default function ShopComplaint() {
  const { shopId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchComplaintsByShop(shopId);
        // Chuẩn hoá dữ liệu cho ComplaintList (map field)
        const mapped = (Array.isArray(data) ? data : data?.data || []).map(
          (c) => ({
            id: c.id,
            orderId: c.order_id || c.orderId,
            orderNumber: c.order_id
              ? `ORD-${c.order_id}`
              : c.orderNumber || "N/A",
            customerName:
              c.user?.full_name || c.customer_name || `User ${c.user_id || ""}`,
            subject: c.reason || c.subject || "Khiếu nại đơn hàng",
            description: c.reason || c.description || "",
            status: c.status || "pending",
            date: new Date(c.created_at || c.createdAt).toLocaleDateString(
              "vi-VN"
            ),
            time: new Date(c.created_at || c.createdAt).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            ),
            imageUrl: c.evidence_images || c.image_url || c.imageUrl || "",
          })
        );
        setComplaints(mapped);
      } catch (e) {
        setError(e.response?.data?.message || e.message || "Lỗi tải khiếu nại");
      } finally {
        setLoading(false);
      }
    };
    if (shopId) load();
  }, [shopId]);

  if (loading) return <div className="p-8">Đang tải khiếu nại...</div>;
  if (error) return <div className="p-8 text-red-600">Lỗi: {error}</div>;

  return <ComplaintList complaints={complaints} />;
}
