import React, { useState } from "react";
import { MessageSquare, Clock, Video, Search, Star } from "lucide-react";
import useAuth from "../hooks/useAuth";

const UserDash = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [chatView, setChatView] = useState(null);
  const { logout } = useAuth();

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.8,
      experience: "15 years",
      availability: "Available",
      image: "👩‍⚕️",
      status: "approved",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Pediatrician",
      rating: 4.9,
      experience: "12 years",
      availability: "Busy",
      image: "👨‍⚕️",
      status: "approved",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      specialty: "Dermatologist",
      rating: 4.7,
      experience: "10 years",
      availability: "Available",
      image: "👩‍⚕️",
      status: "approved",
    },
    {
      id: 4,
      name: "Dr. James Martinez",
      specialty: "Neurologist",
      rating: 4.9,
      experience: "18 years",
      availability: "Available",
      image: "👨‍⚕️",
      status: "pending",
    },
  ];

  const chats = [
    {
      id: 1,
      patient: "John Doe",
      lastMessage: "Thank you doctor",
      time: "10 min ago",
      unread: 2,
    },
    {
      id: 2,
      patient: "Jane Smith",
      lastMessage: "When should I take the medicine?",
      time: "1 hour ago",
      unread: 0,
    },
    {
      id: 3,
      patient: "Alice Brown",
      lastMessage: "I feel better now",
      time: "2 hours ago",
      unread: 1,
    },
  ];

  return (
    <div>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MediConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-blue-600">
                Profile
              </button>
              <button
                onClick={logout}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, Patient
            </h2>
            <p className="text-gray-600">Manage your healthcare journey</p>
          </div>

          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "browse"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Browse Doctors
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "help"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Seek Medical Help
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "chats"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              My Chats
            </button>
          </div>

          {activeTab === "browse" && (
            <div>
              <div className="mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialty..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors
                  .filter((d) => d.status === "approved")
                  .map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
                    >
                      <div className="flex items-center mb-4">
                        <div className="text-5xl mr-4">{doctor.image}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {doctor.name}
                          </h3>
                          <p className="text-blue-600 text-sm">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Star
                            className="text-yellow-400 mr-2"
                            size={16}
                            fill="currentColor"
                          />
                          <span>{doctor.rating} rating</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2" size={16} />
                          <span>{doctor.experience} experience</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              doctor.availability === "Available"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={
                              doctor.availability === "Available"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {doctor.availability}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                          <Video size={16} className="mr-2" />
                          Book
                        </button>
                        <button
                          onClick={() => setChatView(doctor)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                        >
                          <MessageSquare size={16} className="mr-2" />
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Describe Your Medical Concern
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Symptoms
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Describe your symptoms in detail..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Specialty
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>General Physician</option>
                    <option>Cardiologist</option>
                    <option>Dermatologist</option>
                    <option>Pediatrician</option>
                    <option>Neurologist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <div className="flex space-x-4">
                    <button className="flex-1 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50">
                      Low
                    </button>
                    <button className="flex-1 py-3 border-2 border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50">
                      Medium
                    </button>
                    <button className="flex-1 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50">
                      High
                    </button>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                  Find Available Doctor
                </button>
              </div>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Your Conversations
              </h3>
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                          👨‍⚕️
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Dr. {chat.patient}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          {chat.time}
                        </p>
                        {chat.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDash;
