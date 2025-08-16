"use client";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  User,
  ListOrdered,
  CalendarDays,
  Clock,
  MessageSquareWarning,
  ImageIcon,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  UtensilsCrossed,
  Hash,
} from "lucide-react";
import { fetchComplaintIngredientsByShop } from "../../api/axios";
import { fetchIngredients } from "../../api/ingredients";
import { fetchMarketplacePostById } from "../../api/axios";
import { approveComplaint, rejectComplaint } from "../../api/axios";
import { updateComplaintAdminNote } from "../../api/axios";

// Helper format currency VND
const formatVND = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  const num = Number(v);
  if (Number.isNaN(num)) return v;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

// Map order status to localized (vi) label
const getOrderStatusLabel = (s) => {
  const v = (s || "").toString().trim().toLowerCase();
  if (!v) return "-";
  if (["pending", "new"].includes(v)) return "Đang chờ xử lý";
  if (["ordered", "accepted", "confirmed", "received"].includes(v))
    return "Đã tiếp nhận";
  if (
    [
      "preparedfordelivery",
      "prepared_for_delivery",
      "ready",
      "preparing",
      "ready_to_ship",
    ].includes(v)
  )
    return "Sẵn sàng giao hàng";
  if (["shipping", "delivering", "in_transit", "shipped"].includes(v))
    return "Đang vận chuyển";
  if (["complaint", "complaining", "complaning", "disputed"].includes(v))
    return "Đang khiếu nại";
  if (["completed", "complete", "done", "delivered"].includes(v))
    return "Hoàn tất";
  if (["cancelled", "canceled", "cancel"].includes(v)) return "Đã hủy";
  return s || "-";
};

export default function ComplaintDetails({ complaint, onBack }) {
  const order = complaint?.raw?.order || complaint?.order || {};

  // Normalize complaint status coming from backend to UI keys used in complaintStatusMap
  const normalizeComplaintStatus = (s) => {
    const v = (s || "").toString().trim().toLowerCase();
    if (
      [
        "approved",
        "approve",
        "completed",
        "complete",
        "resolved",
        "refunded",
      ].includes(v)
    )
      return "complete";
    if (
      [
        "rejected",
        "reject",
        "denied",
        "refused",
        "closed",
        "cancelled",
      ].includes(v)
    )
      return "rejected";
    return "pending"; // treat complaining/open/new as pending
  };

  // State for marketplace post and images
  const [marketplacePost, setMarketplacePost] = useState(null);
  const [marketplaceImage, setMarketplaceImage] = useState(null);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);

  // Helper to extract image URL from marketplace post (enhanced)
  const extractImageFromMarketplacePost = (mp) => {
    if (!mp) return null;
    const imageFields = [
      "image_url",
      "image",
      "photo_url",
      "photo",
      "thumbnail",
      "thumb",
      "url",
    ];
    const isStr = (v) => typeof v === "string" && v.trim();
    const pickFrom = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      for (const f of imageFields) if (isStr(obj[f])) return obj[f].trim();
      return null;
    };
    // 1. Direct
    const direct = pickFrom(mp);
    if (direct) return direct;
    // 2. Common nested containers
    const containers = [mp.post, mp.data];
    for (const c of containers) {
      const val = pickFrom(c);
      if (val) return val;
    }
    // 3. Media arrays at several levels
    const mediaArrays = [mp.media, mp.post?.media, mp.data?.media];
    for (const arr of mediaArrays) {
      if (Array.isArray(arr)) {
        for (const item of arr) {
          const val =
            pickFrom(item) || pickFrom(item?.image) || pickFrom(item?.data);
          if (val) return val;
        }
      }
    }
    // 4. Deep recursive scan (last resort)
    const seen = new Set();
    const stack = [mp];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object" || seen.has(node)) continue;
      seen.add(node);
      const picked = pickFrom(node);
      if (picked) return picked;
      if (Array.isArray(node)) {
        for (const el of node) stack.push(el);
      } else {
        for (const v of Object.values(node)) stack.push(v);
      }
    }
    return null;
  };

  // Fallback effect: if we have marketplacePost but image not yet extracted (e.g. function updated) extract again
  useEffect(() => {
    if (marketplacePost && !marketplaceImage) {
      const img = extractImageFromMarketplacePost(marketplacePost);
      if (img) {
        setMarketplaceImage(img);
        console.log(
          "[ComplaintDetails] Extracted marketplace image via fallback effect:",
          img
        );
      }
    }
  }, [marketplacePost, marketplaceImage]);

  // Effect to handle marketplace post fetching (revised to avoid loop)
  const hasFetchedMarketplaceRef = useRef(false);
  useEffect(() => {
    const embeddedPost = order?.marketplace_post;
    const marketplacePostId =
      order?.marketplace_post_id || order?.marketplace_postId;

    // If we already have a marketplace image, stop.
    if (marketplaceImage) return;

    // If we have embedded post and haven't set it yet
    if (!marketplacePost && embeddedPost && Object.keys(embeddedPost).length) {
      setMarketplacePost(embeddedPost);
      const img = extractImageFromMarketplacePost(embeddedPost);
      if (img) {
        setMarketplaceImage(img);
        console.log(
          "[ComplaintDetails] Using embedded marketplace image:",
          img
        );
        return;
      }
    }

    // Guard: only fetch once when we have an ID and no image yet
    if (
      !hasFetchedMarketplaceRef.current &&
      marketplacePostId &&
      !marketplaceImage &&
      !marketplacePost &&
      !isLoadingMarketplace
    ) {
      hasFetchedMarketplaceRef.current = true; // mark immediately to avoid race
      setIsLoadingMarketplace(true);
      (async () => {
        try {
          console.log(
            "[ComplaintDetails] Fetching marketplace post by ID:",
            marketplacePostId
          );
          const response = await fetchMarketplacePostById(marketplacePostId);
          console.log("[ComplaintDetails] Fetch response:", response);
          let postData = response?.post || response?.data || response;
          if (postData) {
            setMarketplacePost(postData);
            const image = extractImageFromMarketplacePost(postData);
            if (image) {
              setMarketplaceImage(image);
              console.log(
                "[ComplaintDetails] Using fetched marketplace image:",
                image
              );
            } else {
              console.warn(
                "[ComplaintDetails] No image found in fetched marketplace post:",
                postData
              );
            }
          } else {
            console.warn(
              "[ComplaintDetails] Invalid marketplace post response:",
              response
            );
          }
        } catch (error) {
          console.error(
            "[ComplaintDetails] Failed to fetch marketplace post:",
            error
          );
          hasFetchedMarketplaceRef.current = false; // allow retry on failure
        } finally {
          setIsLoadingMarketplace(false);
        }
      })();
    }
  }, [
    order?.marketplace_post_id,
    order?.marketplace_post,
    marketplacePost,
    marketplaceImage,
    isLoadingMarketplace,
  ]);

  // Replace raw status state with normalized status
  const [status, setStatus] = useState(
    normalizeComplaintStatus(
      complaint?.status ||
        complaint?.raw?.status ||
        complaint?.raw?.complaint_status ||
        "pending"
    )
  );
  const initialStatusRef = useRef(status);
  const [response, setResponse] = useState("");
  const [adminNote, setAdminNote] = useState(
    complaint?.raw?.admin_note || complaint?.admin_note || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [isNoteLocked, setIsNoteLocked] = useState(
    !!(complaint?.raw?.admin_note || complaint?.admin_note)
  );
  const [actionMessage, setActionMessage] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [ingredientsMap, setIngredientsMap] = useState({});

  const complaintStatusMap = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    complete: {
      label: "Đã hoàn tiền",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    rejected: {
      label: "Đã từ chối",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: XCircle,
    },
  };

  // Load ingredients
  useEffect(() => {
    const shopId = order?.shop_id || order?.shopId;
    if (!shopId) return;

    setLoadingIngredients(true);
    console.log("[ComplaintDetails] Fetch ingredients for shopId=", shopId);

    const loadIngredients = async () => {
      try {
        let data = await fetchIngredients(shopId);
        if (!data) data = await fetchComplaintIngredientsByShop(shopId);
        console.log("[ComplaintDetails] Raw ingredients response:", data);

        let listRaw = [];
        if (Array.isArray(data)) listRaw = data;
        else if (Array.isArray(data?.data)) listRaw = data.data;
        else if (Array.isArray(data?.ingredients)) listRaw = data.ingredients;
        else if (Array.isArray(data?.data?.ingredients))
          listRaw = data.data.ingredients;

        const mappedIngs = listRaw.map((ing, idx) => ({
          id: ing.id || ing._id || idx,
          name: ing.name || ing.ingredient_name || "(No name)",
          price: ing.price ?? ing.cost ?? 0,
          image: ing.image || ing.image_url || ing.photo || null,
          description: ing.description || ing.note || "",
        }));

        const mapObj = Object.fromEntries(mappedIngs.map((i) => [i.id, i]));
        setIngredients(mappedIngs);
        setIngredientsMap(mapObj);
        console.log("[ComplaintDetails] Mapped ingredients:", mappedIngs);
      } catch (err) {
        console.warn("[ComplaintDetails] Load ingredients failed:", err);
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, [order?.shop_id, order?.shopId]);

  // Get order details and calculate totals
  const orderDetails =
    complaint?.orderDetails ||
    order?.orderDetails ||
    order?.orderdetails ||
    order?.order_details ||
    [];

  const orderDetailsArray = orderDetails || [];
  const ingredientsTotal = orderDetailsArray.reduce((sum, d) => {
    const lineTotal = Number(d.total_price || d.totalPrice || d.price || 0);
    return sum + (isNaN(lineTotal) ? 0 : lineTotal);
  }, 0);

  const basePrice = Number(
    order?.base_price || order?.basePrice || order?.price || 0
  );
  const totalPrice = basePrice;

  // Get other order data
  const evidenceImages = (() => {
    const ev = order?.evidence_images || order?.evidenceImages;
    if (!ev) return [];
    if (Array.isArray(ev)) return ev.filter(Boolean);
    if (typeof ev === "string")
      return ev
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  })();

  const specialInstructions =
    order?.special_instructions || order?.specialInstructions || "";

  if (!complaint) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <MessageSquareWarning className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600">
              Không tìm thấy thông tin khiếu nại
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract complaint report images (images khách hàng upload khi report)
  const getComplaintReportImages = () => {
    try {
      const possibleSources = [
        complaint?.report_images,
        complaint?.reportImages,
        complaint?.images,
        complaint?.image_urls,
        complaint?.imageUrls,
        complaint?.raw?.report_images,
        complaint?.raw?.reportImages,
        complaint?.raw?.images,
        complaint?.raw?.image_urls,
        complaint?.raw?.imageUrls,
        complaint?.raw?.evidence_images, // đôi khi server dùng chung field
        complaint?.raw?.evidenceImages,
        complaint?.raw?.order?.report_images,
      ];

      const imageFieldNames = [
        "image_url",
        "image",
        "url",
        "photo",
        "photo_url",
        "path",
        "src",
      ];

      const results = [];

      const pushIfValid = (val) => {
        if (typeof val === "string" && val.trim()) results.push(val.trim());
      };

      for (const src of possibleSources) {
        if (!src) continue;
        if (Array.isArray(src)) {
          src.forEach((item) => {
            if (typeof item === "string") {
              // raw string url
              pushIfValid(item);
            } else if (item && typeof item === "object") {
              for (const f of imageFieldNames) pushIfValid(item[f]);
            }
          });
        } else if (typeof src === "string") {
          // comma separated
          src
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach(pushIfValid);
        } else if (typeof src === "object") {
          // single object that may contain image fields
          for (const f of imageFieldNames) pushIfValid(src[f]);
          // handle nested array like src.media
          if (Array.isArray(src.media)) {
            src.media.forEach((m) => {
              if (typeof m === "string") pushIfValid(m);
              else if (m && typeof m === "object") {
                for (const f of imageFieldNames) pushIfValid(m[f]);
              }
            });
          }
        }
      }

      // Deduplicate
      const unique = Array.from(new Set(results));
      if (unique.length) {
        console.log(
          "[ComplaintDetails] Extracted complaint report images:",
          unique
        );
      } else {
        console.log(
          "[ComplaintDetails] No complaint report images found in provided sources",
          possibleSources
        );
      }
      return unique;
    } catch (err) {
      console.warn("[ComplaintDetails] getComplaintReportImages failed:", err);
      return [];
    }
  };

  const StatusIcon = complaintStatusMap[status]?.icon || AlertCircle;
  const complaintReportImages = getComplaintReportImages();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return (
        u &&
        [
          "admin",
          "administrator",
          "superadmin",
          "staff",
          "account_staff",
        ].includes((u.role || "").toLowerCase())
      );
    } catch {
      return false;
    }
  })();

  const handleUpdateStatus = async (newStatus) => {
    if (!complaint?.id) return;
    if (status !== "pending" || initialStatusRef.current !== "pending") {
      setActionMessage("Khiếu nại đã được xử lý, không thể cập nhật.");
      return;
    }
    try {
      setIsUpdating(true);
      setActionMessage("");
      // Save admin note first if available and not locked
      if (adminNote && adminNote.trim() && !isNoteLocked) {
        try {
          await updateComplaintAdminNote(complaint.id, adminNote.trim());
          setIsNoteLocked(true);
        } catch (e) {
          console.warn(
            "Lưu ghi chú thất bại nhưng vẫn tiếp tục cập nhật trạng thái",
            e
          );
        }
      }
      console.log(
        "[ComplaintDetails] Update status action=",
        newStatus,
        "complaintId=",
        complaint.id
      );
      if (newStatus === "complete") {
        await approveComplaint(complaint.id);
      } else if (newStatus === "rejected") {
        await rejectComplaint(complaint.id);
      } else {
        throw new Error("Trạng thái không hợp lệ");
      }
      setStatus(newStatus);
      setActionMessage(
        `Đã cập nhật trạng thái: ${
          complaintStatusMap[newStatus]?.label || newStatus
        }`
      );
      // Reload to sync latest server state as requested
      setTimeout(() => {
        try {
          window.location.reload();
        } catch {}
      }, 400);
    } catch (err) {
      console.error("Update complaint status failed", err);
      setActionMessage(
        err?.response?.data?.message || "Lỗi cập nhật trạng thái"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!complaint?.id || isNoteLocked) return;
    try {
      setSavingNote(true);
      await updateComplaintAdminNote(complaint.id, adminNote || "");
      setIsNoteLocked(true);
      setActionMessage("Đã lưu ghi chú xử lý");
    } catch (err) {
      console.error("Save admin note failed", err);
      setActionMessage(err?.response?.data?.message || "Lỗi lưu ghi chú");
    } finally {
      setSavingNote(false);
    }
  };

  // Derive customer info from complaint/order API data (remove fake placeholders)
  const customerInfo = {
    name:
      complaint.customerName ||
      complaint?.raw?.customer_name ||
      complaint?.raw?.customerName ||
      complaint?.raw?.user?.full_name ||
      complaint?.raw?.user?.name ||
      order?.customer_name ||
      order?.user?.full_name ||
      "-",
    phone:
      complaint?.raw?.customer_phone ||
      complaint?.raw?.phone ||
      complaint?.raw?.user?.phone ||
      order?.customer_phone ||
      order?.user?.phone ||
      "-",
    email:
      complaint?.raw?.customer_email ||
      complaint?.raw?.email ||
      complaint?.raw?.user?.email ||
      order?.customer_email ||
      order?.user?.email ||
      "-",
    address:
      complaint?.raw?.customer_address ||
      order?.shipping_address ||
      order?.address ||
      order?.user?.address ||
      "-",
  };

  return (
    <div className="p-8 bg-gradient-to-b from-white to-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại danh sách
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{complaint.subject}</h1>
                <div className="flex items-center gap-4 text-red-100">
                  <span className="flex items-center gap-1">
                    <ListOrdered className="h-4 w-4" />
                    Mã đơn: {complaint.orderNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {complaint.date} lúc {complaint.time}
                  </span>
                </div>
              </div>
              <div
                className={`${complaintStatusMap[status]?.color} px-4 py-2 rounded-full flex items-center gap-2 bg-white/20 backdrop-blur-sm border-white/30`}
              >
                <StatusIcon className="h-4 w-4" />
                <span className="font-semibold text-white">
                  {complaintStatusMap[status]?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Top summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold mb-1">
                  Trạng thái khiếu nại
                </p>
                <p className="text-sm font-bold text-rose-800 capitalize">
                  {complaintStatusMap[status]?.label || status}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">
                  Trạng thái đơn
                </p>
                {(() => {
                  // Khiếu nại pending => hiển thị "Đang khiếu nại"
                  // Khiếu nại complete (đã hoàn tiền) => coi đơn là "Đã hủy"
                  // Khiếu nại rejected (từ chối) => coi đơn là "Hoàn tất"
                  let label;
                  if (status === "pending") label = "Đang khiếu nại";
                  else if (status === "complete") label = "Đã hủy";
                  else if (status === "rejected") label = "Hoàn tất";
                  else label = getOrderStatusLabel(order?.status);
                  return (
                    <p className="text-sm font-bold text-orange-800 capitalize">
                      {label}
                    </p>
                  );
                })()}
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">
                  Tổng đơn
                </p>
                <p className="text-sm font-bold text-emerald-800">
                  {formatVND(totalPrice)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
                  Tổng NL
                </p>
                <p className="text-sm font-bold text-indigo-800">
                  {formatVND(ingredientsTotal)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Complaint Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 text-red-600" />
                    Nội dung khiếu nại
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {complaint.description}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-red-500" />
                        ID Khiếu nại:
                      </p>
                      <p className="text-gray-800">{complaint.id}</p>
                    </div>
                    {complaint.raw?.reason && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-semibold text-gray-700 mb-1">
                          Đơn hàng:
                        </p>
                        <p className="text-gray-800">{complaint.raw.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marketplace Post Image - MOVED TO TOP */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Ảnh bánh (từ bài đăng bán SP)
                    </h3>
                    {order?.marketplace_post_id && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!order?.marketplace_post_id) return;
                          console.log(
                            "[ComplaintDetails] Manual retry fetch marketplace post"
                          );
                          hasFetchedMarketplaceRef.current = false;
                          setMarketplacePost(null);
                          setMarketplaceImage(null);
                        }}
                        className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Tải lại ảnh
                      </button>
                    )}
                  </div>

                  {isLoadingMarketplace && (
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Đang tải ảnh từ marketplace post...
                        </p>
                      </div>
                    </div>
                  )}

                  {!isLoadingMarketplace && marketplaceImage && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <img
                          src={marketplaceImage}
                          alt="Ảnh bánh (marketplace)"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                          onError={(e) => {
                            console.error(
                              "Failed to load marketplace image:",
                              marketplaceImage
                            );
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Marketplace Post
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoadingMarketplace && !marketplaceImage && (
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {order?.marketplace_post_id
                            ? "Không tìm thấy ảnh từ marketplace post"
                            : "Không có marketplace post ID"}
                        </p>
                        {order?.marketplace_post_id && (
                          <p className="text-xs mt-1">
                            ID: {order.marketplace_post_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Report Images */}
                {complaintReportImages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-red-600" />
                      Hình ảnh báo cáo từ khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaintReportImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Báo cáo ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                            onError={(e) => {
                              console.error(
                                "Failed to load complaint image:",
                                img
                              );
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Xử lý khiếu nại
                  </h3>
                  <div className="space-y-3">
                    {isAdmin && status === "pending" && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus("complete")}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {isUpdating && status !== "complete"
                            ? "..."
                            : "Duyệt hoàn tiền"}
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus("rejected")}
                          className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
                        >
                          {isUpdating && status !== "rejected"
                            ? "..."
                            : "Từ chối"}
                        </button>
                      </div>
                    )}
                    {(status === "complete" || status === "rejected") && (
                      <div className="bg-gray-100 rounded p-3 text-sm text-gray-600">
                        {status === "complete"
                          ? "Đã hoàn tiền cho khiếu nại này"
                          : "Khiếu nại này đã bị từ chối"}
                      </div>
                    )}
                    {actionMessage && (
                      <p className="text-xs text-gray-500">{actionMessage}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Customer Info & Actions */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Họ tên:</label>
                      <p className="font-medium text-gray-800">
                        {customerInfo.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Số điện thoại:
                      </label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {customerInfo.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email:</label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {customerInfo.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Địa chỉ:</label>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {customerInfo.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Processing Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Xử lý khiếu nại
                  </h3>
                  <div className="space-y-3">
                    {/* <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-500"
                      rows="3"
                      placeholder="Nhập nội dung xử lý / ghi chú nội bộ..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    /> */}

                    {/* Ghi chú nội bộ (Admin note) */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Ghi chú:
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-500"
                        rows="4"
                        placeholder="Nhập ghi chú xử lý..."
                        value={adminNote}
                        disabled={isNoteLocked}
                        onChange={(e) => setAdminNote(e.target.value)}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {isNoteLocked
                            ? "Ghi chú đã được lưu (không thể sửa)."
                            : "Ghi chú sẽ được lưu lại để tham chiếu sau."}
                        </span>
                        <div className="flex gap-2">
                          {isAdmin && !isNoteLocked && (
                            <button
                              type="button"
                              disabled={savingNote || !(adminNote || "").trim()}
                              onClick={handleSaveAdminNote}
                              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                            >
                              {savingNote ? "Đang lưu..." : "Gửi ghi chú"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-6 mt-2 border-t border-red-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-red-600" />
                Thông tin bánh (Order) dành cho Shop
              </h3>
              {order && Object.keys(order).length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-xs">Mã đơn</p>
                      <p className="font-semibold text-gray-800">{order.id}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-xs">Giá gốc</p>
                      <p className="font-semibold text-gray-800">
                        {formatVND(basePrice)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-xs">Tổng giá</p>
                      <p className="font-semibold text-gray-800">
                        {formatVND(totalPrice)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-xs">Tổng nguyên liệu</p>
                      <p className="font-semibold text-gray-800">
                        {formatVND(ingredientsTotal)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-xs">Kích thước</p>
                      <p className="font-semibold text-gray-800">
                        {order.size || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Evidence Images */}
                  {evidenceImages.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                      <p className="text-gray-600 mb-2">
                        Ảnh evidence (từ order)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evidenceImages.map((img, i) => (
                          <img
                            key={i}
                            src={img.trim()}
                            alt={`evidence-${i}`}
                            className="w-full h-40 object-cover rounded-lg border"
                            onError={(e) => {
                              console.error(
                                "Failed to load evidence image:",
                                img
                              );
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {specialInstructions && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                      <p className="text-gray-600 mb-2">Hướng dẫn đặc biệt</p>
                      <p className="font-medium text-gray-800 whitespace-pre-line">
                        {specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Order Details Table */}
                  {orderDetails.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-700 font-semibold flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-red-500" />
                          Nguyên liệu trong đơn
                        </p>
                        <span className="text-xs text-gray-500">
                          {orderDetails.length} dòng
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs md:text-sm">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600">
                              <th className="px-2 py-1 text-left">#</th>
                              <th className="px-2 py-1 text-left">Hình</th>
                              <th className="px-2 py-1 text-left">Tên</th>
                              <th className="px-2 py-1 text-left">
                                Ingredient ID
                              </th>
                              <th className="px-2 py-1 text-right">SL</th>
                              <th className="px-2 py-1 text-right">Đơn giá</th>
                              <th className="px-2 py-1 text-right">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderDetails.map((d, idx) => {
                              const ingId =
                                d.ingredient_id || d.ingredientId || d.id;
                              const ing = ingredientsMap[ingId];
                              const qty = d.quantity || 0;
                              const total = Number(
                                d.total_price || d.price || d.totalPrice || 0
                              );
                              const unit = qty ? total / qty : total;
                              return (
                                <tr
                                  key={idx}
                                  className="border-t hover:bg-gray-50"
                                >
                                  <td className="px-2 py-1">{idx + 1}</td>
                                  <td className="px-2 py-1">
                                    {ing?.image ? (
                                      <img
                                        src={ing.image}
                                        alt={ing.name}
                                        className="h-10 w-10 object-cover rounded border"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-400 text-[10px] rounded">
                                        No Img
                                      </div>
                                    )}
                                  </td>
                                  <td
                                    className="px-2 py-1 max-w-[160px] truncate"
                                    title={ing?.name}
                                  >
                                    {ing?.name || "(Chưa có)"}
                                  </td>
                                  <td className="px-2 py-1">{ingId}</td>
                                  <td className="px-2 py-1 text-right">
                                    {qty}
                                  </td>
                                  <td className="px-2 py-1 text-right">
                                    {formatVND(unit)}
                                  </td>
                                  <td className="px-2 py-1 text-right font-medium">
                                    {formatVND(total)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-semibold text-gray-700">
                              <td className="px-2 py-1" colSpan={6}>
                                Tổng nguyên liệu
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatVND(ingredientsTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {loadingIngredients && (
                    <div className="text-xs text-gray-500">
                      Đang tải danh sách nguyên liệu shop...
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">Không có thông tin order.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
