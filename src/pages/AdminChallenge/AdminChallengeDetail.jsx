import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getChallengeById } from "../../api/challenge";
import ChallengeDetail from "./ChallengeDetail";
import toast from "react-hot-toast";

export default function AdminChallengeDetail() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const res = await getChallengeById(id);
        if (res && res.challenge) {
          // Map API data to UI-friendly format
          const c = res.challenge;
          const mapped = {
            id: c.id || c._id,
            title: c.title || "Untitled Challenge",
            description: c.description || "",
            adminStatus: c.admin_status || c.status || "",
            startDate: c.start_date
              ? new Date(c.start_date).toLocaleDateString("vi-VN")
              : "",
            endDate: c.end_date
              ? new Date(c.end_date).toLocaleDateString("vi-VN")
              : "",
            duration: c.duration || "",
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
          };
          setChallenge(mapped);
        } else {
          toast.error("Không tìm thấy thử thách");
        }
      } catch (err) {
        toast.error("Lỗi khi lấy thử thách");
      } finally {
        setLoading(false);
      }
    };
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

  return <ChallengeDetail challenge={challenge} />;
}
