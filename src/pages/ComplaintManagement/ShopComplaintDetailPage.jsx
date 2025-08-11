import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchComplaintById, fetchOrderById } from "../../api/axios";
import ComplaintDetails from "./ComplaintDetails";

export default function ShopComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchComplaintById(id);
        if (ignore) return;
        // normalize identical to UserComplaintDetailPage
        const evidenceImages = [];
        if (data?.evidence_images) {
          if (Array.isArray(data.evidence_images))
            evidenceImages.push(...data.evidence_images);
          else if (typeof data.evidence_images === "string")
            evidenceImages.push(...data.evidence_images.split(","));
        }
        if (data?.image_url) evidenceImages.push(data.image_url);
        if (data?.image) evidenceImages.push(data.image);
        const uniqueImages = [
          ...new Set(evidenceImages.map((i) => i && i.trim()).filter(Boolean)),
        ];
        const rawStatus = (
          data.status ||
          data.complaint_status ||
          "pending"
        ).toLowerCase();
        const normalizedStatus = ["pending", "complete", "rejected"].includes(
          rawStatus
        )
          ? rawStatus
          : rawStatus === "complaining"
          ? "pending"
          : "pending";
        const mapped = {
          id: data.id || data.complaint_id || id,
          orderId: data.order_id || data.orderId || data.order?.id || "",
          orderNumber:
            data.order_code ||
            data.orderNumber ||
            data.order_id ||
            data.orderId ||
            data.order?.id ||
            "N/A",
          customerName: data.customer_name || data.customerName || "Khách hàng",
          subject: data.subject || data.title || "Không có tiêu đề",
          description: data.description || data.content || data.reason || "",
          status: normalizedStatus,
          date: data?.created_at
            ? new Date(data.created_at).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
          time: data?.created_at
            ? new Date(data.created_at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          imageUrl: uniqueImages[0] || null,
          images: uniqueImages,
          raw: data,
        };
        if (mapped.orderId) {
          try {
            const orderResp = await fetchOrderById(mapped.orderId);
            let orderObj = orderResp;
            if (orderResp?.data && !Array.isArray(orderResp.data))
              orderObj = orderResp.data;
            const embedded = data?.order || {};
            const mergedOrder = { ...embedded, ...orderObj };
            mapped.raw = { ...mapped.raw, order: mergedOrder };
            mapped.order = mergedOrder;
            const orderDetailsArray =
              mergedOrder.orderDetails ||
              mergedOrder.orderdetails ||
              mergedOrder.order_details ||
              [];
            mapped.orderDetails = orderDetailsArray;
          } catch (orderErr) {
            if (data?.order) {
              mapped.order = data.order;
              mapped.orderDetails =
                data.order.orderdetails || data.order.order_details || [];
            }
          }
        }
        setComplaint(mapped);
      } catch (err) {
        setError(err.message || "Không tải được khiếu nại");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!complaint) return <div className="p-6">Không tìm thấy khiếu nại</div>;
  return <ComplaintDetails complaint={complaint} onBack={() => navigate(-1)} />;
}
