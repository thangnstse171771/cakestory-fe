import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ChallengeDetail from "./ChallengeDetail";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

function parseDate(str) {
  // str: dd/mm/yyyy
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m}-${d}`);
}

export default function ChallengeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const filterRef = useRef(null);

  const challenges = [
    {
      id: "1",
      title: "Challenge Bánh Kem Hoa Hồng",
      description:
        "Thử thách 30 ngày làm bánh kem với chủ đề hoa hồng lãng mạn",
      image: IMAGE_URL,
      participants: 248,
      duration: "30 ngày",
      difficulty: "Trung bình",
      prize: "Bộ dụng cụ làm bánh cao cấp",
      status: "Đang diễn ra",
      startDate: "15/12/2024",
      endDate: "15/01/2025",
      host: {
        name: "Chef Minh Anh",
        avatar: IMAGE_URL,
      },
      tags: ["Bánh kem", "Hoa hồng", "Trang trí"],
    },
    {
      id: "2",
      title: "Cupcake Giáng Sinh",
      description: "Tạo ra những chiếc cupcake đầy màu sắc cho mùa Giáng Sinh",
      image: IMAGE_URL,
      participants: 156,
      duration: "14 ngày",
      difficulty: "Dễ",
      prize: "Voucher 500k",
      status: "Sắp diễn ra",
      startDate: "20/12/2024",
      endDate: "03/01/2025",
      host: {
        name: "Baker Thanh Hoa",
        avatar: IMAGE_URL,
      },
      tags: ["Cupcake", "Giáng sinh", "Màu sắc"],
    },
    {
      id: "3",
      title: "Bánh Sinh Nhật Sáng Tạo",
      description: "Thiết kế bánh sinh nhật độc đáo với kỹ thuật fondant",
      image: IMAGE_URL,
      participants: 89,
      duration: "21 ngày",
      difficulty: "Khó",
      prize: "Khóa học fondant chuyên nghiệp",
      status: "Đang diễn ra",
      startDate: "01/12/2024",
      endDate: "22/12/2024",
      host: {
        name: "Master Quỳnh Anh",
        avatar: IMAGE_URL,
      },
      tags: ["Sinh nhật", "Fondant", "Sáng tạo"],
    },
    {
      id: "4",
      title: "Macaron Pháp Truyền Thống",
      description: "Học cách làm macaron Pháp hoàn hảo với nhiều hương vị",
      image: IMAGE_URL,
      participants: 312,
      duration: "45 ngày",
      difficulty: "Khó",
      prize: "Chuyến du lịch Pháp",
      status: "Đã kết thúc",
      startDate: "01/10/2024",
      endDate: "15/11/2024",
      host: {
        name: "Chef Pierre",
        avatar: IMAGE_URL,
      },
      tags: ["Macaron", "Pháp", "Truyền thống"],
    },
  ];

  const filters = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "Tất cả" || challenge.status === selectedFilter;
    let matchesDate = true;
    if (dateRange.startDate && dateRange.endDate) {
      matchesDate =
        parseDate(challenge.startDate) >= dateRange.startDate &&
        parseDate(challenge.endDate) <= dateRange.endDate;
    }
    return matchesSearch && matchesFilter && matchesDate;
  });

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

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleBack = () => {
    setSelectedChallenge(null);
  };

  const handleJoinChallenge = (challengeId) => {
    // Xử lý logic tham gia challenge
    console.log("Tham gia challenge:", challengeId);
    alert("Đã tham gia challenge thành công!");
  };

  // Đóng popup khi click ngoài
  function handleClickOutside(e) {
    if (filterRef.current && !filterRef.current.contains(e.target)) {
      setShowDateFilter(false);
    }
  }

  useEffect(() => {
    if (showDateFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDateFilter]);

  // Nếu đang xem chi tiết challenge
  if (selectedChallenge) {
    return (
      <ChallengeDetail
        challenge={selectedChallenge}
        onBack={handleBack}
        onJoinChallenge={handleJoinChallenge}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Cake Story Challenges
          </h1>
          <p className="text-gray-600 text-lg">
            Tham gia các thử thách làm bánh thú vị và nhận giải thưởng hấp dẫn
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  placeholder="Tìm kiếm challenge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3 py-2 focus:border-pink-300 focus:outline-none"
                />
              </div>
              <div className="relative" ref={filterRef}>
                <button
                  className="p-2 rounded hover:bg-pink-100 border border-gray-200"
                  onClick={() => setShowDateFilter((v) => !v)}
                  aria-label="Bộ lọc ngày"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M6 7h12M6 11h12M6 15h8"
                    />
                  </svg>
                </button>
                {showDateFilter && (
                  <div className="absolute z-50 mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <DateRange
                      ranges={[
                        {
                          startDate: dateRange.startDate || new Date(),
                          endDate: dateRange.endDate || new Date(),
                          key: "selection",
                        },
                      ]}
                      onChange={(item) => {
                        setDateRange({
                          startDate: item.selection.startDate,
                          endDate: item.selection.endDate,
                          key: "selection",
                        });
                      }}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#ec4899"]}
                      showMonthAndYearPickers={true}
                      showDateDisplay={false}
                      editableDateInputs={true}
                      maxDate={addDays(new Date(), 365)}
                      locale={undefined}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm mr-2"
                        onClick={() => {
                          setDateRange({
                            startDate: null,
                            endDate: null,
                            key: "selection",
                          });
                          setShowDateFilter(false);
                        }}
                      >
                        Xóa
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-pink-400 hover:bg-pink-500 text-white text-sm"
                        onClick={() => setShowDateFilter(false)}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedFilter === filter
                        ? "bg-pink-400 hover:bg-pink-500 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-pink-50"
                    }`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => handleSelectChallenge(challenge)}
            >
              <div className="relative">
                <img
                  src={challenge.image || IMAGE_URL}
                  alt={challenge.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      challenge.status
                    )}`}
                  >
                    {challenge.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
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
                    <span>{challenge.participants} người</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
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
                    <span>{challenge.duration}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {challenge.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs border border-pink-200 text-pink-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white py-2 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChallenge(challenge);
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không tìm thấy challenge nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
