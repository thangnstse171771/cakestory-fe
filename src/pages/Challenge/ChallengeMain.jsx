import { useState } from "react";

export default function ChallengeMain() {
  const [selectedChallenge, setSelectedChallenge] = useState("wedding");

  const challenges = [
    {
      id: "summer",
      title: "Summer Vibes Challenge",
      description: "Create your best summer-themed cake",
      deadline: "Aug 15, 2024",
      participants: 156,
      color: "bg-orange-400",
      status: "active",
    },
    {
      id: "wedding",
      title: "Wedding Elegance",
      description: "Design an elegant wedding cake",
      deadline: "Jul 30, 2024",
      participants: 89,
      color: "bg-green-400",
      status: "active",
    },
    {
      id: "music",
      title: "Music-Inspired Cakes",
      description: "Create a cake inspired by your favorite song",
      deadline: "Aug 22, 2024",
      participants: 234,
      color: "bg-purple-500",
      status: "active",
    },
    {
      id: "beginner",
      title: "Beginners Challenge",
      description: "Perfect start for new bakers",
      deadline: "Sep 5, 2024",
      participants: 445,
      color: "bg-blue-400",
      status: "active",
    },
    {
      id: "national",
      title: "National Day Special",
      description: "Patriotic designs for the upcoming holiday",
      deadline: "Jul 4, 2024",
      participants: 178,
      color: "bg-yellow-400",
      status: "active",
    },
    {
      id: "spring",
      title: "Spring Floral Contest",
      description: "Fresh designs to spring celebration",
      deadline: "May 15, 2024",
      participants: 267,
      color: "bg-pink-300",
      status: "completed",
    },
  ];

  const filterButtons = [
    { label: "Filter", active: true },
    { label: "Newest", active: false },
    { label: "Featured", active: false },
    { label: "Popular", active: false },
    { label: "Expert", active: false },
    { label: "Prize", active: true },
    { label: "Active", active: false },
    { label: "Beginner", active: false },
    { label: "End", active: false },
  ];

  const timelineEvents = [
    { date: "Start Date", detail: "May 15, 2024", status: "completed" },
    { date: "End Date", detail: "Jul 30, 2024", status: "active" },
  ];

  const participants = [
    { name: "Sarah", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Mike", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Emma", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "John", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Lisa", avatar: "/placeholder.svg?height=32&width=32" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-16 bg-gradient-to-b from-orange-200 to-yellow-200 flex flex-col items-center py-4 space-y-4">
          <button className="p-2 text-orange-600 hover:bg-orange-100 rounded">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <button
                key={i}
                className="p-2 text-orange-600 hover:bg-orange-100 rounded"
              >
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Challenges Grid */}
          <div className="flex-1 p-6">
            <div className="bg-gradient-to-r from-orange-200 to-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Manage Worker Page
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="relative">
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
                      placeholder="Search"
                      className="pl-10 bg-white border-0 w-64 rounded px-3 py-2"
                    />
                  </div>
                  <button className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded">
                    <svg
                      className="h-4 w-4"
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
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Cake Challenges
                    </h2>
                    <p className="text-gray-600">
                      Show off your skills and creativity in our cake design
                      challenges
                    </p>
                  </div>
                  <button className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded">
                    Create Challenge
                  </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filterButtons.map((filter, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded text-sm ${
                        filter.active
                          ? "bg-red-400 hover:bg-red-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Search and Sort */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
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
                      placeholder="Search challenges"
                      className="pl-10 w-64 border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50">
                      Deadline
                    </button>
                  </div>
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`${challenge.color} border-0 cursor-pointer hover:scale-105 transition-transform rounded-lg p-4`}
                      onClick={() => setSelectedChallenge(challenge.id)}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-16 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-8 h-10 bg-red-400 rounded-t-full"></div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-white text-center mb-2">
                        {challenge.title}
                      </h3>
                      <p className="text-white/80 text-sm text-center mb-4">
                        {challenge.description}
                      </p>
                      <div className="flex justify-center space-x-2">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                          Join
                        </button>
                        <button className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          View
                        </button>
                      </div>
                      <p className="text-white/60 text-xs text-center mt-2">
                        {challenge.participants} Participants
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Detail Panel */}
          <div className="w-96 bg-white p-6 border-l">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-400 rounded-full"></div>
                <span className="font-semibold">CakeDesigner</span>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-r from-teal-300 to-cyan-300 rounded-lg p-6 mb-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Wedding Cake Challenge
              </h2>
              <button className="bg-white/20 border border-white/30 text-white hover:bg-white/30 px-4 py-2 rounded">
                View Details
              </button>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        event.status === "completed"
                          ? "bg-red-400"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-sm">{event.date}</p>
                      <p className="text-gray-600 text-xs">{event.detail}</p>
                    </div>
                    {event.status === "active" && (
                      <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                        Time Remaining
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create a stunning three-tier wedding cake design. Your cake
                should incorporate elegant decorations, smooth fondant or
                buttercream finish, and beautiful wedding elements.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                The winning design will be featured on our homepage and the
                winner will receive a professional cake decorating course prize.
              </p>
            </div>

            {/* Rules and Participants */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Rules</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Design must be three-tier wedding theme</li>
                  <li>• Submit original photos only</li>
                  <li>• Follow community guidelines</li>
                  <li>• Deadline must be followed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Participants</h3>
                <div className="flex -space-x-2">
                  {participants.map((participant, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 border-2 border-white rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium"
                    >
                      {participant.name[0]}
                    </div>
                  ))}
                  <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                    +89
                  </div>
                </div>
              </div>
            </div>

            {/* Prizes */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Prizes</h3>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-4 w-4 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm font-medium">
                    Professional Course Prize
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white py-3 rounded">
              Join Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
