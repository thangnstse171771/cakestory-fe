// Helper functions for AdminDashboard

export const getIsPremium = (account) =>
  account.isPremium ?? account.is_premium ?? account.ispremium ?? false;

export const getIsBaker = (account) =>
  account.is_baker ?? account.isBaker ?? account.is_Baker ?? false;

export const getStatusValue = (account) => {
  if (account.status) return account.status;
  if (typeof account.is_active === "boolean")
    return account.is_active ? "active" : "restricted";
  if (typeof account.isActive === "boolean")
    return account.isActive ? "active" : "restricted";
  return "restricted";
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
    const statusValue = getStatusValue(account);
    if (search.status && statusValue !== search.status) return false;
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
