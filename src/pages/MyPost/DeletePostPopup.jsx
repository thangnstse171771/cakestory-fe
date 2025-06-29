import React from "react";

const DeletePostPopup = ({ isOpen, onClose, onDelete, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Delete Post</h2>
        <p>Are you sure you want to delete this post?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-300 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePostPopup;
