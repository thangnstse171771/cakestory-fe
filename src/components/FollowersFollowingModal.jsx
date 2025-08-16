import React from "react";

import { useState } from "react";

export default function FollowersFollowingModal({
  open,
  onClose,
  users,
  title,
  currentUserId,
  onFollow,
  onUnfollow,
  followingIds = [],
}) {
  const [localFollowing, setLocalFollowing] = useState(followingIds);

  // Sync localFollowing with prop changes
  React.useEffect(() => {
    setLocalFollowing(followingIds);
  }, [followingIds]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-pink-500 mb-4 text-center">{title}</h2>
        <div className="max-h-96 overflow-y-auto divide-y divide-pink-50">
          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Không có người dùng nào.</div>
          ) : (
            users.map((user) => {
              const isFollowing = localFollowing.includes(user.id);
              return (
                <div key={user.id} className="flex items-center gap-4 py-3">
                  <img
                    src={user.avatar || "https://via.placeholder.com/60"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border border-pink-200"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.full_name || user.username}</div>
                    <div className="text-gray-500 text-sm">@{user.username}</div>
                  </div>
                  {user.id !== currentUserId && (
                    isFollowing ? (
                      <button
                        className="px-4 py-2 rounded-lg bg-pink-100 text-pink-500 border border-pink-400 font-semibold hover:bg-pink-200 transition"
                        onClick={async () => {
                          await onUnfollow(user.id);
                          setLocalFollowing((prev) => prev.filter((id) => id !== user.id));
                        }}
                      >
                        Hủy theo dõi
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
                        onClick={async () => {
                          await onFollow(user.id);
                          setLocalFollowing((prev) => [...prev, user.id]);
                        }}
                      >
                        Theo dõi
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
