import { Calendar, Clock, MapPin, Users, Star } from "lucide-react";

const Events = () => {
  const events = [
    {
      id: 1,
      title: "Virtual Cake Decorating Workshop",
      date: "January 15, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Online",
      attendees: 45,
      maxAttendees: 50,
      price: "Free",
      image: "/placeholder.svg?height=200&width=300",
      host: "Master Baker Sarah",
      rating: 4.9,
    },
    {
      id: 2,
      title: "Chocolate Cake Masterclass",
      date: "January 20, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "Sweet Dreams Bakery, NYC",
      attendees: 12,
      maxAttendees: 15,
      price: "$75",
      image: "/placeholder.svg?height=200&width=300",
      host: "Chef Michael",
      rating: 5.0,
    },
    {
      id: 3,
      title: "Wedding Cake Design Competition",
      date: "January 25, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "Convention Center, LA",
      attendees: 89,
      maxAttendees: 100,
      price: "$25",
      image: "/placeholder.svg?height=200&width=300",
      host: "Cake Artists Guild",
      rating: 4.8,
    },
    {
      id: 4,
      title: "Fondant Sculpting Basics",
      date: "February 1, 2024",
      time: "1:00 PM - 5:00 PM",
      location: "Online",
      attendees: 23,
      maxAttendees: 30,
      price: "$45",
      image: "/placeholder.svg?height=200&width=300",
      host: "Artisan Cakes Studio",
      rating: 4.7,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-600 mb-2">
          Upcoming Events
        </h1>
        <p className="text-gray-600">
          Join workshops, competitions, and masterclasses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {event.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.price === "Free"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.price}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.attendees}/{event.maxAttendees} attendees
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hosted by</span>
                  <span className="text-sm font-medium text-gray-800">
                    {event.host}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {event.rating}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                  Join Event
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
