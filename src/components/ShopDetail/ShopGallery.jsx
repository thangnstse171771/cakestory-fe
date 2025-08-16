import React from "react";

const ShopGallery = ({ gallery }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xl text-pink-500">Phòng trưng bày</h3>
        <button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-6 h-8 rounded-lg shadow transition">
          Xem Tất Cả
        </button>
      </div>
      {gallery && gallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((item, idx) => (
            <div
              key={idx}
              className="group relative h-48 rounded-xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-center px-4">
                  <h3 className="text-white font-semibold text-xl mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {item.title}
                  </h3>
                  <div className="w-12 h-1 bg-white mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-white rounded-xl py-16 text-center">
          <div className="absolute inset-0 bg-grid-gray-100 opacity-[0.2]"></div>
          <div className="relative">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              Chưa có hình ảnh nào. Quay lại sau nhé!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopGallery;
