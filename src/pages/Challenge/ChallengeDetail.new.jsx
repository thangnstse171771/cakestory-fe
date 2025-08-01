import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { joinChallenge } from "../../api/axios";
import axiosInstance from "../../api/axios";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

// Hàm đếm số người tham gia cho một challenge
const countParticipants = (entries, challengeId) => {
  return entries.filter((entry) => entry.challenge_id === challengeId).length;
};

export default function ChallengeDetail({
  challenge,
  onBack,
  onJoinChallenge,
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const navigate = useNavigate();

  // Kiểm tra trạng thái tham gia và đếm số người tham gia
  useEffect(() => {
    const checkJoinStatusAndCount = async () => {
      try {
        if (!challenge?.id) return;

        // Lấy danh sách entries từ API
        const response = await axiosInstance.get(`/challenge-entries`);
        const entries = response.data.entries || [];

        // Đếm số người tham gia cho challenge hiện tại
        const count = countParticipants(entries, challenge.id);
        setParticipantCount(count);

        // Kiểm tra xem user hiện tại đã tham gia chưa
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.id) {
          const hasJoinedChallenge = entries.some(
            (entry) =>
              entry.user_id === user.id && entry.challenge_id === challenge.id
          );
          if (hasJoinedChallenge) {
            setHasJoined(true);
          }
        }
      } catch (error) {
        console.error("Error checking join status:", error);
      }
    };

    checkJoinStatusAndCount();
  }, [challenge]);

  const handleJoin = async () => {
    if (!challenge?.id) {
      toast.error("Không tìm thấy thông tin challenge");
      return;
    }

    // Kiểm tra xem user đã đăng nhập chưa
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tham gia challenge");
      navigate("/login");
      return;
    }

    // Kiểm tra số lượng người tham gia
    if (participantCount >= (challenge.maxParticipants || 50)) {
      toast.error("Challenge đã đầy, không thể tham gia thêm!");
      return;
    }

    setIsJoining(true);

    try {
      // Gọi API để tham gia challenge
      await joinChallenge(challenge.id);

      // Cập nhật state
      setHasJoined(true);
      setParticipantCount((prev) => prev + 1);

      toast.success("Tham gia challenge thành công!");

      // Gọi callback để cập nhật parent component
      if (onJoinChallenge) {
        onJoinChallenge(challenge.id);
      }

      // Chuyển hướng đến trang nhóm challenge
      navigate(`/challenge/${challenge.id}/group`);
    } catch (error) {
      console.error("Error joining challenge:", error);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "bg-green-50 text-green-700 border-green-200";
      case "Sắp diễn ra":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Đã kết thúc":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Dễ":
        return "bg-green-50 text-green-700 border-green-200";
      case "Trung bình":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Khó":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const rules = (challenge.rules || "").split("\n").filter((r) => r);
  const requirements = (challenge.requirements || "")
    .split("\n")
    .filter((r) => r);

  const defaultRules = [
    "Tham gia đầy đủ trong thời gian diễn ra challenge",
    "Chia sẻ kết quả làm bánh theo yêu cầu",
    "Tương tác tích cực với các thành viên khác",
    "Tuân thủ quy định của cộng đồng",
  ];

  const defaultRequirements = [
    "Có kinh nghiệm cơ bản về làm bánh",
    "Có đầy đủ dụng cụ làm bánh cần thiết",
    "Cam kết tham gia đầy đủ thời gian challenge",
    "Có khả năng chia sẻ hình ảnh/video kết quả",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <button
          onClick={onBack}
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

        <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
          <div className="relative">
            <img
              src={challenge.image || IMAGE_URL}
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
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(
                      challenge.difficulty
                    )}`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
                <p className="text-lg opacity-90">{challenge.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin Challenge
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
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
                          src={challenge.host?.avatar || IMAGE_URL}
                          alt="avatar"
                          className="w-10 h-10 bg-pink-100 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {challenge.host?.name || "Admin"}
                          </p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-3 h-3 fill-current text-yellow-500"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              Master Chef
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                        {participantCount} người
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                        {challenge.startDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                        {challenge.endDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Quy tắc tham gia
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {(rules.length > 0 ? rules : defaultRules).map(
                    (rule, index) => (
                      <li key={index} className="flex items-start space-x-2">
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
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                    {challenge.prize}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ đăng ký</span>
                    <span>
                      {participantCount}/{challenge.maxParticipants || 50}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-400 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (participantCount /
                            (challenge.maxParticipants || 50)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {hasJoined ? (
                  <button className="w-full bg-green-400 text-white py-3 rounded-lg cursor-not-allowed">
                    ✓ Đã tham gia
                  </button>
                ) : challenge.status === "Đang diễn ra" ? (
                  <button
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleJoin}
                    disabled={
                      isJoining ||
                      participantCount >= (challenge.maxParticipants || 50)
                    }
                  >
                    {isJoining
                      ? "Đang tham gia..."
                      : participantCount >= (challenge.maxParticipants || 50)
                      ? "Challenge đã đầy"
                      : "Tham gia ngay"}
                  </button>
                ) : challenge.status === "Sắp diễn ra" ? (
                  <button
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleJoin}
                    disabled={
                      isJoining ||
                      participantCount >= (challenge.maxParticipants || 50)
                    }
                  >
                    {isJoining
                      ? "Đang đăng ký..."
                      : participantCount >= (challenge.maxParticipants || 50)
                      ? "Challenge đã đầy"
                      : "Đăng ký tham gia"}
                  </button>
                ) : (
                  <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed">
                    Challenge đã kết thúc
                  </button>
                )}

                <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-4 h-4 text-pink-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs text-pink-700">
                      Sau khi tham gia, bạn sẽ được chuyển đến nhóm challenge để
                      bắt đầu chia sẻ và tương tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Yêu cầu tham gia
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {(requirements.length > 0
                    ? requirements
                    : defaultRequirements
                  ).map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Thẻ tag</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {challenge.hashtag ? (
                    !challenge.hashtag.includes(",") ? (
                      <span className="px-2 py-1 border border-pink-200 text-pink-600 rounded text-sm">
                        #{challenge.hashtag.trim()}
                      </span>
                    ) : (
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
                  ) : challenge.tags && challenge.tags.length > 0 ? (
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
