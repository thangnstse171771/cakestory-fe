import React, { useState, useEffect, useRef, use } from "react";
import { generateTrendingTopics } from "../../data/mockData";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { getAllChallenges } from "../../api/challenge";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // import Vietnamese locale
import { Trophy, Users } from "lucide-react";

dayjs.locale("vi");

const HomeSideBar = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await getAllChallenges();
        setChallenges((res.challenges || []).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [allUsersRes, followingRes] = await Promise.all([
          authAPI.getAllActiveUsers(),
          authAPI.getFollowing(user?.id),
        ]);

        const allUsers = allUsersRes.users || [];
        const followingIds = followingRes.following.map((f) => f.id);

        const filteredUsers = allUsers.filter(
          (u) => u.id !== user?.id && !followingIds.includes(u.id)
        );

        const shuffled = filteredUsers.sort(() => 0.5 - Math.random());
        const limited = shuffled.slice(0, 4);

        setSuggestedUsers(limited);
      } catch (error) {
        console.error("Failed to fetch suggested users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user?.id) fetchUsers();
  }, [user?.id]);
  const trendingTopics = generateTrendingTopics(5);

  return (
    <div className="w-45 lg:w-60 xl:w-80 space-y-4">
      {/* Trending Topics */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-bold text-gray-800 mb-4">Đang Xu Hướng</h3>
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-pink-600 font-medium">{topic.name}</span>
              <span className="text-gray-500 text-sm">{topic.posts}</span>
            </div>
          ))}
        </div>
        <button className="text-pink-500 text-sm mt-2 hover:text-pink-600">
          View all topics
        </button>
      </div> */}

      {/* Suggestion Groups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-row items-center gap-2 mb-4">
          <Users />
          <h3 className="font-bold text-gray-800">Người dùng khác</h3>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          </div>
        ) : suggestedUsers.length > 0 ? (
          <div className="space-y-3">
            {suggestedUsers.map((user, index) => (
              <div
                key={user.id || index}
                className="flex items-center space-x-3 rounded-lg transition"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Link to={`/user/${user.id}`}>
                    <img
                      src={
                        user.avatar ||
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                      alt={user.full_name}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </Link>
                </div>
                <div className="flex-1 text-left">
                  <div>
                    <Link to={`/user/${user.id}`}>
                      <span className="font-medium text-pink-700 hover:text-pink-500 text-sm cursor-pointer ">
                        {user.username}
                      </span>
                    </Link>
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {user.full_name}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-3">
              <Link
                to="/suggested-users"
                className="text-sm text-pink-500 hover:text-pink-600"
              >
                Xem tất cả người dùng
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Không có gợi ý nào</p>
        )}
      </div>

      {/* Challenges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-row items-center gap-2 mb-4">
          <Trophy />
          <h3 className="font-bold text-gray-800">Thử thách</h3>
        </div>

        {loadingChallenges ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-2">
            {challenges.map((chal, index) => (
              <div key={index} className="border-l-2 border-pink-200 pl-3">
                <div className="font-medium text-pink-700 text-sm">
                  <Link
                    className=" hover:text-pink-500 cursor-pointer"
                    to={`/challenge/details/${chal.id}`}
                  >
                    {chal.title}
                  </Link>
                </div>
                <div className="text-gray-500 text-xs">
                  {dayjs(chal.start_date).format("D MMM, YYYY")}
                </div>
              </div>
            ))}
            <div className="mt-3">
              <Link
                to="/challenge"
                className="text-sm text-pink-500 hover:text-pink-600"
              >
                Xem tất cả thử thách
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có thử thách nào</p>
        )}
      </div>
    </div>
  );
};

export default HomeSideBar;
