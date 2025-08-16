import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchComplaintById, fetchOrderById } from "../../api/axios"; // added fetchOrderById
import ComplaintDetails from "./ComplaintDetails";

export default function UserComplaintDetailPage() {
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
        // Chuẩn hoá nhẹ giống list
        const created = data?.created_at ? new Date(data.created_at) : null;
        // Lấy danh sách ảnh từ các field có thể có
        const evidenceImages = [];
        if (data?.evidence_images) {
          if (Array.isArray(data.evidence_images))
            evidenceImages.push(...data.evidence_images);
          else if (typeof data.evidence_images === "string")
            evidenceImages.push(...data.evidence_images.split(","));
        }
        if (data?.image_url) evidenceImages.push(data.image_url);
        if (data?.image) evidenceImages.push(data.image);
        // Loại bỏ trùng và rỗng
        const uniqueImages = [
          ...new Set(evidenceImages.map((i) => i && i.trim()).filter(Boolean)),
        ];
        // Chuẩn hoá status khiếu nại UI (robust)
        const normalizeStatus = (raw = "") => {
          const r = (raw || "").toString().trim().toLowerCase();
          if (
            [
              "approved",
              "approve",
              "complete",
              "completed",
              "resolved",
              "refunded",
            ].includes(r)
          )
            return "complete";
          if (
            {
              rejected: "rejected",
              reject: "rejected",
              denied: "rejected",
              refused: "rejected",
              closed: "rejected",
              cancelled: "rejected",
            }[r]
          )
            return "rejected";
          return "pending";
        };
        const rawStatusValue =
          data.status || data.complaint_status || data.state || "pending";
        const normalizedStatus = normalizeStatus(rawStatusValue);
        const mapped = {
          id: data.id || data.complaint_id || id,
          orderId: data.order_id || data.orderId || data.order?.id || "",
          // dùng order_code nếu có, fallback order_id
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

        // Always fetch full order detail if we have an orderId (avoid stale / partial embedded order)
        const orderIdToFetch = mapped.orderId;
        if (orderIdToFetch) {
          try {
            console.log(
              "[ComplaintDetailPage] Fetching full order detail for orderId=",
              orderIdToFetch
            );
            const orderResp = await fetchOrderById(orderIdToFetch);
            let orderObj = orderResp;
            if (orderResp?.data && !Array.isArray(orderResp.data))
              orderObj = orderResp.data; // normalize typical {data: {...}}
            // If order has marketplace_post_id but no embedded marketplace_post, fetch it
            const mpId =
              orderObj.marketplace_post_id || orderObj.marketplace_postId;
            if (mpId && !orderObj.marketplace_post) {
              try {
                const mpResp = await import("../../api/axios").then((m) =>
                  m.fetchMarketplacePostById(mpId)
                );
                const mpPost = mpResp.post || mpResp.data || mpResp;
                orderObj.marketplace_post = mpPost;
                console.log(
                  "[ComplaintDetailPage] Fetched marketplace post:",
                  mpPost
                );
              } catch (mpErr) {
                console.warn(
                  "[ComplaintDetailPage] Fetch marketplace post failed",
                  mpErr
                );
              }
            }
            // Merge embedded order (if any) with fetched (fetched overrides)
            const embedded = data?.order || {};
            const mergedOrder = { ...embedded, ...orderObj };
            mapped.raw = { ...mapped.raw, order: mergedOrder };
            mapped.order = mergedOrder;
            const orderDetailsArray =
              mergedOrder.orderDetails ||
              mergedOrder.orderdetails ||
              mergedOrder.order_details ||
              [];
            mapped.orderDetails = orderDetailsArray; // capture camelCase
            console.log(
              "[ComplaintDetailPage] Order detail response (raw):",
              orderObj
            );
            console.log(
              "[ComplaintDetailPage] Merged order object:",
              mergedOrder
            );
            console.log(
              "[ComplaintDetailPage] Extracted orderDetails length=",
              orderDetailsArray.length,
              orderDetailsArray
            );
            // --- Detailed ingredient style logging ---
            const candidateArrays = {
              orderdetails: mergedOrder.orderdetails,
              order_details: mergedOrder.order_details,
              ingredients: mergedOrder.ingredients,
              order_ingredients: mergedOrder.order_ingredients,
              items: mergedOrder.items,
              cake_ingredients: mergedOrder.cake_ingredients,
              details: mergedOrder.details,
            };
            Object.entries(candidateArrays).forEach(([key, val]) => {
              if (Array.isArray(val)) {
                console.log(
                  `[ComplaintDetailPage] Found potential ingredients array '${key}' length=${val.length}:`,
                  val
                );
              }
            });
            const firstNonEmpty =
              Object.values(candidateArrays).find(
                (v) => Array.isArray(v) && v.length > 0
              ) || [];
            if (firstNonEmpty.length === 0) {
              console.warn(
                "[ComplaintDetailPage] No ingredient-like arrays found in order."
              );
            } else {
              const normalizedIngredients = firstNonEmpty.map((it, idx) => ({
                idx,
                id: it.id || it.ingredient_id || it.item_id || it.code || idx,
                name:
                  it.name ||
                  it.ingredient_name ||
                  it.title ||
                  it.label ||
                  "(no name)",
                quantity: it.quantity || it.qty || 1,
                price: it.price || it.unit_price || it.cost || 0,
                raw: it,
              }));
              console.log(
                "[ComplaintDetailPage] Normalized ingredient candidates:",
                normalizedIngredients
              );
              mapped.orderIngredientPreview = normalizedIngredients;
            }
            // --- end ingredient logging ---
          } catch (orderErr) {
            console.warn(
              "[ComplaintDetailPage] Cannot fetch order detail:",
              orderErr
            );
            // fallback: use embedded order if exists
            if (data?.order) {
              mapped.order = data.order;
              mapped.orderDetails =
                data.order.orderdetails || data.order.order_details || [];
            }
          }
        }
        console.log("[ComplaintDetailPage] raw complaint:", data);
        console.log("[ComplaintDetailPage] mapped complaint (final):", mapped);
        setComplaint(mapped);
      } catch (e) {
        setError(e.message || "Không tải được khiếu nại");
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
