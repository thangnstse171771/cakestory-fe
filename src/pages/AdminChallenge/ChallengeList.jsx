"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeCard from "./ChallengeCard";
import { getAllChallenges } from "../../api/challenge";
import toast from "react-hot-toast";
import CreateChallenge from "./CreateChallenge";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

function getStatusFromDates(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return "Sắp diễn ra";
  if (now > end) return "Đã kết thúc";
  return "Đang diễn ra";
}

function translateStatus(status) {
  const statusMap = {
    notStart: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    ended: "Đã kết thúc",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    cancelled: "Bị hủy",
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export default function ChallengeList({ onViewDetail, onViewMembers, onEdit }) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const response = await getAllChallenges();
        if (response && response.challenges) {
          const apiChallenges = response.challenges.map((challenge) => {
            console.log("Raw challenge from API:", challenge);

            // Calculate duration from dates
            const calculateDuration = (startDate, endDate) => {
              if (!startDate || !endDate) return "30 ngày";
              const start = new Date(startDate);
              const end = new Date(endDate);
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return `${diffDays} ngày`;
            };

            const mapped = {
              id: challenge.id || challenge._id,
              title: challenge.title || "Untitled Challenge",
              description: challenge.description || "",
              adminStatus: translateStatus(
                challenge.admin_status ||
                  challenge.status ||
                  getStatusFromDates(challenge.start_date, challenge.end_date)
              ),
              startDate: formatDate(challenge.start_date),
              endDate: formatDate(challenge.end_date),
              duration: calculateDuration(
                challenge.start_date,
                challenge.end_date
              ),
              difficulty: challenge.difficulty || "Trung bình",
              prize:
                challenge.prize_description ||
                challenge.prize ||
                "Chưa có giải thưởng",
              participants: challenge.participants_count || 0,
              maxParticipants: challenge.max_participants || 100,
              minParticipants: challenge.min_participants || 10,
              hashtags: Array.isArray(challenge.hashtags)
                ? challenge.hashtags
                : typeof challenge.hashtag === "string"
                ? challenge.hashtag
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : challenge.hashtag
                ? [challenge.hashtag]
                : [],
              image: challenge.image_url || challenge.image || IMAGE_URL,
              avatar: challenge.avatar || IMAGE_URL,
              host: {
                name: challenge.host_name || challenge.host?.name || "Admin",
                avatar:
                  challenge.host_avatar || challenge.host?.avatar || IMAGE_URL,
              },
              rules: Array.isArray(challenge.rules)
                ? challenge.rules
                : typeof challenge.rules === "string" && challenge.rules.trim()
                ? challenge.rules.split("\n").filter(Boolean)
                : [],
              requirements: Array.isArray(challenge.requirements)
                ? challenge.requirements
                : typeof challenge.requirements === "string" &&
                  challenge.requirements.trim()
                ? challenge.requirements.split("\n").filter(Boolean)
                : [],
              // Raw data for editing
              start_date: challenge.start_date,
              end_date: challenge.end_date,
              hashtag: challenge.hashtag,
              prize_description: challenge.prize_description || challenge.prize,
            };

            console.log("Mapped challenge:", mapped);
            return mapped;
          });
          setChallenges(apiChallenges);
        } else {
          toast.error("Không có thử thách nào từ API.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Không thể kết nối với server. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            style={{
              padding: "8px 12px",
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#374151",
              cursor: "pointer",
              minWidth: "180px",
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Sắp diễn ra">Sắp diễn ra</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
          </select>
        </div>

        <button
          style={{
            background: "#f472b6",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onClick={() => setShowCreateModal(true)}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#ec4899")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#f472b6")}
        >
          ➕ Tạo Challenge Mới
        </button>
      </div>

      {/* Challenges Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "24px",
        }}
      >
        {challenges
          .filter((challenge) =>
            statusFilter === "all"
              ? true
              : challenge.adminStatus === statusFilter
          )
          .map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onViewDetail={() => navigate(`/admin/challenge/${challenge.id}`)}
              onViewMembers={onViewMembers}
              onEdit={onEdit}
            />
          ))}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallenge
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
