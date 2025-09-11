import React from "react";

// Refactored: only two views (all users, shops). Status unified to is_active (active/inactive)
// Removed legacy 'restricted' naming in UI (still allow internal search.status = 'active'|'inactive')
const ACCOUNT_VIEWS = [
  { value: "all", label: "Tất cả tài khoản người dùng" },
  { value: "shops", label: "Tài khoản cửa hàng" },
];

const SearchForm = ({ search, setSearch, view, setView }) => {
  const handleChange = (field) => (e) =>
    setSearch((s) => ({ ...s, [field]: e.target.value }));

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap md:flex-nowrap gap-3 items-end">
      {/* View selector */}
      <div className="min-w-[200px]">
        <label
          htmlFor="view-filter"
          className="block text-xs font-semibold text-pink-600 mb-1"
        >
          Loại tài khoản
        </label>
        <div className="relative">
          <select
            id="view-filter"
            className="block w-full border border-pink-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all shadow-sm appearance-none hover:border-pink-400"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {ACCOUNT_VIEWS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400">
            ▼
          </span>
        </div>
      </div>

      {/* Username */}
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Tên người dùng
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
          value={search.username}
          onChange={handleChange("username")}
          placeholder="Tìm kiếm tên người dùng..."
        />
      </div>

      {/* Email */}
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Email
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
          value={search.email}
          onChange={handleChange("email")}
          placeholder="Tìm kiếm email..."
        />
      </div>

      {/* Status */}
      <div className="min-w-[140px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Trạng thái
        </label>
        <select
          className="border border-pink-200 rounded px-3 py-2 w-full"
          value={search.status}
          onChange={handleChange("status")}
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      {/* Shop name only when viewing shops */}
      {view === "shops" && (
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-pink-600 mb-1">
            Tên cửa hàng
          </label>
          <input
            type="text"
            className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
            value={search.shop}
            onChange={handleChange("shop")}
            placeholder="Tìm kiếm cửa hàng..."
          />
        </div>
      )}
    </div>
  );
};

export default SearchForm;
