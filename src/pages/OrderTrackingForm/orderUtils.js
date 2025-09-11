// Shared order tracking utilities (status map, normalization, transformer)

export const statusMap = {
  pending: { label: "Đang chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  ordered: { label: "Đã tiếp nhận", color: "bg-cyan-100 text-cyan-700" },
  preparedForDelivery: {
    label: "Sẵn sàng giao hàng",
    color: "bg-blue-100 text-blue-700",
  },
  shipped: {
    label: "Đã được vận chuyển",
    color: "bg-orange-100 text-orange-700",
  },
  completed: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700" },
  complaining: { label: "Đang khiếu nại", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

// Normalize variant backend statuses to unified keys
export const normalizeStatus = (s) => {
  if (!s) return s;
  const v = String(s).toLowerCase();
  const table = [
    ["ordered", ["ordered", "accepted", "confirmed", "received"]],
    [
      "preparedForDelivery",
      [
        "preparedfordelivery",
        "prepared_for_delivery",
        "prepared",
        "preparing",
        "ready",
        "ready_to_ship",
      ],
    ],
    ["shipped", ["shipped", "shipping", "delivering", "in_transit"]],
    ["completed", ["completed", "done", "delivered", "finished"]],
    ["complaining", ["complaining", "complaint", "disputed"]],
    ["cancelled", ["cancelled", "canceled", "cancel"]],
    ["pending", ["pending", "new"]],
  ];
  for (const [key, arr] of table) if (arr.includes(v)) return key;
  return s;
};

// Extract customer user id from various shapes
export const extractCustomerUserId = (data) => {
  if (!data || typeof data !== "object") return null;
  const customerNode = data.customer || data.Customer || {};
  const u = data.User || data.user || customerNode || {};
  const rawCustomerId = data.customer_id;
  const fromCustomerId =
    typeof rawCustomerId === "object" ? rawCustomerId?.id : rawCustomerId;
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
  } catch {
    return null;
  }
};

// Extract shop id (supports embedded marketplace_post)
export const extractShopId = (orderData) => {
  if (!orderData || typeof orderData !== "object") return null;
  const mpShop =
    orderData?.marketplace_post?.shop_id ||
    orderData?.marketplace_post?.shop?.id;
  const candidates = [
    orderData.shop_id,
    orderData.shopId,
    orderData.shop?.id,
    orderData.shop?.shop_id,
    orderData.Shop?.id,
    orderData.Shop?.shop_id,
    mpShop,
  ].filter((v) => v !== undefined && v !== null && v !== "");
  if (!candidates.length) return null;
  return String(candidates[0]);
};

// Extract first plausible image URL from marketplace post
export const extractImageFromMarketplacePost = (mp) => {
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
    if (Array.isArray(node)) stack.push(...node);
    else stack.push(...Object.values(node));
  }
  return null;
};

// Build unified order summary object from raw API order
export const buildOrderSummary = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  // unify possible customer/user node variants
  const u =
    raw.User ||
    raw.user ||
    raw.customer ||
    raw.Customer ||
    raw.customer_user ||
    raw.customerUser ||
    (typeof raw.customer_id === "object" ? raw.customer_id : {}) ||
    {};
  const id = raw.id || raw.order_id || raw._id;
  const items = Array.isArray(raw.order_details)
    ? raw.order_details.map((item) => ({
        name:
          item.cake?.name || item.marketplace_post?.title || `Bánh #${item.id}`,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || parseFloat(item._pricbasee) || 0,
      }))
    : [];
  const basePrice =
    parseFloat(raw.base_price) || parseFloat(raw.total_price) || 0;
  const totalPrice = parseFloat(raw.total_price) || basePrice;
  const customerPhone =
    raw.customerPhone ||
    u.phone_number ||
    u.phone ||
    raw.phone_number ||
    (raw.customer_id && raw.customer_id.phone_number) ||
    (raw.customer_id && raw.customer_id.phone) ||
    "";
  const customerAddress =
    raw.customerAddress ||
    raw.address ||
    raw.shipping_address ||
    u.address ||
    u.business_address ||
    u.location ||
    (raw.customer_id && raw.customer_id.address) ||
    "";
  return {
    id,
    orderNumber: `ORD-${String(id).padStart(3, "0")}`,
    placedDate: raw.created_at || raw.createdAt,
    status: normalizeStatus(raw.status),
    size: raw.size || raw.cake_size || null,
    special_instructions: raw.special_instructions || raw.note || "",
    customerName:
      raw.customerName ||
      u.full_name ||
      u.username ||
      (typeof raw.customer_id === "object" && raw.customer_id?.name) ||
      `User #${
        u.id ||
        (typeof raw.customer_id === "object"
          ? raw.customer_id?.id
          : raw.customer_id) ||
        "N/A"
      }`,
    customerEmail:
      raw.customerEmail ||
      u.email ||
      (typeof raw.customer_id === "object" && raw.customer_id?.email) ||
      "",
    customerPhone,
    customerAddress,
    shippingAddress: {
      address:
        (raw.shippingAddress && raw.shippingAddress.address) ||
        raw.shipping_address ||
        raw.delivery_address ||
        raw.address ||
        u.address ||
        u.business_address ||
        customerAddress ||
        "",
    },
    items,
    base_price: basePrice,
    total: totalPrice,
    total_price: totalPrice, // alias so components expecting raw field still work
    history: [
      {
        date: raw.created_at
          ? new Date(raw.created_at).toLocaleDateString("vi-VN")
          : "",
        time: raw.created_at
          ? new Date(raw.created_at).toLocaleTimeString("vi-VN")
          : "",
        status: raw.status,
        note: "Đơn hàng được tạo",
      },
    ],
  };
};
