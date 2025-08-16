import React from "react";
import { Filter } from "lucide-react";

const ViewControls = ({ view, setView }) => {
  const views = [
    { key: "all", label: "Tất cả tài khoản" },
    { key: "premium", label: "Tài khoản Premium" },
    { key: "shops", label: "Tài khoản cửa hàng" },
    { key: "admin", label: "Tài khoản Admin" },
  ];

  return (
    <div className="mb-8 w-full max-w-xs">
      <label
        htmlFor="view-filter"
        className="block text-xs font-semibold text-pink-600 mb-1"
      >
        <span className="inline-flex items-center gap-1">
          <Filter className="w-4 h-4 text-pink-400" /> Lọc loại tài khoản
        </span>
      </label>
      <div className="relative">
        <select
          id="view-filter"
          className="block w-full border border-pink-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all shadow-sm appearance-none hover:border-pink-400"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          {views.map((viewOption) => (
            <option key={viewOption.key} value={viewOption.key}>
              {viewOption.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400">
          ▼
        </span>
      </div>
    </div>
  );
};

export default ViewControls;
