import React, { useState, useEffect, useRef, use } from "react";
import {
  generateTrendingTopics,
  generateSuggestionGroups,
  generateUpcomingEvents,
} from "../../data/mockData";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

const HomeSideBar = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.getAllActiveUsers();
        const usersArray = response.users.filter((u) => u.id !== user?.id);
        const shuffled = usersArray.sort(() => 0.5 - Math.random());
        const limited = shuffled.slice(0, 4);
        setSuggestedUsers(limited);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

  const trendingTopics = generateTrendingTopics(5);
  const upcomingEvents = generateUpcomingEvents(4);

  return (
    <div className="w-45 lg:w-60 xl:w-80 space-y-4">
      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Trending Topics</h3>
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
      </div>

      {/* Suggestion Groups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Suggested Users</h3>
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
        </div>

        <div className="mt-3">
          <Link to="/suggested-users" className="text-sm text-pink-600 hover:text-pink-700">
            View all users
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border-l-2 border-pink-200 pl-3">
              <div className="font-medium text-gray-800 text-sm">
                {event.name}
              </div>
              <div className="text-gray-500 text-xs">{event.date}</div>
            </div>
          ))}
        </div>
        <button className="text-pink-500 text-sm mt-2 hover:text-pink-600">
          View all events
        </button>
      </div>
    </div>
  );
};

export default HomeSideBar;
