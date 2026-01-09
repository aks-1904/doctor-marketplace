import React, { useState } from "react";
import { Calendar, MessageSquare, Users, Clock, Video } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useSelector } from "react-redux";

const DoctorDash = () => {
  const [activeTab, setActiveTab] = useState("meetings");
  const { logout } = useAuth();

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@email.com",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@email.com",
      status: "active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@email.com",
      status: "blocked",
      joinDate: "2024-03-10",
    },
  ];

  const meetings = [
    {
      id: 1,
      patient: "John Doe",
      date: "2024-12-22",
      time: "10:00 AM",
      type: "Video Call",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Jane Smith",
      date: "2024-12-22",
      time: "02:30 PM",
      type: "Video Call",
      status: "Scheduled",
    },
    {
      id: 3,
      patient: "Alice Brown",
      date: "2024-12-23",
      time: "11:00 AM",
      type: "In-Person",
      status: "Scheduled",
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

  const { user } = useSelector((store) => store?.auth);

  return (
    <div>
      <div className="min-h-screen bg-linear-0-to-br from-green-50 to-teal-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-2xl">
                👨‍⚕️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. Dashboard
                </h1>
                <p className="text-sm text-gray-600">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, Doctor
            </h2>
            <p className="text-gray-600">
              Manage your appointments and patient communications
            </p>
          </div>

          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("meetings")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "meetings"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600"
              }`}
            >
              Meetings
            </button>
            <button
              onClick={() => setActiveTab("appointment-request")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "appointment-request"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600"
              }`}
            >
              Appointment Requests
            </button>
          </div>

          {activeTab === "meetings" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Upcoming Meetings
              </h3>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="border-l-4 border-green-600 bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">👤</div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {meeting.patient}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {meeting.date}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock size={14} className="mr-1" />
                              {meeting.time}
                            </p>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {meeting.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                          <Video size={16} className="mr-2" />
                          Start Call
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appointment-request" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Requests
              </h3>
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {chat.patient}
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
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
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

export default DoctorDash;
