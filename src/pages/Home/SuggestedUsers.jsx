import React, { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const SuggestedUsers = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;

      try {
        const [allUsersRes, followingRes] = await Promise.all([
          authAPI.getAllActiveUsers(),
          authAPI.getFollowing(user.id),
        ]);

        const allUsers = allUsersRes.users;
        const followingIds = followingRes.following.map((f) => f.id);

        const filtered = allUsers.filter(
          (u) => u.id !== user.id && !followingIds.includes(u.id)
        );

        setSuggestedUsers(filtered);
      } catch (error) {
        console.error("Failed to fetch suggested users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.id]);

  const handleFollow = async (targetUserId, isFollowing) => {
    try {
      setFollowing((prev) => ({ ...prev, [targetUserId]: true }));

      if (isFollowing) {
        await authAPI.unfollowUserById(targetUserId);
      } else {
        await authAPI.followUserById(targetUserId);
      }

      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId
            ? { ...u, followedByCurrentUser: !isFollowing }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setFollowing((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-lg">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">
          Suggested Users
        </h3>
        <hr className="border-t border-pink-400/80 shadow-sm mb-4" />

        {loading ? (
          <div className="text-gray-500 text-sm mt-2">
            Loading suggested users...
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Link to={`/user/${u.id}`}>
                      <img
                        src={
                          u.avatar ||
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                        }
                        alt={u.full_name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 text-left">
                    <div>
                      <Link to={`/user/${u.id}`}>
                        <span className="font-medium text-pink-700 hover:text-pink-500 text-sm cursor-pointer">
                          {u.username}
                        </span>
                      </Link>
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {u.full_name}
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  disabled={following[u.id]}
                  onClick={() => handleFollow(u.id, u.followedByCurrentUser)}
                  className={`${
                    following[u.id]
                      ? "bg-pink-300 cursor-not-allowed"
                      : u.followedByCurrentUser
                      ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  } text-xs font-medium px-3 py-1 rounded-full transition`}
                >
                  {following[u.id]
                    ? u.followedByCurrentUser
                      ? "Unfollow"
                      : "Follow"
                    : u.followedByCurrentUser
                    ? "Unfollow"
                    : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;
