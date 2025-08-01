import React from "react";
import { useNavigate } from "react-router-dom";
import ShopAnalysticSummary from "../../pages/Marketplace/ShopAnalystic";

const ShopAnalytics = ({ isOwner }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-pink-500">Phân tích Shop</h3>
        <button
          onClick={() => navigate("/marketplace/shop-analytics")}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
          style={{ boxShadow: "0 2px 8px 0 #f9a8d4" }}
        >
          <span role="img" aria-label="analytics">
            📊
          </span>
          Xem chi tiết phân tích
        </button>
      </div>
      <ShopAnalysticSummary />
    </div>
  );
};

export default ShopAnalytics;
