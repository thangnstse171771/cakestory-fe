import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getChallengeById } from "../../api/challenge";
import ChallengeDetail from "./ChallengeDetail";
import MembersList from "./MembersList";
import toast from "react-hot-toast";

function translateStatus(status) {
  const statusMap = {
    notStart: "Sắp diễn ra",
    onGoing: "Đang diễn ra",
    ended: "Đã kết thúc",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    cancelled: "Bị hủy",
  };
  return statusMap[status] || status;
}

export default function AdminChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("detail"); // "detail" or "members"

  const handleViewMembers = (challengeData) => {
    console.log(
      "🔥 AdminChallengeDetail: handleViewMembers called with:",
      challengeData
    );
    setCurrentView("members");
  };

  const handleBackToDetail = () => {
    setCurrentView("detail");
  };

  const handleBackToDashboard = () => {
    navigate("/admin/challenge");
  };

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await getChallengeById(id);

      if (res && res.challenge) {
        // Map API data to UI-friendly format
        const c = res.challenge;

        const calculateDuration = (startDate, endDate) => {
          if (!startDate || !endDate) return "30 ngày";
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays} ngày`;
        };

        const mapped = {
          id: c.id || c._id,
          title: c.title || "Untitled Challenge",
          description: c.description || "",
          adminStatus: translateStatus(c.admin_status || c.status || ""),
          startDate: c.start_date
            ? new Date(c.start_date).toLocaleDateString("vi-VN")
            : "",
          endDate: c.end_date
            ? new Date(c.end_date).toLocaleDateString("vi-VN")
            : "",
          duration: calculateDuration(c.start_date, c.end_date),
          difficulty: c.difficulty || "",
          prize: c.prize_description || "",
          participants: c.participants_count || 0,
          maxParticipants: c.max_participants || 0,
          minParticipants: c.min_participants || 0,
          hashtags: Array.isArray(c.hashtags)
            ? c.hashtags
            : c.hashtag
            ? [c.hashtag]
            : [],
          image: c.image_url || "",
          avatar: c.avatar || "",
          host: {
            name: c.host_name || "Admin",
            avatar: c.host_avatar || "",
          },
          rules: Array.isArray(c.rules)
            ? c.rules.filter(Boolean)
            : typeof c.rules === "string" && c.rules.trim()
            ? c.rules.split("\n").filter(Boolean)
            : [],
          requirements: Array.isArray(c.requirements)
            ? c.requirements.filter(Boolean)
            : typeof c.requirements === "string" && c.requirements.trim()
            ? c.requirements.split("\n").filter(Boolean)
            : [],
          // Raw data for editing
          start_date: c.start_date,
          end_date: c.end_date,
          prize_description: c.prize_description || "",
        };
        setChallenge(mapped);
      } else {
        toast.error("Không tìm thấy thử thách");
        navigate("/admin/challenge");
      }
    } catch (err) {
      console.error("Error fetching challenge:", err);
      toast.error("Lỗi khi lấy thử thách");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeUpdated = (updatedChallenge) => {
    console.log("Challenge updated in AdminChallengeDetail:", updatedChallenge);

    // Reload challenge data from server
    fetchChallenge();

    // Show success message
    toast.success("Thử thách đã được cập nhật thành công!");
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (!challenge)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Không tìm thấy thử thách
      </div>
    );

  // Render Members List
  if (currentView === "members") {
    return <MembersList challenge={challenge} onBack={handleBackToDetail} />;
  }

  // Render Challenge Detail
  return (
    <ChallengeDetail
      challenge={challenge}
      onBack={handleBackToDashboard}
      onViewMembers={handleViewMembers}
      fetchChallenge={fetchChallenge}
    />
  );
}
