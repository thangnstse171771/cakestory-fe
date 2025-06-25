import { useState } from "react";
import { useNavigate } from "react-router-dom";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

export default function ChallengeDetail({
  challenge,
  onBack,
  onJoinChallenge,
}) {
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    setIsJoining(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    navigate(`/challenge/${challenge.id}/group`);
    setIsJoining(false);
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

  const rules = [
    "Mỗi tuần phải hoàn thành ít nhất 2 sản phẩm theo chủ đề",
    "Chia sẻ ảnh và video quá trình làm bánh",
    "Tương tác tích cực với cộng đồng",
    "Tuân thủ nguyên tắc an toàn thực phẩm",
    "Không sao chép ý tưởng của người khác",
  ];

  const requirements = [
    "Có kinh nghiệm làm bánh cơ bản",
    "Sở hữu dụng cụ làm bánh cần thiết",
    "Cam kết tham gia đầy đủ thời gian",
    "Tinh thần học hỏi và chia sẻ",
  ];

  const timeline = [
    {
      phase: "Tuần 1-2",
      task: "Làm quen với kỹ thuật cơ bản",
      status: "completed",
    },
    {
      phase: "Tuần 3-4",
      task: "Thực hành trang trí nâng cao",
      status: "current",
    },
    { phase: "Tuần 5", task: "Hoàn thiện và nộp bài cuối", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
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

        {/* Hero Section */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
          <div className="relative">
            <img
              src={IMAGE_URL}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian</p>
                      <p className="font-semibold text-gray-800">
                        {challenge.duration}
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Thành viên</p>
                      <p className="font-semibold text-gray-800">
                        {challenge.participants} người
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

                {/* Host Info */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Được tổ chức bởi</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={IMAGE_URL}
                      alt="avatar"
                      className="w-10 h-10 bg-pink-100 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {challenge.host.name}
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
            </div>

            {/* Rules */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Quy tắc tham gia
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {rules.map((rule, index) => (
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
                  ))}
                </ul>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lộ trình Challenge
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "completed"
                            ? "bg-green-500"
                            : item.status === "current"
                            ? "bg-pink-400"
                            : "bg-gray-300"
                        }`}
                      >
                        {item.status === "completed" ? (
                          <svg
                            className="w-4 h-4 text-white"
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
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.phase}
                        </p>
                        <p className="text-gray-600 text-sm">{item.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    {challenge.prize}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ đăng ký</span>
                    <span>{challenge.participants}/500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-400 h-2 rounded-full"
                      style={{
                        width: `${(challenge.participants / 500) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {challenge.status === "Đang diễn ra" ? (
                  <button
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg"
                    onClick={handleJoin}
                    disabled={isJoining}
                  >
                    {isJoining ? "Đang tham gia..." : "Tham gia ngay"}
                  </button>
                ) : challenge.status === "Sắp diễn ra" ? (
                  <button
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-lg"
                    onClick={handleJoin}
                    disabled={isJoining}
                  >
                    {isJoining ? "Đang đăng ký..." : "Đăng ký tham gia"}
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

            {/* Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Yêu cầu tham gia
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Thẻ tag</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 border border-pink-200 text-pink-600 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
