import React, { useEffect, useState } from "react";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Medal,
  Award,
} from "lucide-react";
import { authAPI } from "../../../api/auth";

const ChallengeLeaderboard = ({ challengeId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all challenge posts
      const response = await authAPI.getChallengeLeaderboardById(challengeId);
      const allUsers = response.leaderboard;

      console.log("Leaderboard:", allUsers);
      setLeaderboard(allUsers);
    } catch (error) {
      console.error("Error fetching challenge posts:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const competitors = [
    {
      id: 1,
      name: "Alex Chen",
      avatar: "/professional-avatar.png",
      points: 2847,
      time: "2h 34m",
      rank: 1,
      change: "+2",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/placeholder-hgsn1.png",
      points: 2756,
      time: "2h 41m",
      rank: 2,
      change: "+1",
    },
    {
      id: 3,
      name: "Marcus Rodriguez",
      avatar: "/male-professional-avatar.png",
      points: 2698,
      time: "2h 52m",
      rank: 3,
      change: "-1",
    },
    {
      id: 4,
      name: "Emma Wilson",
      avatar: "/professional-woman-avatar.png",
      points: 2543,
      time: "3h 12m",
      rank: 4,
      change: "0",
    },
    {
      id: 5,
      name: "David Kim",
      avatar: "/asian-professional-avatar.png",
      points: 2401,
      time: "3h 28m",
      rank: 5,
      change: "+3",
    },
  ];

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-slate-600">
            #{rank}
          </span>
        );
    }
  };

  const getChangeIcon = (change) => {
    if (change.startsWith("+"))
      return <TrendingUp size={14} className="text-green-600" />;
    if (change.startsWith("-"))
      return <TrendingDown size={14} className="text-red-600" />;
    return <Minus size={14} className="text-gray-500" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="w-full max-w-4xl mx-auto space-y-6 px-5 py-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-500 mb-5">
            Bảng Xếp Hạng
          </h1>
          <p className="text-lg text-slate-600">Ai là người dẫn đầu?</p>
        </div>

        {/* Leaderboard */}
        {/* Leaderboard */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-44">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-slate-500">
              Challenge chưa bắt đầu, quay lại sau nhé!
            </p>
          ) : (
            leaderboard.map((competitor) => (
              <div
                key={competitor.user_id}
                className={`p-4 md:p-6 border rounded-lg flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankStyle(competitor.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gray-200 flex items-center justify-center">
                  {competitor.post?.user?.avatar ? (
                    <img
                      src={competitor.post.user.avatar}
                      alt={competitor.post.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-rose-600">
                      {competitor.post?.user?.username
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-slate-800 truncate">
                      {competitor.post?.user?.username}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Target size={14} />
                      <span className="font-medium">
                        {competitor.post?.total_likes} likes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Points on right */}
                <div className="text-right font-bold hidden md:block">
                  <Heart className="text-pink-500 inline-block mr-1 fill-pink-500" />
                  <span className="text-slate-700">
                    {competitor.post?.total_likes}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeLeaderboard;
