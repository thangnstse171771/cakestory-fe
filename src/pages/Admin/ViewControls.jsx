import React from "react";

const ViewControls = ({ view, setView }) => {
  const views = [
    { key: "all", label: "Tất cả tài khoản" },
    { key: "premium", label: "Tài khoản Premium" },
    { key: "shops", label: "Tài khoản cửa hàng" },
    { key: "admin", label: "Tài khoản Admin" },
  ];

  return (
    <div className="mb-8 flex gap-4">
      {views.map((viewOption) => (
        <button
          key={viewOption.key}
          onClick={() => setView(viewOption.key)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            view === viewOption.key
              ? "bg-pink-500 text-white shadow-md"
              : "bg-white text-pink-500 hover:bg-pink-50"
          }`}
        >
          {viewOption.label}
        </button>
      ))}
    </div>
  );
};

export default ViewControls;
