import React from "react";

const SearchForm = ({ search, setSearch, view, setView }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap md:flex-nowrap gap-3 items-end">
      <div className="min-w-[180px]">
        <label
          htmlFor="view-filter"
          className="block text-xs font-semibold text-pink-600 mb-1"
        >
          <span className="inline-flex items-center gap-1">
            <svg
              className="w-4 h-4 text-pink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-6.414 6.414A1 1 0 0 0 13 13.414V19a1 1 0 0 1-1.447.894l-2-1A1 1 0 0 1 9 18v-4.586a1 1 0 0 0-.293-.707L2.293 6.707A1 1 0 0 1 2 6V4z" />
            </svg>
            Lọc loại tài khoản
          </span>
        </label>
        <div className="relative">
          <select
            id="view-filter"
            className="block w-full border border-pink-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all shadow-sm appearance-none hover:border-pink-400"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="all">Tất cả tài khoản</option>
            <option value="shops">Tài khoản cửa hàng</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400">
            ▼
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Tên người dùng
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
          value={search.username}
          onChange={(e) =>
            setSearch((s) => ({ ...s, username: e.target.value }))
          }
          placeholder="Tìm kiếm Tên người dùng..."
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Email
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
          value={search.email}
          onChange={(e) => setSearch((s) => ({ ...s, email: e.target.value }))}
          placeholder="Tìm kiếm email..."
        />
      </div>
      <div className="min-w-[120px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Trạng thái
        </label>
        <select
          className="border border-pink-200 rounded px-3 py-2 w-full"
          value={search.status}
          onChange={(e) => setSearch((s) => ({ ...s, status: e.target.value }))}
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="restricted">Bị hạn chế</option>
        </select>
      </div>

      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Tên cửa hàng
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 w-full"
          value={search.shop}
          onChange={(e) => setSearch((s) => ({ ...s, shop: e.target.value }))}
          placeholder="Tìm kiếm cửa hàng..."
        />
      </div>
    </div>
  );
};

export default SearchForm;
