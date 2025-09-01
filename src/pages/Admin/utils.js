// Helper functions for AdminDashboard

export const getIsPremium = (account) =>
  account.isPremium ?? account.is_premium ?? account.ispremium ?? false;

export const getIsBaker = (account) =>
  account.is_baker ?? account.isBaker ?? account.is_Baker ?? false;

export const getStatusValue = (account) => {
  if (!account || typeof account !== "object") return "restricted";

  // Gom tất cả nguồn có thể có trạng thái (user + shopInfo)
  const sources = [
    account.status,
    account.is_active,
    account.isActive,
    account.active,
    account.enabled,
    account?.shopInfo?.status,
    account?.shopInfo?.is_active,
    account?.shopInfo?.isActive,
    account?.shopInfo?.active,
  ];

  const normalize = (val) => {
    const s = String(val).trim().toLowerCase();
  if (["1","true","active","activated","enable","enabled","yes","on"].includes(s)) return "active";
  if (["0","false","inactive","disabled","disable","blocked","banned","restricted","off","no"].includes(s)) return "restricted";
    return null;
  };

  for (const v of sources) {
    if (v === undefined || v === null || v === "") continue;
    const norm = normalize(v);
    if (norm) return norm;
  }
  return "restricted"; // fallback
};

export const filterAccounts = (accountsWithShop, view, search) => {
  return accountsWithShop.filter((account) => {
    const isPremium = getIsPremium(account);
    const isBaker = getIsBaker(account);
    // Lấy role ưu tiên trường role, nếu không có thì fallback sang flag
    const role =
      account.role ||
      (account.is_admin || account.isAdmin
        ? "admin"
        : account.is_account_staff
        ? "account_staff"
        : account.is_complaint_handler
        ? "complaint_handler"
        : "user");

    if (view === "premium" && !isPremium) return false;
    if (view === "shops" && !account.shopInfo) return false;
    if (view === "admin" && role !== "admin") return false;
    if (view === "account_staff" && role !== "account_staff") return false;
    if (view === "complaint_handler" && role !== "complaint_handler")
      return false;

    if (
      search.username &&
      !account.full_name?.toLowerCase().includes(search.username.toLowerCase())
    )
      return false;
    if (
      search.email &&
      !account.email?.toLowerCase().includes(search.email.toLowerCase())
    )
      return false;
    // Chuẩn hoá status: nếu đang ở view shops => ưu tiên trạng thái shop
    let statusValue;
    if (view === "shops" && account.shopInfo) {
      const sv = account.shopInfo.is_active ?? account.shopInfo.isActive ?? account.shopInfo.status;
      const s = String(sv).trim().toLowerCase();
      const activeVals = ["true","1","active","activated","enable","enabled"];
      statusValue = activeVals.includes(s) ? "active" : "restricted";
    } else {
      statusValue = getStatusValue(account);
    }
    if (search.status) {
      const wanted = search.status === "inactive" ? "restricted" : search.status; // chấp nhận cả inactive
      if (statusValue !== wanted) return false;
    }
    if (
      search.premium &&
      ((search.premium === "premium" && !isPremium) ||
        (search.premium === "regular" && isPremium))
    )
      return false;
    if (
      search.shop &&
      !(account.shopInfo?.business_name || "")
        .toLowerCase()
        .includes(search.shop.toLowerCase())
    )
      return false;
    return true;
  });
};
