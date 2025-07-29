import React, { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const SuggestedUsers = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.getAllActiveUsers();
        const usersArray = response.users.filter((u) => u.id !== user?.id);
        setSuggestedUsers(usersArray);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.id]);

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
                <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-3 py-1 rounded-full transition">
                  Follow
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
