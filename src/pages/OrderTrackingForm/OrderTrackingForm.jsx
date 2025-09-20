import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
import CakeQuoteDetailComponent from "../CakeQuoteDetail";
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
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
// Shared utils
import {
  statusMap,
  normalizeStatus,
  extractCustomerUserId,
  extractShopId,
  extractImageFromMarketplacePost,
} from "./orderUtils";

export default function OrderTrackingForm({ order, onUpdateStatus }) {
  const { orderId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  // (Removed navigation state summary: fetch by id now returns full address/phone)
  // Detect if viewing from user purchase history page; restrict shop transitions here
  const isUserHistoryPage = (location?.pathname || "").startsWith(
    "/order-tracking-user"
  );
  // Detect admin orders page
  const isAdminOrdersPage = (location?.pathname || "").startsWith(
    "/admin/order-tracking"
  );
  // Detect shop orders page (default order-tracking page, not user/admin)
  const isShopOrdersPage =
    !isUserHistoryPage &&
    !isAdminOrdersPage &&
    (location?.pathname || "").startsWith("/order-tracking");

  // Memoized role and permission calculations
  const { role, isShopActor, inferredUserShopId } = useMemo(() => {
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
    const inferredUserShopId =
      user?.shop_id || user?.shopId || user?.shop?.id || null;
    const isShopActor = shopRoleSet.has(role) || Boolean(inferredUserShopId);

    return { role, isShopActor, inferredUserShopId };
  }, [user]);

  const [viewerShopId, setViewerShopId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null); // always fetched
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ingredientsMap, setIngredientsMap] = useState({});
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [marketplacePost, setMarketplacePost] = useState(null);
  const [marketplaceImage, setMarketplaceImage] = useState(null);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const hasFetchedMarketplaceRef = useRef(false);
  // Derived quantity & unit price for marketplace cake when backend doesn't send quantity
  const [derivedCakeQuantity, setDerivedCakeQuantity] = useState(null);
  const [derivedCakeUnitPrice, setDerivedCakeUnitPrice] = useState(null);

  // Fetch viewer shop ID
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
        // Support multiple response shapes
        const sid =
          shopResp?.shop?.shop_id ||
          shopResp?.shop_id ||
          shopResp?.id ||
          shopResp?.shop?.id ||
          shopResp?.data?.shop?.shop_id ||
          shopResp?.data?.shop_id ||
          shopResp?.data?.id ||
          shopResp?.data?.shop?.id ||
          null;
        if (mounted)
          setViewerShopId(sid != null ? String(sid) : inferFromUser());
      } catch (e) {
        if (mounted) setViewerShopId(inferFromUser());
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Fetch order detail from API
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);
      const data = response?.order || response?.data || response || {};

      // Log nguyên bản response để debug (giữ nguyên object từ API)
      // eslint-disable-next-line no-console
      console.log("RAW_ORDER_RESPONSE:", data);

      // Simple customer extraction (ưu tiên embedded User)
      const userObj = data.User || data.user || {};
      const customerName =
        userObj.full_name ||
        (typeof data.customer_id === "number"
          ? `Khách hàng #${data.customer_id}`
          : data.customer_id?.name) ||
        null;
      const customerEmail = userObj.email || "Chưa cập nhật";
      const customerPhone = userObj.phone_number || "Chưa cập nhật";
      const customerAddress = userObj.address || "Chưa cập nhật";

      // Normalize items from common shapes without heavy transforms
      const rawItems = data.orderDetails || [];
      const items = Array.isArray(rawItems)
        ? rawItems.map((it) => ({
            // name:
            //   it.cake?.name ||
            //   it.title ||
            //   it.name ||
            //   it.marketplace_post?.title ||
            //   it.ingredient_name ||
            //   `Item #${it.id ?? it.ingredient_id ?? "N/A"}`,
            quantity: Number(it.quantity ?? it.qty ?? it.amount) || 1,
            price: Number(it.price ?? it.unit_price ?? it.base_price ?? 0) || 0,
            customization: {
              size: it.size ?? data.size ?? null,
              special_instructions:
                it.special_instructions ?? data.special_instructions ?? null,
              toppings: it.toppings || it.customization?.toppings || [],
            },
            ingredientId: it.ingredient_id ?? it.ingredientId ?? null,
            __raw: it,
          }))
        : [];

      const base_price = Number(data.base_price ?? 0) || 0;
      const total =
        Number(data.total_price ?? data.total ?? data.amount ?? base_price) ||
        base_price;
      const ingredient_total = Number(
        data.ingredient_total ?? data.ingredientTotal ?? NaN
      );

      const transformedOrder = {
        id: data.id ?? data._id ?? data.order_id ?? null,
        orderNumber:
          data.orderNumber ??
          data.order_number ??
          data.order_no ??
          `ORD-${data.id ?? "N/A"}`,
        placedDate:
          data.created_at ?? data.createdAt ?? data.placedDate ?? null,
        status: normalizeStatus(data.status ?? data.order_status ?? "pending"),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items,
        base_price,
        total,
        ingredient_total: Number.isFinite(ingredient_total)
          ? ingredient_total
          : null,
        delivery_time: data.delivery_time ?? data.deliveryTime ?? null,
        special_instructions:
          data.special_instructions ?? data.specialInstructions ?? null,
        size: data.size ?? null,
        shop_id: extractShopId(data),
        tier: data.tier ?? null,
        marketplace_post_id:
          data.marketplace_post_id ?? data.marketplacePostId ?? null,
        marketplace_post:
          data.marketplace_post ?? data.marketplacePost ?? data.post ?? null,
        customer_user_id: extractCustomerUserId(data),
        shippingAddress: {
          address:
            data.shipping_address ??
            data.shippingAddress ??
            data.delivery_address ??
            data.deliveryAddress ??
            customerAddress ??
            "",
        },
        __raw: data,
      };

      setOrderDetail(transformedOrder);
    } catch (error) {
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Always fetch detail when orderId changes (API provides full data)
  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetail();
  }, [orderId]);

  // Load ingredients for the order's shop
  useEffect(() => {
    const derivedShopId = extractShopId(orderDetail, marketplacePost);
    let mounted = true;

    const load = async () => {
      try {
        setLoadingIngredients(true);
        let shopIdToUse = derivedShopId || (isShopActor ? viewerShopId : null);

        if (!shopIdToUse && isShopActor && user?.id) {
          try {
            const shopResp = await fetchShopByUserId(user.id);
            // Support multiple response shapes
            shopIdToUse =
              shopResp?.shop?.shop_id ||
              shopResp?.shop_id ||
              shopResp?.id ||
              shopResp?.shop?.id ||
              shopResp?.data?.shop?.shop_id ||
              shopResp?.data?.shop_id ||
              shopResp?.data?.id ||
              shopResp?.data?.shop?.id ||
              null;
          } catch (e) {
            // Silent fallback
          }
        }

        let data = await fetchIngredients(shopIdToUse);
        if (!data) data = await fetchComplaintIngredientsByShop(shopIdToUse);

        let listRaw = [];
        if (Array.isArray(data)) listRaw = data;
        else if (Array.isArray(data?.data)) listRaw = data.data;
        else if (Array.isArray(data?.ingredients)) listRaw = data.ingredients;
        else if (Array.isArray(data?.data?.ingredients))
          listRaw = data.data.ingredients;

        const mapped = listRaw.map((ing, idx) => ({
          id: ing.id || ing._id || idx,
          name: ing.name || ing.ingredient_name || "(No name)",
          price: Number(ing.price ?? ing.cost ?? 0),
          image: ing.image || ing.image_url || ing.photo || null,
          description: ing.description || ing.note || "",
        }));

        const mapObj = Object.fromEntries(mapped.map((i) => [String(i.id), i]));
        if (mounted) setIngredientsMap(mapObj);
      } catch (err) {
        // Silent error handling
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
    marketplacePost,
    user?.id,
    isShopActor,
    viewerShopId,
  ]);

  // Enrich items with ingredient names/images
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

      if (!changed) return prev;
      return { ...prev, items: newItems };
    });
  }, [ingredientsMap]);

  // Load marketplace post and image
  useEffect(() => {
    const embedded = orderDetail?.marketplace_post;
    const postId = orderDetail?.marketplace_post_id;

    if (marketplaceImage) return;

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
          hasFetchedMarketplaceRef.current = false;
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

  // Derive cake quantity from base_price and marketplace cakeSizes when quantity missing
  useEffect(() => {
    if (!orderDetail || !marketplacePost) return;
    const base = parseFloat(orderDetail.base_price);
    if (!base || base <= 0) return;

    const cakeSizes =
      marketplacePost.cakeSizes ||
      marketplacePost.cake_sizes ||
      marketplacePost.post?.cakeSizes ||
      [];
    if (!Array.isArray(cakeSizes) || cakeSizes.length === 0) return;

    const sizeRaw =
      orderDetail.size || orderDetail.items?.[0]?.customization?.size || null;

    let matched =
      (sizeRaw &&
        cakeSizes.find(
          (cs) =>
            (cs.size || cs.name || cs.label || "").toString() ===
            sizeRaw.toString()
        )) ||
      null;
    if (!matched && cakeSizes.length === 1) matched = cakeSizes[0];

    const sizePrice = matched
      ? parseFloat(matched.price)
      : parseFloat(cakeSizes[0]?.price);
    if (!sizePrice || sizePrice <= 0) return;

    const rawQty = base / sizePrice;
    const rounded = Math.round(rawQty);
    const accurate =
      (isFinite(rawQty) &&
        rawQty > 0 &&
        Math.abs(rawQty - rounded) < 0.01 * rawQty) ||
      Math.abs(rawQty - rounded) < 0.1;

    if (rounded >= 1 && accurate) {
      setDerivedCakeQuantity(rounded);
      setDerivedCakeUnitPrice(sizePrice);
    }
  }, [
    orderDetail?.base_price,
    orderDetail?.size,
    orderDetail?.items,
    marketplacePost,
  ]);

  // Auto-reload for pending orders
  useEffect(() => {
    if (orderDetail?.status !== "pending") return;
    const interval = setInterval(() => {
      if (orderId) fetchOrderDetail();
    }, 30000);
    return () => clearInterval(interval);
  }, [orderDetail?.status, orderId]);

  // Permission calculations
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
  const customerNameStr = String(orderDetail?.customerName || "").toLowerCase();
  const currentUsernameStr = String(
    user?.username || user?.full_name || user?.name || ""
  ).toLowerCase();
  const nameMatches = Boolean(
    customerNameStr &&
      currentUsernameStr &&
      customerNameStr === currentUsernameStr
  );
  const isOrderOwner = idMatches || emailMatches || nameMatches;

  const orderShopIdStr = extractShopId(orderDetail, marketplacePost)
    ? String(extractShopId(orderDetail, marketplacePost))
    : null;
  const viewerShopIdStr = viewerShopId
    ? String(viewerShopId)
    : inferredUserShopId
    ? String(inferredUserShopId)
    : null;
  // Shop controls are available whenever current viewer belongs to the order's shop
  const canShopControl = Boolean(
    viewerShopIdStr && (!orderShopIdStr || viewerShopIdStr === orderShopIdStr)
  );
  // On user history page, even if viewer belongs to the shop, do not allow shop transitions
  const canShopControlHere = canShopControl && !isUserHistoryPage;

  // Only customer accounts can perform end-customer actions; however, on the user history route
  // a dual-role account (also a shop) should still act as a customer.
  const isCustomerRole =
    isUserHistoryPage ||
    role === "customer" ||
    role === "user" ||
    Boolean(user?.is_customer);
  const canOwnerCustomerActions = Boolean(isOrderOwner && isCustomerRole);

  const hasComplaint = Boolean(
    orderDetail &&
      (orderDetail.status === "complaining" ||
        orderDetail.complaint_id ||
        orderDetail.complaintId ||
        orderDetail.has_complaint ||
        orderDetail.hasComplaint)
  );

  // Allow creating a complaint when order is shipped OR delivery_time is past due
  const isPastDelivery = (() => {
    const dt = orderDetail?.delivery_time ?? orderDetail?.deliveryTime ?? null;
    if (!dt) return false;
    try {
      const d = new Date(dt);
      return isFinite(d) && d.getTime() < Date.now();
    } catch (e) {
      return false;
    }
  })();

  // Countdown for 2-hour window after shipped
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    let intervalId = null;

    if (!orderDetail) {
      setRemainingMs(null);
      return () => {};
    }

    const raw = orderDetail.__raw || {};
    const shippedRaw =
      raw.shipped_at ||
      raw.shippedAt ||
      raw.shipped_time ||
      raw.shippedTime ||
      raw.shipped ||
      orderDetail.shipped_at ||
      orderDetail.shippedAt ||
      orderDetail.shipped_time ||
      orderDetail.shippedTime ||
      orderDetail.shipped ||
      null;

    if (!shippedRaw) {
      setRemainingMs(null);
      return () => {};
    }

    const shippedDate = new Date(shippedRaw);
    if (!isFinite(shippedDate)) {
      setRemainingMs(null);
      return () => {};
    }

    const expiry = shippedDate.getTime() + 2 * 60 * 60 * 1000;

    const update = () => {
      const rem = expiry - Date.now();
      setRemainingMs(rem);
      if (rem <= 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    update();
    intervalId = setInterval(update, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderDetail?.id, orderDetail?.__raw]);

  const isExpired = remainingMs != null && remainingMs <= 0;

  const canCreateComplaint =
    canOwnerCustomerActions &&
    !isShopOrdersPage &&
    !hasComplaint &&
    (isPastDelivery || (orderDetail?.status === "shipped" && !isExpired));

  const handleBackToList = () => {
    if (window.history.length > 1) {
      window.history.back();
      setTimeout(() => window.location.reload(), 300);
    } else {
      window.location.href = "/order-tracking";
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, _newHistoryEntry) => {
    try {
      const normalized = normalizeStatus(newStatus);
      setOrderDetail((prev) => (prev ? { ...prev, status: normalized } : prev));

      if (onUpdateStatus) {
        await onUpdateStatus(orderId, normalized, undefined);
      }

      alert(
        `Đã cập nhật trạng thái đơn hàng thành: ${
          statusMap[normalized]?.label || normalized
        }`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi khi cập nhật trạng thái đơn hàng";
      alert(errorMessage);

      // Reload from API on failure to ensure UI consistency
      fetchOrderDetail();
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

  if (!orderDetail || (!orderDetail.id && !orderDetail.orderNumber)) {
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

  // Link tới bài đăng marketplace (nếu có id)
  const marketplacePostLinkId =
    orderDetail?.marketplace_post_id ||
    marketplacePost?.id ||
    marketplacePost?.post?.id ||
    marketplacePost?.data?.id ||
    null;

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackToList}
          className="mb-6 bg-transparent border border-pink-300 text-pink-600 hover:bg-pink-100 px-6 py-2 rounded-lg font-semibold"
        >
          {"<"} Quay lại danh sách đơn hàng
        </button>

        <div className="flex items-center gap-3 mb-6">
          {canCreateComplaint ? (
            <>
              <button
                className={`ml-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow ${
                  isExpired ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !isExpired && setShowComplaintModal(true)}
                disabled={isExpired}
              >
                Tạo khiếu nại
              </button>
              {remainingMs != null && (
                <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-100 px-3 py-2 rounded">
                  {isExpired ? (
                    <span>
                      Hết hạn tạo khiếu nại (đã quá 2 tiếng kể từ khi giao)
                    </span>
                  ) : (
                    <span>
                      Thời gian còn lại để tạo khiếu nại:{" "}
                      <strong>
                        {(() => {
                          const total = Math.max(
                            0,
                            Math.floor(remainingMs / 1000)
                          );
                          const hrs = Math.floor(total / 3600);
                          const mins = Math.floor((total % 3600) / 60);
                          const secs = total % 60;
                          const pad = (n) => String(n).padStart(2, "0");
                          return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
                        })()}
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

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

          {/* Update Status */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Cập nhật trạng thái
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {canOwnerCustomerActions &&
                orderDetail.status === "pending" &&
                orderDetail.status !== "completed" &&
                orderDetail.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "cancelled")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-rose-500 text-white border-rose-500 hover:bg-rose-600 transition-colors duration-200"
                  >
                    Hủy đơn
                  </button>
                )}

              {/* Bỏ nút Tiếp nhận đơn hàng: backend tự chuyển pending -> ordered */}

              {canShopControlHere && orderDetail.status === "ordered" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(orderDetail.id, "preparedForDelivery")
                  }
                  className="px-4 py-2 rounded-lg font-semibold border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 transition-colors duration-200"
                >
                  Sẵn sàng giao hàng
                </button>
              )}

              {/* Shop có thể Hủy đơn khi trạng thái đang là "ordered" */}
              {canShopControlHere && orderDetail.status === "ordered" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(orderDetail.id, "cancelled")
                  }
                  className="px-4 py-2 rounded-lg font-semibold border bg-rose-500 text-white border-rose-500 hover:bg-rose-600 transition-colors duration-200"
                >
                  Hủy đơn
                </button>
              )}

              {canShopControlHere &&
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

              {canOwnerCustomerActions &&
                !isShopOrdersPage &&
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
            </div>

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
          <div className="p-6 bg-white shadow rounded-2xl mb-6 border border-pink-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-pink-600">
              <span className="p-2 rounded-full bg-pink-50">
                <User className="h-5 w-5" />
              </span>
              Thông tin khách hàng
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-gray-700">
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
                {orderDetail.customerPhone || (
                  <span className="text-gray-400">Chưa cập nhật</span>
                )}
              </li>
              <li className="sm:col-span-2">
                <span className="font-medium">Địa chỉ:</span>{" "}
                {orderDetail.customerAddress ||
                  orderDetail?.shippingAddress?.address ||
                  orderDetail?.address || (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
              </li>
            </ul>
          </div>

          {/* Order Meta Info */}
          {(orderDetail?.__raw?.cake_quote_id ?? order?.cake_quote_id) ==
          null ? (
            <div className="p-6 bg-white shadow rounded-2xl mb-6 border border-pink-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-pink-600">
                <span className="p-2 rounded-full bg-pink-50">
                  <Package className="h-5 w-5" />
                </span>
                Thông tin đơn hàng
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-gray-700">
                <li>
                  <span className="font-medium">Mã đơn:</span>{" "}
                  {orderDetail.orderNumber || "—"}
                </li>
                <li>
                  <span className="font-medium">ID:</span>{" "}
                  {orderDetail.id || "—"}
                </li>
                <li>
                  <span className="font-medium">Ngày tạo:</span>{" "}
                  {orderDetail.placedDate
                    ? new Date(orderDetail.placedDate).toLocaleString("vi-VN")
                    : "—"}
                </li>
                <li>
                  <span className="font-medium">Trạng thái:</span>{" "}
                  {statusMap[orderDetail.status]?.label ||
                    orderDetail.status ||
                    "—"}
                </li>
                <li>
                  <span className="font-medium">Shop ID:</span>{" "}
                  {orderDetail?.shop_id || "—"}
                </li>
                <li>
                  <span className="font-medium">Ngày khách hàng đặt giao:</span>{" "}
                  {orderDetail?.delivery_time
                    ? (() => {
                        try {
                          return new Date(
                            orderDetail.delivery_time
                          ).toLocaleString("vi-VN");
                        } catch {
                          return String(orderDetail.delivery_time);
                        }
                      })()
                    : "—"}
                </li>
                <li className="md:col-span-2">
                  <span className="font-medium">Ghi chú đơn hàng:</span>{" "}
                  {orderDetail?.special_instructions || (
                    <span className="text-gray-400">Không có</span>
                  )}
                </li>
              </ul>

              {/* Cake & Topping Detail */}
              <div className="mt-6 border-t border-pink-100 pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
                  🎂 Chi tiết bánh
                </h3>

                {derivedCakeQuantity && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-gray-700">
                    <li>
                      <span className="font-medium">Kích thước (Size):</span>{" "}
                      {orderDetail.size ?? "—"}
                    </li>
                    <li>
                      <span className="font-medium">Số tầng bánh:</span>{" "}
                      {orderDetail.tier ?? "1 "} (tầng)
                    </li>
                    <li>
                      <span className="font-medium">Đơn giá:</span>{" "}
                      {derivedCakeUnitPrice
                        ? Number(derivedCakeUnitPrice).toLocaleString("vi-VN") +
                          "đ"
                        : "—"}
                    </li>
                    <li>
                      <span className="font-medium">Số lượng:</span>{" "}
                      {derivedCakeQuantity}
                    </li>

                    <li className="sm:col-span-2 font-semibold text-pink-600">
                      <span className="font-medium">Tổng giá bánh:</span>{" "}
                      {orderDetail.base_price
                        ? Number(orderDetail.base_price).toLocaleString(
                            "vi-VN"
                          ) + "đ"
                        : "—"}
                    </li>
                  </ul>
                )}
              </div>

              {/* Toppings */}
              <div className="mt-6 border-t border-pink-100 pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
                  🍓 Chi tiết topping
                </h3>

                {/* Nếu không có items hoặc mảng rỗng -> hiển thị thông báo */}
                {!orderDetail.items || orderDetail.items.length === 0 ? (
                  <div className="text-gray-500">Không có topping</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {orderDetail.items?.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-start py-3"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: x
                            {item.quantity && Number(item.quantity) > 0
                              ? item.quantity
                              : derivedCakeQuantity || 1}
                          </p>
                          {Number(item.price) > 0 && (
                            <p className="text-sm text-gray-600">
                              Đơn giá:{" "}
                              {Number(item.price).toLocaleString("vi-VN")}đ
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-pink-600">
                          {(
                            Number(item.price || 0) *
                            (item.quantity && Number(item.quantity) > 0
                              ? Number(item.quantity)
                              : derivedCakeQuantity || 1)
                          ).toLocaleString("vi-VN")}
                          đ
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-6 p-4 bg-pink-50 rounded-xl font-bold text-lg text-pink-800">
                <span>Tổng cộng:</span>
                <span>
                  {orderDetail.total
                    ? Number(orderDetail.total).toLocaleString("vi-VN") + "đ"
                    : "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white shadow rounded-2xl mb-6 border border-pink-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-pink-600">
                <span className="p-2 rounded-full bg-pink-50">
                  <Package className="h-5 w-5" />
                </span>
                Thông tin Cake Quote
              </h3>
              <div className="text-gray-700">
                <Link
                  to={`/cake-quotes/${
                    orderDetail?.__raw?.cake_quote_id || order?.cake_quote_id
                  }`}
                  className="text-pink-600 font-semibold hover:underline"
                >
                  <button className="bg-pink-100 text-pink-600 font-semibold py-2 px-4 rounded-md">
                    Xem chi tiết Cake Quote
                  </button>
                </Link>

                <CakeQuoteDetailComponent
                  cakeQuoteId={
                    orderDetail?.__raw?.cake_quote_id || order?.cake_quote_id
                  }
                  cakeQuote={
                    orderDetail?.__raw?.cake_quote || order?.cake_quote
                  }
                  compact
                />
              </div>
            </div>
          )}

          {/* Marketplace reference */}
          {(marketplacePost || marketplaceImage) && (
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
                <Sparkles className="h-5 w-5" />
                Thông tin bánh
              </h3>
              <div className="flex items-start gap-4">
                {marketplaceImage &&
                  (marketplacePostLinkId ? (
                    <Link
                      to={`/marketplace/product/${marketplacePostLinkId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={marketplaceImage}
                        alt="Marketplace"
                        className="w-24 h-24 rounded object-cover border border-pink-200 hover:opacity-90"
                      />
                    </Link>
                  ) : (
                    <img
                      src={marketplaceImage}
                      alt="Marketplace"
                      className="w-24 h-24 rounded object-cover border border-pink-200"
                    />
                  ))}
                <div className="text-gray-800 text-sm">
                  {(() => {
                    const title =
                      marketplacePost?.title ||
                      marketplacePost?.name ||
                      marketplacePost?.post?.title ||
                      marketplacePost?.data?.title ||
                      "Bài đăng";
                    return marketplacePostLinkId ? (
                      <Link
                        to={`/marketplace/product/${marketplacePostLinkId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800 hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="font-medium">{title}</p>
                    );
                  })()}
                  {marketplacePost?.description && (
                    <p className="text-gray-600 mt-1 line-clamp-3">
                      {marketplacePost.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <ComplaintModal
          isOpen={showComplaintModal}
          onClose={() => setShowComplaintModal(false)}
          order={orderDetail}
          onSubmit={() => {
            setShowComplaintModal(false);
            try {
              window.location.reload();
            } catch {}
          }}
        />
      )}
    </div>
  );
}
