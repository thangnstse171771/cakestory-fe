import React from "react";

const ChatInfo = ({ open, onClose, avatar, name, images }) => {
  return (
    <div
      className={`h-full bg-white shadow-inner border-l transition-all duration-300 overflow-hidden ${
        open ? "w-[290px] opacity-100" : "w-0 opacity-0"
      }`}
      style={{ minWidth: open ? 290 : 0 }}
    >
      <div className="relative h-full p-6">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <span className="text-xl">&times;</span>
        </button>

        <div className="flex flex-col items-center gap-4 pt-10">
          <img src={avatar} alt={name} className="w-20 h-20 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-800">{name}</h2>

          <div className="w-full mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Sent Images</h3>
            <div className="flex flex-wrap gap-2">
              {images?.length > 0 ? (
                [...images]
                  .reverse()
                  .map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Sent ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ))
              ) : (
                <span className="text-gray-400 text-sm">No images sent.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
