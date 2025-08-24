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
// no extra marketplace fetch; rely on embedded data in complaint.order
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

  // Helper to extract image URL from marketplace post (enhanced, supports arrays and many keys)
  const extractImageFromMarketplacePost = (mp) => {
    if (!mp) return null;
    const singleFields = [
      "image_url",
      "image",
      "photo_url",
      "photo",
      "thumbnail",
      "thumb",
      "url",
      "cover",
      "cover_url",
    ];
    const listFields = [
      "images",
      "image_urls",
      "imageUrls",
      "photos",
      "gallery",
      "pictures",
      "imgs",
      "media",
      "media_urls",
      "mediaUrls",
    ];
    const isStr = (v) => typeof v === "string" && v.trim();
    const firstFromList = (val) => {
      if (Array.isArray(val)) {
        // pick first non-empty string or object with singleFields
        for (const it of val) {
          if (isStr(it)) return it.trim();
          if (it && typeof it === "object") {
            for (const f of singleFields) if (isStr(it[f])) return it[f].trim();
            // nested common wrappers
            if (it.image && typeof it.image === "object") {
              for (const f of singleFields)
                if (isStr(it.image[f])) return it.image[f].trim();
            }
          }
        }
      }
      if (isStr(val)) return val.trim();
      return null;
    };
    const pickFromObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      for (const f of singleFields) if (isStr(obj[f])) return obj[f].trim();
      for (const lf of listFields) {
        const cand = firstFromList(obj[lf]);
        if (cand) return cand;
      }
      return null;
    };
    // 1) Direct on root
    const direct = pickFromObject(mp);
    if (direct) return direct;
    // 2) Common nested containers
    const containers = [mp.post, mp.data, mp.item, mp.content];
    for (const c of containers) {
      const val = pickFromObject(c);
      if (val) return val;
    }
    // 3) Deep recursive scan (last resort)
    const seen = new Set();
    const stack = [mp];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object" || seen.has(node)) continue;
      seen.add(node);
      const picked = pickFromObject(node);
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
      }
    }
  }, [marketplacePost, marketplaceImage]);

  // Use only embedded marketplace post (no external fetch)
  // Attempt extraction from several known locations in complaint/order
  useEffect(() => {
    if (marketplaceImage) return;
    const candidates = [
      order?.marketplace_post,
      order?.marketplacePost,
      order?.post, // some APIs embed post directly
      complaint?.raw?.marketplace_post,
      complaint?.raw?.marketplacePost,
      complaint?.raw?.post,
    ];
    for (const p of candidates) {
      if (p && typeof p === "object" && Object.keys(p).length) {
        setMarketplacePost(p);
        const img = extractImageFromMarketplacePost(p);
        if (img) {
          setMarketplaceImage(img);
          break;
        }
      }
    }
  }, [
    order?.marketplace_post,
    order?.post,
    complaint?.raw,
    marketplacePost,
    marketplaceImage,
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
      // Stronger contrast for visibility on gradient header
      color: "bg-yellow-200 text-yellow-900 border-yellow-300",
      icon: Clock,
    },
    complete: {
      label: "Đã hoàn tiền",
      color: "bg-green-200 text-green-900 border-green-300",
      icon: CheckCircle,
    },
    rejected: {
      label: "Đã từ chối",
      color: "bg-gray-200 text-gray-900 border-gray-300",
      icon: XCircle,
    },
  };

  // Load ingredients
  useEffect(() => {
    const shopId = order?.shop_id || order?.shopId;
    if (!shopId) return;

    setLoadingIngredients(true);

    const loadIngredients = async () => {
      try {
        let data = await fetchIngredients(shopId);
        if (!data) data = await fetchComplaintIngredientsByShop(shopId);

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
      } catch (err) {
        // ignore load ingredients error
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, [order?.shop_id, order?.shopId]);

  // Get order details and calculate totals (canonical fields only)
  const orderDetails = order?.orderDetails || [];
  const orderDetailsArray = Array.isArray(orderDetails) ? orderDetails : [];

  const getNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Prefer backend-provided aggregate if available
  const ingredientTotalTop = order?.ingredient_total;
  const ingredientsTotalComputed = orderDetailsArray.reduce((sum, d) => {
    const qty = getNumber(d.quantity || 0) || 0;
    const totalCandidate = d.total_price;
    let lineTotal = getNumber(totalCandidate);
    if (!lineTotal) {
      const unit = getNumber(d.unit_price || 0);
      lineTotal = unit * (qty || 1);
    }
    return sum + (isNaN(lineTotal) ? 0 : lineTotal);
  }, 0);
  const ingredientsTotal =
    getNumber(ingredientTotalTop) || ingredientsTotalComputed;

  const basePrice = getNumber(order?.base_price || 0);

  const totalTopLevel = order?.total_price;

  let totalPrice = getNumber(totalTopLevel);
  if (!totalPrice) {
    const sumLines = orderDetailsArray.reduce((s, d) => {
      const qty = getNumber(d.quantity || 0) || 0;
      const totalCandidate = d.total_price;
      let lineTotal = getNumber(totalCandidate);
      if (!lineTotal) {
        const unit = getNumber(d.unit_price || 0);
        lineTotal = unit * (qty || 1);
      }
      return s + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0);
    const composed = getNumber(basePrice) + getNumber(sumLines);
    totalPrice = composed || getNumber(sumLines) || getNumber(basePrice) || 0;
  }

  // Get other order data
  const evidenceImages = (() => {
    const ev = order?.evidence_images;
    if (!ev) return [];
    if (Array.isArray(ev)) return ev.filter(Boolean);
    if (typeof ev === "string")
      return ev
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  })();

  const specialInstructions = order?.special_instructions || "";

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
      return unique;
    } catch (err) {
      // ignore extract images error
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
  // Anyone whose role is not exactly 'user' can edit admin notes
  const roleLower = (user?.role || "").toLowerCase();
  const isPrivilegedEditor = !!roleLower && roleLower !== "user";

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
          // ignore note save error but continue updating status
        }
      }
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
      setActionMessage(err?.response?.data?.message || "Lỗi lưu ghi chú");
    } finally {
      setSavingNote(false);
    }
  };

  // Derive customer info from complaint/order API data (prefer complaint.user from new API)
  const coalesce = (...vals) => {
    // return first non-empty value, ignoring common placeholder strings
    for (let v of vals) {
      if (v === null || v === undefined) continue;
      if (typeof v === "number" && !isNaN(v)) return String(v);
      if (typeof v === "string") {
        const s = v.trim();
        if (!s) continue;
        const lowered = s.toLowerCase();
        if (["null", "undefined", "n/a", "na", "-"].includes(lowered)) continue;
        return s;
      }
    }
    return undefined;
  };

  const userObj = (() => {
    try {
      const candidates = [
        complaint?.user,
        complaint?.raw?.user,
        complaint?.raw?.User,
        order?.user,
        order?.User, // Some APIs return capitalized User
        order?.customer,
        order?.customer_info,
        order?.customerInfo,
        complaint?.raw?.order?.user,
        complaint?.raw?.order?.User,
        complaint?.raw?.order?.customer,
      ];
      for (const u of candidates) if (u && typeof u === "object") return u;
      return {};
    } catch {
      return {};
    }
  })();

  const composeFullName = (u) => {
    const first = coalesce(u?.first_name, u?.firstName, u?.firstname);
    const last = coalesce(u?.last_name, u?.lastName, u?.lastname);
    const combined = [first, last].filter(Boolean).join(" ").trim();
    return combined || undefined;
  };

  const customerInfo = {
    name:
      coalesce(
        userObj.full_name,
        userObj.fullName,
        userObj.fullname,
        composeFullName(userObj),
        userObj.name,
        userObj.username,
        complaint?.raw?.customer_name,
        order?.customer_name,
        order?.customer?.name
      ) || "Khách hàng",
    phone:
      coalesce(
        userObj.phone_number,
        userObj.phoneNumber,
        userObj.phone,
        userObj.mobile,
        userObj.mobile_number,
        userObj.telephone,
        userObj.tel,
        complaint?.raw?.customer_phone,
        complaint?.raw?.phone,
        order?.customer_phone,
        order?.phone,
        order?.user?.phone_number,
        order?.User?.phone_number,
        order?.customer?.phone
      ) || "Chưa cập nhật",
    email:
      coalesce(
        userObj.email,
        complaint?.raw?.customer_email,
        complaint?.raw?.email,
        order?.customer_email,
        order?.email,
        order?.user?.email,
        order?.User?.email,
        order?.customer?.email
      ) || "-",
    address:
      coalesce(
        userObj.address,
        userObj.address_line,
        userObj.address1,
        userObj.address2,
        userObj.location,
        complaint?.raw?.customer_address,
        order?.shipping_address,
        order?.shippingAddress,
        order?.address,
        order?.user?.address,
        order?.User?.address,
        order?.customer?.address
      ) || "-",
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
                className={`${complaintStatusMap[status]?.color} px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm`}
              >
                <StatusIcon className="h-4 w-4" />
                <span className="font-semibold">
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
                  Tổng nguyên liệu
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
                    {(order?.marketplace_post || order?.post) && (
                      <button
                        type="button"
                        onClick={() => {
                          setMarketplacePost(null);
                          setMarketplaceImage(null);
                        }}
                        className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Thử lại trích xuất
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
                        {(() => {
                          const possibleId =
                            order?.marketplace_post_id ||
                            order?.marketplace_postId ||
                            order?.post_id ||
                            order?.postId ||
                            complaint?.raw?.marketplace_post_id ||
                            complaint?.raw?.post_id;
                          return (
                            <>
                              <p className="text-sm">
                                {possibleId
                                  ? "Không tìm thấy ảnh từ marketplace post"
                                  : "Không có dữ liệu bài post"}
                              </p>
                              {possibleId && (
                                <p className="text-xs mt-1">ID: {possibleId}</p>
                              )}
                            </>
                          );
                        })()}
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
                        {customerInfo.fullname || customerInfo.name}
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
                        {customerInfo.address || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin note / processing note */}
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
                      {isPrivilegedEditor ? (
                        <>
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
                              {!isNoteLocked && (
                                <button
                                  type="button"
                                  disabled={
                                    savingNote || !(adminNote || "").trim()
                                  }
                                  onClick={handleSaveAdminNote}
                                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                  {savingNote ? "Đang lưu..." : "Gửi ghi chú"}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">
                          {(adminNote && adminNote.trim()) || "Chưa có ghi chú"}
                        </div>
                      )}
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
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {/* {specialInstructions && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                      <p className="text-gray-600 mb-2">Hướng dẫn đặc biệt</p>
                      <p className="font-medium text-gray-800 whitespace-pre-line">
                        {specialInstructions}
                      </p>
                    </div>
                  )} */}

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
