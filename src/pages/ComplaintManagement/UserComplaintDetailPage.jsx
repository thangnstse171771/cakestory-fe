import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchComplaintById,
  fetchOrderById,
  fetchMarketplacePostById,
} from "../../api/axios";
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
        // Use complaint.order as source; normalize to canonical keys, then fetch order only if key fields missing or to attach marketplace post
        let workingOrder = data?.order || undefined;
        // Normalize existing embedded order to canonical fields without adding new data
        if (workingOrder && typeof workingOrder === "object") {
          const normalized = { ...workingOrder };
          // normalize totals/prices
          if (normalized.base_price == null && normalized.basePrice != null)
            normalized.base_price = normalized.basePrice;
          if (normalized.total_price == null) {
            if (normalized.totalPrice != null)
              normalized.total_price = normalized.totalPrice;
            else if (normalized.price != null) normalized.total_price = normalized.price;
          }
          if (
            normalized.ingredient_total == null &&
            normalized.ingredientTotal != null
          )
            normalized.ingredient_total = normalized.ingredientTotal;
          // normalize order details list
          if (!Array.isArray(normalized.orderDetails)) {
            if (Array.isArray(normalized.order_details))
              normalized.orderDetails = normalized.order_details;
            else if (Array.isArray(normalized.items))
              normalized.orderDetails = normalized.items;
          }
          workingOrder = normalized;
        }
        const orderIdToFetch =
          mapped.orderId || data?.order_id || data?.order?.id;
        const hasSize = !!(workingOrder && workingOrder.size);
        const hasBase = !!(
          workingOrder &&
          (workingOrder.base_price != null || workingOrder.basePrice != null)
        );
        const hasIngTotal = !!(
          workingOrder &&
          (workingOrder.ingredient_total != null ||
            workingOrder.ingredientTotal != null)
        );
        const hasTotal = !!(
          workingOrder &&
          (workingOrder.total_price != null || workingOrder.totalPrice != null)
        );
        const hasOrderDetails = !!(
          workingOrder &&
          (Array.isArray(workingOrder.orderDetails) ||
            Array.isArray(workingOrder.order_details))
        );
        const needsMarketplace = !(
          workingOrder?.marketplace_post || workingOrder?.marketplace_post_id
        );
        const needsOrderFetch =
          !!orderIdToFetch &&
          (needsMarketplace ||
            !(
              hasSize &&
              hasBase &&
              hasIngTotal &&
              hasTotal &&
              hasOrderDetails
            ));
        if (needsOrderFetch) {
          try {
            const orderResp = await fetchOrderById(orderIdToFetch);
            let orderObj =
              orderResp?.data && !Array.isArray(orderResp.data)
                ? orderResp.data
                : orderResp;
            // Merge only needed fields without overwriting existing complaint.order values
            const merged = { ...(workingOrder || {}) };
            if (!hasSize && orderObj?.size != null) merged.size = orderObj.size;
            if (!hasBase) {
              if (orderObj?.base_price != null)
                merged.base_price = orderObj.base_price;
              else if (orderObj?.basePrice != null)
                merged.base_price = orderObj.basePrice;
            }
            if (!hasTotal) {
              if (orderObj?.total_price != null)
                merged.total_price = orderObj.total_price;
              else if (orderObj?.totalPrice != null)
                merged.total_price = orderObj.totalPrice;
              else if (orderObj?.price != null)
                merged.total_price = orderObj.price;
            }
            if (!hasIngTotal) {
              if (orderObj?.ingredient_total != null)
                merged.ingredient_total = orderObj.ingredient_total;
              else if (orderObj?.ingredientTotal != null)
                merged.ingredient_total = orderObj.ingredientTotal;
            }
            if (!hasOrderDetails) {
              const details =
                (Array.isArray(orderObj?.orderDetails) &&
                  orderObj.orderDetails) ||
                (Array.isArray(orderObj?.order_details) &&
                  orderObj.order_details) ||
                (Array.isArray(orderObj?.items) && orderObj.items) ||
                undefined;
              if (details) merged.orderDetails = details;
            }
            workingOrder = Object.keys(merged).length ? merged : workingOrder;
            // Prefer embedded marketplace_post from order if available
            const embeddedPost =
              orderObj?.marketplace_post || orderObj?.marketplacePost;
            if (embeddedPost) {
              if (workingOrder) {
                workingOrder = {
                  ...workingOrder,
                  marketplace_post: embeddedPost,
                  marketplace_post_id:
                    workingOrder.marketplace_post_id ||
                    orderObj?.marketplace_post_id ||
                    orderObj?.marketplace_postId,
                };
              } else {
                workingOrder = {
                  marketplace_post: embeddedPost,
                  marketplace_post_id:
                    orderObj?.marketplace_post_id ||
                    orderObj?.marketplace_postId,
                };
              }
            } else {
              // If API returns marketplace_post_id, fetch the marketplace post to get media/image_url
              const mpId =
                orderObj?.marketplace_post_id || orderObj?.marketplace_postId;
              if (mpId) {
                try {
                  const mpResp = await fetchMarketplacePostById(mpId);
                  // Normalize: merge top-level media onto post object so extractor can find image
                  const mpPost =
                    mpResp?.post && typeof mpResp.post === "object"
                      ? { ...mpResp.post }
                      : mpResp?.data || mpResp || {};
                  if (Array.isArray(mpResp?.media)) mpPost.media = mpResp.media;
                  // Attach only marketplace_post to workingOrder without overriding other fields
                  if (workingOrder) {
                    workingOrder = {
                      ...workingOrder,
                      marketplace_post: mpPost,
                      marketplace_post_id:
                        workingOrder.marketplace_post_id || mpId,
                    };
                  } else {
                    workingOrder = {
                      marketplace_post: mpPost,
                      marketplace_post_id: mpId,
                    };
                  }
                } catch {}
              }
            }
            // Do not spread all orderObj fields; complaint.order remains the main source
          } catch {
            // ignore; fall back to embedded order
            workingOrder = data?.order || workingOrder;
          }
        }
        if (workingOrder) {
          mapped.order = workingOrder;
          mapped.raw = { ...mapped.raw, order: workingOrder };
          mapped.orderDetails = Array.isArray(workingOrder.orderDetails)
            ? workingOrder.orderDetails
            : [];
        }
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
