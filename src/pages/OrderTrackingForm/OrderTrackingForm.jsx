import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
import { fetchOrderById } from "../../api/axios";
import {
  fetchMarketplacePostById,
  fetchComplaintIngredientsByShop,
  fetchShopByUserId,
} from "../../api/axios";
import { fetchIngredients } from "../../api/ingredients";
import {
  User,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquareText,
  Hourglass,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const statusMap = {
  pending: {
    label: "Đang chờ xử lý",
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-500",
  },
  ordered: {
    label: "Đã tiếp nhận",
    icon: <ClipboardCheck className="h-5 w-5" />,
    color: "text-cyan-500",
  },
  preparedForDelivery: {
    label: "Sẵn sàng giao hàng",
    icon: <Package className="h-5 w-5" />,
    color: "text-blue-500",
  },
  shipped: {
    label: "Đang vận chuyển",
    icon: <Truck className="h-5 w-5" />,
    color: "text-orange-500",
  },
  completed: {
    label: "Hoàn tất",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-emerald-500",
  },
  complaining: {
    label: "Đang khiếu nại",
    icon: <MessageSquareText className="h-5 w-5" />,
    color: "text-red-600",
  },
  cancelled: {
    label: "Đã hủy",
    icon: <Clock className="h-5 w-5" />,
    color: "text-red-500",
  },
};

// Helper to normalize various backend status strings to UI flow keys
const normalizeStatus = (s = "") => {
  const v = String(s).toLowerCase();
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
    return "preparedForDelivery";
  if (["shipping", "delivering", "in_transit", "shipped"].includes(v))
    return "shipped";
  if (["done", "delivered", "completed", "complete"].includes(v))
    return "completed";
  if (["complaint", "complaining", "disputed"].includes(v))
    return "complaining";
  if (["cancel", "canceled", "cancelled"].includes(v)) return "cancelled";
  if (["pending", "new"].includes(v)) return "pending";
  return s; // fallback to original
};

// Helper: extract the customer (order owner) id from various response shapes
const extractCustomerUserId = (data) => {
  if (!data || typeof data !== "object") return null;
  const customerNode = data.customer || data.Customer || {};
  const u = data.User || data.user || customerNode || {};
  const rawCustomerId = data.customer_id;
  const fromCustomerId =
    typeof rawCustomerId === "object" ? rawCustomerId?.id : rawCustomerId;

  // Only use explicitly customer-related fields; DO NOT use generic user_id from order
  const candidates = [
    data.customer_user_id,
    data.customerUserId,
    customerNode?.id,
    customerNode?.user_id,
    fromCustomerId,
    u?.customer_id,
    u?.id && (u?.role === "customer" || u?.is_customer) ? u.id : null,
  ].filter((v) => v !== undefined && v !== null && v !== "");

  if (!candidates.length) return null;
  try {
    return String(candidates[0]);
  } catch (_) {
    return null;
  }
};

export default function OrderTrackingForm({
  order,
  onUpdateStatus,
  onBackToList,
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const shopRoleSet = new Set([
    "admin",
    "account_staff",
    "staff",
    "shop",
    "seller",
    "owner",
    "manager",
    "shop_owner",
    "shopowner",
    "shop_admin",
    "vendor",
    "store",
    "shop_member",
  ]);
  const [viewerShopId, setViewerShopId] = useState(null);
  // Also infer a shop id directly from the user object if present
  const inferredUserShopId =
    user?.shop_id || user?.shopId || user?.shop?.id || null;
  // Consider as shop actor if role suggests it OR a shop id is present
  const isShopActor =
    shopRoleSet.has(role) || Boolean(viewerShopId || inferredUserShopId);
  const isCustomerActor = !isShopActor;

  useEffect(() => {
    let mounted = true;
    const inferFromUser = () => {
      const cand = user?.shop_id || user?.shopId || user?.shop?.id;
      return cand != null ? String(cand) : null;
    };
    (async () => {
      try {
        if (!user?.id) return;
        const shopResp = await fetchShopByUserId(user.id);
        const sid =
          shopResp?.shop?.shop_id ||
          shopResp?.shop_id ||
          shopResp?.id ||
          shopResp?.shop?.id ||
          null;
        if (mounted)
          setViewerShopId(sid != null ? String(sid) : inferFromUser());
      } catch (e) {
        console.warn(
          "Không thể lấy shopId của người dùng hiện tại:",
          e?.message || e
        );
        if (mounted) setViewerShopId(inferFromUser());
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Local state để cập nhật trạng thái động
  const [orderDetail, setOrderDetail] = useState(
    order
      ? {
          ...order,
          status: normalizeStatus(order.status),
          customer_user_id:
            order.customer_user_id || extractCustomerUserId(order) || null,
          // Ensure shop_id is present even if only nested
          shop_id:
            order.shop_id ||
            order.shopId ||
            order.shop?.id ||
            order.marketplace_post?.shop_id ||
            order.order_details?.[0]?.marketplace_post?.shop_id ||
            order.orderDetails?.[0]?.shop_id ||
            null,
        }
      : order
  );
  // Note feature removed
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New: ingredients and marketplace state
  const [ingredientsMap, setIngredientsMap] = useState({});
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [marketplacePost, setMarketplacePost] = useState(null);
  const [marketplaceImage, setMarketplaceImage] = useState(null);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const hasFetchedMarketplaceRef = useRef(false);

  // Helper to extract market image (borrowed from ComplaintDetails)
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
    const direct = pickFrom(mp);
    if (direct) return direct;
    const containers = [mp.post, mp.data];
    for (const c of containers) {
      const val = pickFrom(c);
      if (val) return val;
    }
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

  // Fetch order detail nếu có orderId từ URL params
  useEffect(() => {
    if (orderId && !order) {
      fetchOrderDetail();
    }
  }, [orderId]); // Chỉ depend vào orderId

  // keep local detail in sync if parent passes a new order object
  useEffect(() => {
    if (order) {
      setOrderDetail({
        ...order,
        status: normalizeStatus(order.status),
        customer_user_id:
          order.customer_user_id || extractCustomerUserId(order) || null,
        shop_id:
          order.shop_id ||
          order.shopId ||
          order.shop?.id ||
          order.marketplace_post?.shop_id ||
          order.order_details?.[0]?.marketplace_post?.shop_id ||
          order.orderDetails?.[0]?.shop_id ||
          null,
      });
    }
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);

      // Support various response shapes
      const data = response?.order || response?.data || response;

      // Parse customer info
      const customerUser = data.User || data.user || {};
      const customerName =
        customerUser.full_name ||
        customerUser.username ||
        (typeof data.customer_id === "number"
          ? `Khách hàng #${data.customer_id}`
          : data.customer_id?.name || "Không có tên");
      const customerEmail =
        customerUser.email ||
        customerUser.username ||
        data.customer_id?.email ||
        "";
      const customerPhone = customerUser.phone || data.customer_id?.phone || "";

      // Build items
      let items = [];
      if (Array.isArray(data.order_details)) {
        // Older shape (already normalized elsewhere)
        items = data.order_details.map((item) => ({
          name:
            item.cake?.name ||
            item.marketplace_post?.title ||
            `Bánh tùy chỉnh #${item.id || "N/A"}`,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
          customization: {
            size: item.size || data.size || "N/A",
            special_instructions:
              item.special_instructions || data.special_instructions || "",
            toppings: [],
          },
        }));
      } else if (Array.isArray(data.orderDetails)) {
        // Current BE shape: orderDetails with ingredient_id and total_price
        items = data.orderDetails.map((od) => {
          const q = Number(od.quantity) || 1;
          const total = parseFloat(od.total_price) || 0;
          const unit = q > 0 ? total / q : total;
          return {
            name: `Nguyên liệu #${od.ingredient_id}`,
            ingredientId: od.ingredient_id,
            quantity: q,
            price: unit,
            customization: {
              size: data.size || "N/A",
              special_instructions: data.special_instructions || "",
              toppings: [],
            },
          };
        });
      }

      // Prices
      const basePrice =
        parseFloat(data.base_price) ||
        parseFloat(data.total_price) ||
        parseFloat(data.total) ||
        0;
      const totalPrice = parseFloat(data.total_price) || basePrice;

      // Fallback compute ingredient_total from orderDetails when missing
      const computedIngredientTotal = Array.isArray(data.orderDetails)
        ? data.orderDetails.reduce(
            (acc, od) => acc + (parseFloat(od.total_price) || 0),
            0
          )
        : null;
      const ingredientTotalField = parseFloat(data.ingredient_total);

      // Transform data để phù hợp với component
      const transformedOrder = {
        id: data.id || data._id,
        customerName,
        customerEmail,
        customerPhone,
        items,
        total: totalPrice,
        base_price: basePrice,
        status: normalizeStatus(data.status || "pending"),
        orderNumber: data.orderNumber || `ORD-${data.id}`,
        placeDate:
          data.created_at ||
          data.createdAt ||
          new Date().toISOString().split("T")[0],
        // Extra fields from backend
        size: data.size || null,
        ingredient_total: Number.isFinite(ingredientTotalField)
          ? ingredientTotalField
          : computedIngredientTotal,
        special_instructions: data.special_instructions || "",
        shop_id: data.shop_id || data.shopId || data.shop?.id || null,
        marketplace_post_id: data.marketplace_post_id || null,
        customer_user_id: extractCustomerUserId(data),
        // history removed (no API/data yet)
      };

      setOrderDetail(transformedOrder);
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Load ingredients for the order's shop to resolve ingredient names/images
  useEffect(() => {
    // Try to derive shopId from multiple sources (order, embedded shop, marketplace post)
    const derivedShopId =
      orderDetail?.shop_id ||
      orderDetail?.shopId ||
      orderDetail?.shop?.id ||
      marketplacePost?.shop_id ||
      marketplacePost?.shopId ||
      marketplacePost?.shop?.id ||
      marketplacePost?.post?.shop_id ||
      marketplacePost?.data?.shop_id ||
      null;

    let mounted = true;
    const load = async () => {
      try {
        setLoadingIngredients(true);
        // Resolve shop id in priority order:
        // 1) From order/marketplace data (derivedShopId)
        // 2) From pre-fetched viewerShopId (if actor is shop/admin)
        // 3) Fallback: fetch by user id (as last resort)
        let shopIdToUse = derivedShopId || (isShopActor ? viewerShopId : null);

        // Last-resort fetch only if still missing and we have a user id
        if (!shopIdToUse && isShopActor && user?.id) {
          try {
            const shopResp = await fetchShopByUserId(user.id);
            shopIdToUse =
              shopResp?.shop?.shop_id ||
              shopResp?.shop_id ||
              shopResp?.id ||
              shopResp?.shop?.id ||
              null;
          } catch (e) {
            console.warn("Không thể derive shopId từ user:", e?.message || e);
          }
        }

        console.log(
          "[OrderTrackingForm] derivedShopId:",
          derivedShopId,
          "; viewerShopId:",
          viewerShopId,
          "; chosen:",
          shopIdToUse
        );
        if (!shopIdToUse) {
          console.log(
            "[OrderTrackingForm] Không có shopId để fetch ingredients"
          );
          return; // nothing to fetch
        }
        console.log(
          "[OrderTrackingForm] Fetch ingredients với shopId:",
          shopIdToUse
        );
        let data = await fetchIngredients(shopIdToUse);
        console.log("[OrderTrackingForm] Ingredients raw response:", data);
        if (!data) data = await fetchComplaintIngredientsByShop(shopIdToUse);
        if (data) {
          console.log(
            "[OrderTrackingForm] Fallback ingredients (complaint endpoint) raw:",
            data
          );
        }
        let listRaw = [];
        if (Array.isArray(data)) listRaw = data;
        else if (Array.isArray(data?.data)) listRaw = data.data;
        else if (Array.isArray(data?.ingredients)) listRaw = data.ingredients;
        else if (Array.isArray(data?.data?.ingredients))
          listRaw = data.data.ingredients;
        console.log(
          "[OrderTrackingForm] Ingredients normalized list:",
          listRaw
        );
        const mapped = listRaw.map((ing, idx) => ({
          id: ing.id || ing._id || idx,
          name: ing.name || ing.ingredient_name || "(No name)",
          price: Number(ing.price ?? ing.cost ?? 0),
          image: ing.image || ing.image_url || ing.photo || null,
          description: ing.description || ing.note || "",
        }));
        const mapObj = Object.fromEntries(mapped.map((i) => [String(i.id), i]));
        console.log(
          "[OrderTrackingForm] Ingredients map keys:",
          Object.keys(mapObj)
        );
        console.log(
          "[OrderTrackingForm] Items trước khi enrich:",
          orderDetail?.items
        );
        if (mounted) setIngredientsMap(mapObj);
      } catch (err) {
        console.warn("Load ingredients failed:", err);
      } finally {
        if (mounted) setLoadingIngredients(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [
    orderDetail?.shop_id,
    orderDetail?.shopId,
    marketplacePost,
    user?.id,
    isShopActor,
    viewerShopId,
  ]);

  // Enrich items with ingredient names/images when available
  useEffect(() => {
    if (
      !orderDetail ||
      !orderDetail.items ||
      !Object.keys(ingredientsMap).length
    )
      return;
    setOrderDetail((prev) => {
      if (!prev || !prev.items) return prev;
      let changed = false;
      const newItems = prev.items.map((it) => {
        let ingredientId = it.ingredientId;
        if (!ingredientId) {
          const m = /^Nguyên liệu #(\d+)/.exec(it.name || "");
          if (m) ingredientId = m[1];
        }
        const key = ingredientId != null ? String(ingredientId) : null;
        if (key && ingredientsMap[key]) {
          const ing = ingredientsMap[key];
          const needsName = !it.name || /^Nguyên liệu #/.test(it.name);
          const shouldUpdatePrice =
            (it.price == null || Number(it.price) === 0) &&
            ing.price != null &&
            Number(ing.price) > 0;
          if (needsName || !it.image || shouldUpdatePrice) {
            changed = true;
            return {
              ...it,
              ingredientId: key,
              name: needsName ? ing.name : it.name,
              image: it.image || ing.image || it.image_url,
              price: shouldUpdatePrice ? Number(ing.price) : it.price,
            };
          }
        }
        return { ...it, ingredientId };
      });
      console.log(
        "[OrderTrackingForm] Items sau khi enrich ingredients:",
        newItems
      );
      if (!changed) return prev;
      return { ...prev, items: newItems };
    });
  }, [ingredientsMap]);

  // Load marketplace post (and image) for reference
  useEffect(() => {
    const embedded = orderDetail?.marketplace_post;
    const postId = orderDetail?.marketplace_post_id;

    if (marketplaceImage) return; // already have an image

    if (!marketplacePost && embedded && Object.keys(embedded).length) {
      setMarketplacePost(embedded);
      const img = extractImageFromMarketplacePost(embedded);
      if (img) setMarketplaceImage(img);
      return;
    }

    if (
      !hasFetchedMarketplaceRef.current &&
      postId &&
      !marketplacePost &&
      !isLoadingMarketplace
    ) {
      hasFetchedMarketplaceRef.current = true;
      setIsLoadingMarketplace(true);
      (async () => {
        try {
          const res = await fetchMarketplacePostById(postId);
          const postData = res?.post || res?.data || res;
          if (postData) {
            setMarketplacePost(postData);
            const img = extractImageFromMarketplacePost(postData);
            if (img) setMarketplaceImage(img);
          }
        } catch (e) {
          console.warn("Không thể tải bài đăng marketplace:", e?.message || e);
          hasFetchedMarketplaceRef.current = false; // allow retry
        } finally {
          setIsLoadingMarketplace(false);
        }
      })();
    }
  }, [
    orderDetail?.marketplace_post_id,
    orderDetail?.marketplace_post,
    marketplacePost,
    marketplaceImage,
    isLoadingMarketplace,
  ]);

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    } else {
      navigate("/order-tracking");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-500 mb-6">
          Vui lòng chọn một đơn hàng từ danh sách.
        </p>
        <button
          onClick={handleBackToList}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  // Các trạng thái chính theo thứ tự flow
  const mainStatusFlow = [
    "pending",
    "ordered",
    "preparedForDelivery",
    "shipped",
    "completed",
  ];
  const currentStatusIndex = mainStatusFlow.indexOf(orderDetail.status);
  const progressPercentage =
    currentStatusIndex >= 0
      ? (currentStatusIndex / (mainStatusFlow.length - 1)) * 100
      : 0;

  // Hàm cập nhật trạng thái đơn hàng local
  const handleUpdateStatus = async (orderId, newStatus, _newHistoryEntry) => {
    try {
      const normalized = normalizeStatus(newStatus);
      // Cập nhật local state trước (không dùng lịch sử)
      setOrderDetail((prev) => (prev ? { ...prev, status: normalized } : prev));

      // Gọi API để cập nhật trạng thái
      if (onUpdateStatus) {
        await onUpdateStatus(orderId, normalized, undefined);
      }

      // Hiển thị thông báo thành công
      alert(
        `Đã cập nhật trạng thái đơn hàng thành: ${
          statusMap[normalized]?.label || normalized
        }`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi khi cập nhật trạng thái đơn hàng";
      alert(errorMessage);

      // Revert lại trạng thái cũ nếu có order prop
      if (order) {
        setOrderDetail({ ...order, status: normalizeStatus(order.status) });
      }
    }
  };

  // Note feature removed

  // Track whether this order already has a complaint to hide the button
  const [hasComplaint, setHasComplaint] = useState(
    Boolean(
      (orderDetail &&
        (orderDetail.status === "complaining" ||
          orderDetail.complaint_id ||
          orderDetail.complaintId ||
          orderDetail.has_complaint ||
          orderDetail.hasComplaint)) ||
        false
    )
  );

  useEffect(() => {
    setHasComplaint(
      Boolean(
        orderDetail &&
          (orderDetail.status === "complaining" ||
            orderDetail.complaint_id ||
            orderDetail.complaintId ||
            orderDetail.has_complaint ||
            orderDetail.hasComplaint)
      )
    );
  }, [
    orderDetail?.status,
    orderDetail?.complaint_id,
    orderDetail?.complaintId,
    orderDetail?.has_complaint,
    orderDetail?.hasComplaint,
  ]);

  // Derive order ownership for action gating
  const currentUserIdStr = user?.id != null ? String(user.id) : null;
  const orderOwnerIdStr =
    orderDetail?.customer_user_id != null
      ? String(orderDetail.customer_user_id)
      : null;
  const idMatches = Boolean(
    currentUserIdStr && orderOwnerIdStr && currentUserIdStr === orderOwnerIdStr
  );
  const emailMatches = Boolean(
    !orderOwnerIdStr &&
      user?.email &&
      orderDetail?.customerEmail &&
      String(user.email).toLowerCase() ===
        String(orderDetail.customerEmail).toLowerCase()
  );
  const isOrderOwner = idMatches || emailMatches;

  // Helper: derive order's shop id consistently for permission checks
  const deriveOrderShopId = () => {
    return (
      orderDetail?.shop_id ||
      orderDetail?.shopId ||
      orderDetail?.shop?.id ||
      marketplacePost?.shop_id ||
      marketplacePost?.shopId ||
      marketplacePost?.shop?.id ||
      marketplacePost?.post?.shop_id ||
      marketplacePost?.data?.shop_id ||
      null
    );
  };
  const orderShopIdStr = deriveOrderShopId()
    ? String(deriveOrderShopId())
    : null;
  const viewerShopIdStr = viewerShopId
    ? String(viewerShopId)
    : inferredUserShopId
    ? String(inferredUserShopId)
    : null;
  // Only shop (not the order owner) can control. If orderShopId is missing, allow logged-in shop by fallback.
  const canShopControl = Boolean(
    !isOrderOwner &&
      viewerShopIdStr &&
      (!orderShopIdStr || viewerShopIdStr === orderShopIdStr)
  );

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackToList}
          className="mb-6 bg-transparent border border-pink-300 text-pink-600 hover:bg-pink-100 px-6 py-2 rounded-lg font-semibold"
        >
          {"<"} Quay lại danh sách đơn hàng
        </button>

        {/* Hiện nút khiếu nại chỉ dành cho CHỦ đơn hàng khi trạng thái là shipped và chưa có khiếu nại */}
  {isOrderOwner && orderDetail.status === "shipped" && !hasComplaint && (
          <button
            className="mb-6 ml-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            onClick={() => setShowComplaintModal(true)}
          >
            Tạo khiếu nại
          </button>
        )}

        <div className="p-6 shadow-lg rounded-xl border border-pink-100 bg-white mb-8">
          {/* Progress Bar */}
          <div className="relative pt-1 mb-8">
            <div className="flex mb-2 items-center justify-between text-xs font-semibold text-gray-600">
              {mainStatusFlow.map((statusKey, index) => {
                const status = statusMap[statusKey];
                return (
                  <div
                    key={statusKey}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div
                      className={`p-3 rounded-full mb-1 transition-all duration-500 ${
                        index <= currentStatusIndex
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {status.icon}
                    </div>
                    <span className="mt-1">{status.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-pink-100">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>

          {/* Update Status (Admin/Internal Use) */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Cập nhật trạng thái
            </h3>
            {/* {isShopActor && !canShopControl && (
              <div className="mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                Bạn đang đăng nhập bằng tài khoản Shop nhưng không phải chủ shop
                của đơn này nên không thể thao tác cập nhật trạng thái.
              </div>
            )} */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Nút chuyển sang ordered (chỉ hiện khi đang pending) - Shop only */}
              {canShopControl && orderDetail.status === "pending" && (
                <button
                  onClick={() => handleUpdateStatus(orderDetail.id, "ordered")}
                  className="px-4 py-2 rounded-lg font-semibold border bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 transition-colors duration-200"
                >
                  Tiếp nhận đơn hàng
                </button>
              )}

              {/* Nút chuyển sang prepared (hiện khi đang ordered) - Shop only */}
              {canShopControl && orderDetail.status === "ordered" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(orderDetail.id, "preparedForDelivery")
                  }
                  className="px-4 py-2 rounded-lg font-semibold border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 transition-colors duration-200"
                >
                  Sẵn sàng giao hàng
                </button>
              )}

              {/* Nút chuyển sang shipped (hiện khi đang preparedForDelivery) - Shop only */}
              {canShopControl &&
                orderDetail.status === "preparedForDelivery" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "shipped")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-orange-500 text-white border-orange-500 hover:bg-orange-600 transition-colors duration-200"
                  >
                    Giao hàng
                  </button>
                )}

              {/* Nút chuyển sang completed (hiện khi đang shipped hoặc complaining) - ONLY order owner */}
              {isOrderOwner &&
                orderDetail.status === "shipped" &&
                !hasComplaint && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "completed")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 transition-colors duration-200"
                  >
                    Hoàn thành đơn hàng
                  </button>
                )}

              {/* Nút hủy đơn (hiện khi chưa hoàn thành) - Shop only */}
              {canShopControl &&
                orderDetail.status !== "completed" &&
                orderDetail.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "cancelled")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-red-500 text-white border-red-500 hover:bg-red-600 transition-colors duration-200"
                  >
                    Hủy đơn hàng
                  </button>
                )}
            </div>

            {/* Ghi chú đã được loại bỏ */}

            {/* Chỉ hiển thị trạng thái hiện tại */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-md font-semibold text-pink-600">
                Trạng thái hiện tại:
              </span>
              <span
                className={`px-2 py-1 text-sm rounded-lg font-semibold ${
                  statusMap[orderDetail.status]?.color ||
                  "bg-gray-200 text-gray-700"
                }`}
              >
                {statusMap[orderDetail.status]?.label || orderDetail.status}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <User className="h-5 w-5" />
              Thông tin khách hàng
            </h3>
            <ul className="space-y-1 text-gray-800">
              <li>
                <span className="font-medium">Tên:</span>{" "}
                {orderDetail.customerName}
              </li>
              <li>
                <span className="font-medium">Email:</span>{" "}
                {orderDetail.customerEmail}
              </li>
              <li>
                <span className="font-medium">Điện thoại:</span>{" "}
                {orderDetail.customerPhone}
              </li>
            </ul>
          </div>

          {/* Order Meta Info */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Package className="h-5 w-5" />
              Thông tin đơn hàng
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-800">
              <li>
                <span className="font-medium">Mã đơn:</span>{" "}
                {orderDetail.orderNumber}
              </li>
              <li>
                <span className="font-medium">Ngày tạo:</span>{" "}
                {(() => {
                  const d = new Date(orderDetail.placeDate);
                  return isNaN(d.getTime()) ? "-" : d.toLocaleString("vi-VN");
                })()}
              </li>
              <li>
                <span className="font-medium">Kích thước:</span>{" "}
                {orderDetail.size || "-"}
              </li>
              <li>
                <span className="font-medium">Tổng nguyên liệu:</span>{" "}
                {orderDetail.ingredient_total != null
                  ? Number(orderDetail.ingredient_total).toLocaleString(
                      "vi-VN"
                    ) + "đ"
                  : "-"}
              </li>
              <li className="md:col-span-2">
                <span className="font-medium">Ghi chú:</span>{" "}
                {orderDetail.special_instructions || "-"}
              </li>
              <li>
                <span className="font-medium">Shop ID:</span>{" "}
                {orderDetail.shop_id ?? "-"}
              </li>
              <li>
                <span className="font-medium">Marketplace Post ID:</span>{" "}
                {orderDetail.marketplace_post_id ?? "-"}
              </li>
            </ul>
          </div>

          {/* Order Items */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Package className="h-5 w-5" />
              Sản phẩm đơn hàng
            </h3>
            <ul className="space-y-3">
              {orderDetail.items?.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-start border-b border-pink-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-pink-200"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                      {Number(item.price) > 0 && (
                        <p className="text-sm text-gray-600">
                          Đơn giá: {Number(item.price).toLocaleString("vi-VN")}đ
                        </p>
                      )}
                      {item.customization && (
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          <p>Kích thước: {item.customization.size}</p>
                          {item.customization.toppings?.length > 0 && (
                            <p>
                              Topping:{" "}
                              {item.customization.toppings
                                .map((t) => `${t.name} (${t.quantity})`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-pink-600">
                    {(
                      Number(item.price || 0) * Number(item.quantity || 0)
                    ).toLocaleString("vi-VN")}
                    đ
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4 p-4 bg-pink-100 rounded-lg font-bold text-lg text-pink-800">
              <span>Tổng cộng:</span>
              <span>{orderDetail.base_price.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Marketplace reference (if any) */}
          {(marketplacePost || marketplaceImage) && (
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
                <Sparkles className="h-5 w-5" />
                Bài đăng tham chiếu
              </h3>
              <div className="flex items-start gap-4">
                {marketplaceImage && (
                  <img
                    src={marketplaceImage}
                    alt="Marketplace"
                    className="w-24 h-24 rounded object-cover border border-pink-200"
                  />
                )}
                <div className="text-gray-800 text-sm">
                  <p className="font-medium">
                    {marketplacePost?.title ||
                      marketplacePost?.name ||
                      marketplacePost?.post?.title ||
                      marketplacePost?.data?.title ||
                      "Bài đăng"}
                  </p>
                  {marketplacePost?.description && (
                    <p className="text-gray-600 mt-1 line-clamp-3">
                      {marketplacePost.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Thông tin đơn hàng (Extra Order Info) */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Sparkles className="h-5 w-5" />
              Thông tin đơn hàng
            </h3>
            <ul className="space-y-1 text-gray-800">
              <li>
                <span className="font-medium">Kích thước:</span>{" "}
                {orderDetail.size || "Không xác định"}
              </li>
              <li>
                <span className="font-medium">Tổng nguyên liệu:</span>{" "}
                {orderDetail.ingredient_total !== null
                  ? orderDetail.ingredient_total
                  : "Không xác định"}
              </li>
              <li>
                <span className="font-medium">Hướng dẫn đặc biệt:</span>{" "}
                {orderDetail.special_instructions || "Không có"}
              </li>
              <li>
                <span className="font-medium">Shop ID:</span>{" "}
                {orderDetail.shop_id || "Không xác định"}
              </li>
              <li>
                <span className="font-medium">Marketplace Post ID:</span>{" "}
                {orderDetail.marketplace_post_id || "Không xác định"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hiện form khiếu nại nếu showComplaintModal true */}
      {showComplaintModal && (
        <ComplaintModal
          isOpen={showComplaintModal}
          onClose={() => setShowComplaintModal(false)}
          order={orderDetail}
          onSubmit={() => {
            setShowComplaintModal(false);
            setHasComplaint(true);
            // Reload trang để đồng bộ trạng thái từ server và ẩn nút hoàn thành
            try {
              // React Router v6: navigate(0) sẽ reload hard
              typeof window !== "undefined" && window.location && window.location.reload();
            } catch {}
          }}
        />
      )}
    </div>
  );
}
