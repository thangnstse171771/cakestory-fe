// walletUtils.js - Tách logic thành utility functions

// Constants
export const WALLET_CONFIG = {
  SHOP_COMMISSION_RATE: 0.95,
  SYSTEM_COMMISSION_RATE: 0.05,
  ITEMS_PER_PAGE: 20,
  WALLET_TYPES: {
    HOLDING: "holding",
    FLOATING: "floating",
    ACCOUNTING: "accounting",
    WITHDRAW: "withdraw",
  },
};

export const TRANSACTION_TYPES = {
  ORDER_PAYMENT: "order_payment",
  AI_GENERATION: "ai_generation",
  WITHDRAW: "withdraw",
};

export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
};

// Unified number parser - DRY principle
export const parseAmount = (value) => {
  if (typeof value === "number") return value;
  if (value == null) return 0;

  let str = String(value)
    .trim()
    .replace(/[^0-9.,-]/g, "");

  if (str.includes(",") && str.includes(".")) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";

    if (decimalSeparator === ",") {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    str = str.replace(/,/g, "");
  }

  const parsed = parseFloat(str);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Unified status normalizer
export const normalizeTransactionStatus = (status) => {
  const statusStr = String(status || "").toLowerCase();

  const statusMap = {
    completed: [
      "completed",
      "complete",
      "done",
      "success",
      "thanh cong",
      "hoàn thành",
      "thành công",
      "approved",
      "approve",
    ],
    failed: [
      "rejected",
      "reject",
      "failed",
      "fail",
      "error",
      "từ chối",
      "that bai",
      "cancelled",
      "canceled",
      "cancel",
    ],
    pending: ["pending", "pend", "waiting", "processing", "đang xử lý", "chờ"],
  };

  for (const [normalizedStatus, variants] of Object.entries(statusMap)) {
    if (variants.some((variant) => statusStr.includes(variant))) {
      return normalizedStatus;
    }
  }

  return TRANSACTION_STATUS.PENDING;
};

// User display name resolver
export const resolveUserDisplayName = (userId, embeddedUser, usersMap = {}) => {
  // Try embedded user first
  const embeddedName =
    embeddedUser?.full_name ||
    embeddedUser?.fullName ||
    (embeddedUser?.first_name && embeddedUser?.last_name
      ? `${embeddedUser.first_name} ${embeddedUser.last_name}`
      : embeddedUser?.name || embeddedUser?.username);

  if (embeddedName) return embeddedName;

  // Try users map
  if (userId != null && usersMap[userId]) {
    return usersMap[userId];
  }

  // Fallback
  return userId != null ? `user${userId}` : "User";
};

// Commission calculator
export const calculateCommission = (amount) => {
  const shopShare = Math.round(amount * WALLET_CONFIG.SHOP_COMMISSION_RATE);
  const systemShare = amount - shopShare;

  return { shopShare, systemShare };
};

// Transaction description localizer
export const localizeTransactionDescription = (transaction) => {
  const {
    transaction_type: type,
    order_id: orderId,
    description = "",
    status,
  } = transaction;
  const normalizedStatus = normalizeTransactionStatus(status);

  switch (type) {
    case TRANSACTION_TYPES.ORDER_PAYMENT:
      if (description.toLowerCase().includes("released payment")) {
        const shopMatch = description.match(/Shop received\s*(\d+%)/i);
        const adminMatch = description.match(/Admin received\s*(\d+%)/i);

        let extraInfo = "";
        const parts = [];
        if (shopMatch?.[1]) parts.push(`Cửa hàng nhận ${shopMatch[1]}`);
        if (adminMatch?.[1]) parts.push(`Admin nhận ${adminMatch[1]}`);
        if (parts.length) extraInfo = `. ${parts.join(", ")}`;

        return `Giải ngân thanh toán cho đơn #${
          orderId || ""
        }${extraInfo}`.trim();
      }

      if (
        description.toLowerCase().includes("held in escrow") ||
        normalizedStatus === TRANSACTION_STATUS.PENDING
      ) {
        return `Thanh toán đơn hàng #${orderId || ""} (đang giữ tạm)`.trim();
      }

      return orderId
        ? `Thanh toán đơn hàng #${orderId}`
        : "Thanh toán đơn hàng";

    case TRANSACTION_TYPES.AI_GENERATION:
      return "Doanh thu từ AI Generation";

    default:
      return description || "Giao dịch";
  }
};

// Currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

// Wallet configuration
export const getWalletConfig = (walletType) => {
  const configs = {
    [WALLET_CONFIG.WALLET_TYPES.HOLDING]: {
      icon: "🏦",
      color: "bg-blue-500",
      title: "Tiền giữ tạm",
    },
    [WALLET_CONFIG.WALLET_TYPES.FLOATING]: {
      icon: "🤖",
      color: "bg-purple-500",
      title: "Doanh Thu từ AI",
    },
    [WALLET_CONFIG.WALLET_TYPES.ACCOUNTING]: {
      icon: "📊",
      color: "bg-green-500",
      title: "Doanh Thu hoa hồng",
    },
    [WALLET_CONFIG.WALLET_TYPES.WITHDRAW]: {
      icon: "💸",
      color: "bg-red-500",
      title: "Tổng tiền rút",
    },
  };

  return (
    configs[walletType] || {
      icon: "💰",
      color: "bg-gray-500",
      title: "Ví",
    }
  );
};

// Status styling
export const getTransactionStatusStyle = (status) => {
  const styles = {
    [TRANSACTION_STATUS.COMPLETED]: "text-green-600 bg-green-100",
    [TRANSACTION_STATUS.PENDING]: "text-yellow-600 bg-yellow-100",
    [TRANSACTION_STATUS.FAILED]: "text-red-600 bg-red-100",
  };

  return styles[status] || "text-gray-600 bg-gray-100";
};

// Pagination helper
export const generatePageList = (
  totalPages,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1
) => {
  const pages = [];
  const maxSimple = boundaryCount * 2 + siblingCount * 2 + 3;

  if (totalPages <= maxSimple) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  const first = 1;
  const last = totalPages;
  const left = Math.max(first + boundaryCount, currentPage - siblingCount);
  const right = Math.min(last - boundaryCount, currentPage + siblingCount);

  // Start boundary
  for (let i = 1; i <= boundaryCount; i++) pages.push(i);

  // Left ellipsis or neighbor
  if (left > first + boundaryCount) {
    pages.push("dots");
  } else {
    for (let i = boundaryCount + 1; i < left; i++) pages.push(i);
  }

  // Sibling range
  for (let i = left; i <= right; i++) pages.push(i);

  // Right ellipsis or neighbor
  if (right < last - boundaryCount) {
    pages.push("dots");
  } else {
    for (let i = right + 1; i <= last - boundaryCount; i++) pages.push(i);
  }

  // End boundary
  for (let i = last - boundaryCount + 1; i <= last; i++) pages.push(i);

  // Dedup consecutive numbers/markers
  const compact = [];
  for (const p of pages) {
    if (compact.length === 0 || compact[compact.length - 1] !== p) {
      compact.push(p);
    }
  }

  return compact;
};
