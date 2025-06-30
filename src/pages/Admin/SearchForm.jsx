import React from "react";

const SearchForm = ({ search, setSearch }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Tên người dùng
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
          value={search.username}
          onChange={(e) =>
            setSearch((s) => ({ ...s, username: e.target.value }))
          }
          placeholder="Tìm kiếm tên người dùng..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Email
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
          value={search.email}
          onChange={(e) => setSearch((s) => ({ ...s, email: e.target.value }))}
          placeholder="Tìm kiếm email..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Trạng thái
        </label>
        <select
          className="border border-pink-200 rounded px-3 py-2"
          value={search.status}
          onChange={(e) => setSearch((s) => ({ ...s, status: e.target.value }))}
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="restricted">Bị hạn chế</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Loại tài khoản
        </label>
        <select
          className="border border-pink-200 rounded px-3 py-2"
          value={search.premium}
          onChange={(e) =>
            setSearch((s) => ({ ...s, premium: e.target.value }))
          }
        >
          <option value="">Tất cả</option>
          <option value="premium">Premium</option>
          <option value="regular">Thường</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-pink-600 mb-1">
          Tên cửa hàng
        </label>
        <input
          type="text"
          className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
          value={search.shop}
          onChange={(e) => setSearch((s) => ({ ...s, shop: e.target.value }))}
          placeholder="Tìm kiếm cửa hàng..."
        />
      </div>
    </div>
  );
};

export default SearchForm;
