import React from "react";

const DeleteChallengePopup = ({ isOpen, onClose, onDelete, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Xóa thử thách</h2>
        <p>Bạn có chắc chắn muốn xóa thử thách này?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-300 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2"
          >
            Hủy
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChallengePopup;
