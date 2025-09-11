import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getChallengeById, joinChallenge } from "../../api/challenge";
import axiosInstance from "../../api/axios";
import ChallengeLeaderboard from "./ChallengePost/ChallengeLeaderboard";
// import axiosInstance from "../../api/axios";

const countParticipants = (entries, challengeId) => {
  if (!entries || !Array.isArray(entries)) {
    return 0;
  }
  return entries.filter((entry) => entry.challenge_id === challengeId).length;
};

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

function formatDateTime(dateString) {
  if (!dateString) return "Chưa xác định";

  try {
    const date = new Date(dateString);

    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "Chưa xác định";
    }

    // Format: "DD/MM/YYYY HH:mm"
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Chưa xác định";
  }
}

const IMAGE_URL =
  "https://img.freepik.com/premium-vector/baker_1083548-22816.jpg?semt=ais_hybrid&w=740&q=80";

export default function ChallengeDetailsPage() {
  // Lấy đúng param id từ useParams (route: /challenge/details/:id)
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // Fetch challenge details by ID
  useEffect(() => {
    const fetchChallengeDetails = async () => {
      console.log("[DEBUG] id param:", id, "| typeof:", typeof id);
      if (!id) {
        setError("ID challenge không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Sử dụng hàm getChallengeById đã import từ api/challenge
        const result = await getChallengeById(id);

        console.log("=== API CHALLENGE DETAILS RESULT ===");
        console.log("Full API Result:", result);

        // API trả về trực tiếp challenge object hoặc có structure khác
        if (result && result.challenge) {
          console.log("Challenge data:", result.challenge);
          // Translate status before setting
          const translatedChallenge = {
            ...result.challenge,
            status: translateStatus(result.challenge.status),
          };
          setChallenge(translatedChallenge);
        } else if (result && result.id) {
          // API trả về trực tiếp challenge object
          console.log("Direct challenge data:", result);
          // Translate status before setting
          const translatedChallenge = {
            ...result,
            status: translateStatus(result.status),
          };
          setChallenge(translatedChallenge);
        } else {
          console.error("Failed to fetch challenge:", result);
          setError("Không thể tải thông tin challenge");
          toast.error("Không thể tải thông tin challenge");
        }
      } catch (error) {
        console.error("Error in fetchChallengeDetails:", error);
        setError("Đã xảy ra lỗi khi tải thông tin challenge");
        toast.error("Đã xảy ra lỗi khi tải thông tin challenge");
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeDetails();
  }, [id]);

  // Fetch participant count
  useEffect(() => {
    const fetchParticipantCount = async () => {
      if (!id) return;

      setIsLoadingCount(true);
      try {
        const response = await axiosInstance.get(`/challenge-entries`, {
          params: {
            timestamp: Date.now(),
            _: Math.random(),
          },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const entries = response.data.entries || [];
        console.log("Fresh entries from API:", entries);

        const actualCount = countParticipants(entries, parseInt(id));
        console.log(
          `Actual participant count for challenge ${id}:`,
          actualCount
        );

        setParticipantCount(actualCount);
      } catch (error) {
        console.error("Error fetching participant count:", error);
        setParticipantCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchParticipantCount();
  }, [id]);

  // Check join status
  useEffect(() => {
    const checkJoinStatus = async () => {
      if (!id) return;

      try {
        // Clear localStorage buffer first
        localStorage.removeItem(`challenge_${id}_joined`);

        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Fetch fresh data to check join status
        const response = await axiosInstance.get(`/challenge-entries`, {
          params: {
            timestamp: Date.now(),
            _: Math.random(),
          },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const entries = response.data.entries || [];
        console.log("Checking join status with fresh entries:", entries);

        // Check if user has joined this challenge
        const hasJoinedChallenge = entries.some(
          (entry) =>
            entry.user_id === user.id && entry.challenge_id === parseInt(id)
        );

        console.log(
          `User ${user.id} joined challenge ${id}:`,
          hasJoinedChallenge
        );

        if (hasJoinedChallenge) {
          setHasJoined(true);
          localStorage.setItem(`challenge_${id}_joined`, "true");
        } else {
          setHasJoined(false);
        }
      } catch (error) {
        console.error("Error checking join status:", error);
        setHasJoined(false);
      }
    };

    checkJoinStatus();
  }, [id]);

  const handleJoin = async () => {
    if (!id) {
      toast.error("Không tìm thấy thông tin challenge");
      return;
    }

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tham gia challenge");
      navigate("/login");
      return;
    }

    setIsJoining(true);

    try {
      // Call API to join challenge
      await joinChallenge(id);

      // Update state and localStorage
      setHasJoined(true);
      localStorage.setItem(`challenge_${id}_joined`, "true");

      // Update participant count immediately (optimistic update)
      const newParticipantCount = participantCount + 1;
      setParticipantCount(newParticipantCount);

      toast.success("Tham gia challenge thành công!");
    } catch (error) {
      console.error("Error joining challenge:", error);

      // Handle different error cases
      if (error.response?.data?.message?.includes("already joined")) {
        toast.warning("Bạn đã tham gia challenge này rồi!");
        setHasJoined(true);
      } else if (error.response?.data?.message?.includes("challenge full")) {
        toast.error("Challenge đã đầy, không thể tham gia thêm!");
      } else if (error.response?.status === 404) {
        toast.error("Không tìm thấy challenge này!");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Không thể tham gia challenge. Vui lòng thử lại!"
        );
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleBack = () => {
    navigate("/challenge");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang diễn ra":
      case "onGoing":
        return "bg-green-50 text-green-700 border-green-200";
      case "Sắp diễn ra":
      case "notStart":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Đã kết thúc":
      case "ended":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <span className="ml-2 text-gray-600">
              Đang tải thông tin challenge...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <button
            onClick={handleBack}
            className="mb-6 text-gray-700 hover:text-gray-800 hover:bg-pink-50 p-2 rounded"
          >
            <svg
              className="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại danh sách
          </button>

          <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Không thể tải thông tin challenge
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse rules and requirements
  const rules = (challenge?.rules || "").split("\n").filter((r) => r.trim());
  const requirements = (challenge?.requirements || "")
    .split("\n")
    .filter((r) => r.trim());

  // Debug logs
  if (challenge) {
    console.log("=== CHALLENGE DEBUG INFO ===");
    console.log("Full challenge object:", challenge);
    console.log("Challenge fields:", Object.keys(challenge));
    console.log("Title:", challenge.title);
    console.log("Description:", challenge.description);
    console.log("Status:", challenge.status);
    // Đã bỏ difficulty
    console.log("Start date:", challenge.start_date);
    console.log("End date:", challenge.end_date);
    console.log("Prize:", challenge.prize_description);
    console.log("Max participants:", challenge.max_participants);
    console.log("Hashtag:", challenge.hashtag);
    console.log("Avatar/Image:", challenge.avatar);
    console.log("Rules:", challenge.rules);
    console.log("Requirements:", challenge.requirements);
    console.log("Parsed rules:", rules);
    console.log("Parsed requirements:", requirements);
    console.log("=== END DEBUG INFO ===");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 text-gray-700 hover:text-gray-800 hover:bg-pink-50 p-2 rounded"
        >
          <svg
            className="w-4 h-4 mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại danh sách
        </button>

        {/* Hero Section */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
          <div className="relative">
            <img
              src={challenge.avatar || challenge.image || IMAGE_URL}
              alt={challenge.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      challenge.status
                    )}`}
                  >
                    {challenge.status}
                  </span>
                  {/* Đã bỏ difficulty */}
                </div>
                <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
                <p className="text-lg opacity-90">{challenge.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Info */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin Challenge
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Được tổ chức bởi
                      </p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            challenge.host?.avatar ||
                            challenge.creator?.avatar ||
                            IMAGE_URL
                          }
                          alt="avatar"
                          className="w-10 h-10 bg-pink-100 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {challenge.host?.name ||
                              challenge.creator?.name ||
                              challenge.created_by ||
                              "Admin"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Thành viên</p>
                      <p className="font-semibold text-gray-800">
                        {isLoadingCount
                          ? "Đang tải..."
                          : `${participantCount} người`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Bắt đầu</p>
                      <p className="font-semibold text-gray-800">
                        {formatDateTime(
                          challenge.start_date || challenge.startDate
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Kết thúc</p>
                      <p className="font-semibold text-gray-800">
                        {formatDateTime(
                          challenge.end_date || challenge.endDate
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Quy tắc tham gia
                </h3>
              </div>
              <div className="p-6">
                {rules.length > 0 ? (
                  <ul className="space-y-2">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có quy tắc nào
                  </p>
                )}
              </div>
            </div>
            <ChallengeLeaderboard challengeId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <div className="bg-white border border-gray-200 rounded-lg sticky top-6">
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    <span className="font-semibold text-gray-800">
                      Giải thưởng
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {challenge.prize_description ||
                      challenge.prize ||
                      "Chưa có thông tin"}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ đăng ký</span>
                    <span>
                      {isLoadingCount
                        ? "..."
                        : `${participantCount}/${
                            challenge.max_participants ||
                            challenge.maxParticipants ||
                            50
                          }`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (participantCount /
                            (challenge.max_participants ||
                              challenge.maxParticipants ||
                              50)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  {(() => {
                    const minReq =
                      challenge.min_participants ||
                      challenge.minParticipants ||
                      0;
                    const remaining = minReq - participantCount;
                    if (minReq > 0 && remaining > 0) {
                      return (
                        <div className="mt-3 text-xs flex items-start gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded">
                          <span>⚠️</span>
                          <span>
                            Cần thêm <b>{remaining}</b> người để đạt tối thiểu (
                            {minReq})
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <button
                  className="w-full mb-3 bg-pink-100 hover:bg-pink-200 text-pink-700 py-3 rounded-lg border border-pink-300 font-semibold transition"
                  onClick={() => navigate(`/challenge/details/group/${id}`)}
                >
                  Vào nhóm Challenge
                </button>
                {hasJoined ? (
                  <>
                    <button className="w-full bg-green-400 text-white py-3 rounded-lg cursor-not-allowed">
                      ✓ Đã tham gia
                    </button>
                  </>
                ) : challenge.status === "Đang diễn ra" ||
                  challenge.status === "onGoing" ? (
                  <button className="w-full bg-pink-400 text-white py-3 rounded-lg cursor-not-allowed">
                    Challenge đang diễn ra
                  </button>
                ) : challenge.status === "Sắp diễn ra" ||
                  challenge.status === "notStart" ? (
                  <button
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleJoin}
                    disabled={isJoining || isLoadingCount}
                  >
                    {isJoining ? "Đang đăng ký..." : "Đăng ký tham gia"}
                  </button>
                ) : (
                  <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed">
                    Challenge đã kết thúc
                  </button>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Yêu cầu tham gia
                </h3>
              </div>
              <div className="p-6">
                {requirements.length > 0 ? (
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có yêu cầu đặc biệt nào
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Thẻ tag</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {challenge.hashtag ? (
                    // If hashtag is string and doesn't contain comma, display as single tag
                    !challenge.hashtag.includes(",") ? (
                      <span className="px-2 py-1 border border-pink-200 text-pink-600 rounded text-sm">
                        #{challenge.hashtag.trim()}
                      </span>
                    ) : (
                      // If contains comma, split and display multiple tags
                      challenge.hashtag
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag)
                        .map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 border border-pink-200 text-pink-600 rounded text-sm"
                          >
                            #{tag}
                          </span>
                        ))
                    )
                  ) : challenge.tags &&
                    Array.isArray(challenge.tags) &&
                    challenge.tags.length > 0 ? (
                    challenge.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 border border-pink-200 text-pink-600 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      Chưa có thẻ tag nào
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
