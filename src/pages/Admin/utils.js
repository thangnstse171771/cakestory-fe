// Helper functions for Admin account pages (simplified)

// Unified status resolver: returns 'active' or 'inactive'
export const getStatusValue = (account) => {
  if (!account || typeof account !== "object") return "inactive";
  const sources = [
    account.is_active,
    account.isActive,
    account.active,
    account.enabled,
    account.status,
    account?.shopInfo?.is_active,
    account?.shopInfo?.isActive,
    account?.shopInfo?.active,
    account?.shopInfo?.enabled,
    account?.shopInfo?.status,
  ];
  const normalize = (val) => {
    const s = String(val).trim().toLowerCase();
    if (["1", "true", "active", "enabled", "enable", "yes", "on"].includes(s))
      return "active";
    if (
      ["0", "false", "inactive", "disabled", "disable", "off", "no"].includes(s)
    )
      return "inactive";
    return null;
  };
  for (const v of sources) {
    if (v === undefined || v === null || v === "") continue;
    const norm = normalize(v);
    if (norm) return norm;
  }
  return "inactive";
};

// Filter accounts for Admin views (only 'all' users or 'shops')
export const filterAccounts = (accountsWithShop, view, search) => {
  return accountsWithShop.filter((account) => {
    if (view === "shops" && !account.shopInfo) return false;

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

    const statusValue = (() => {
      if (view === "shops" && account.shopInfo) {
        return getStatusValue({ shopInfo: account.shopInfo });
      }
      return getStatusValue(account);
    })();

    if (search.status) {
      const wanted = search.status; // 'active' | 'inactive'
      if (statusValue !== wanted) return false;
    }

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
