import React, { useEffect, useState } from "react";
import {
  Shield,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import useAdmin from "../hooks/useAdmin";
import { useSelector } from "react-redux";

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState("doctors");
  const { logout } = useAuth();
  const { getAllUnverifiedDoctors } = useAdmin();
  const { unverifiedDoctors } = useSelector((store) => store.admin);

  useEffect(() => {
    getAllUnverifiedDoctors();
  }, []);

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

  return (
    <div>
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="text-purple-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={logout}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              System Administration
            </h2>
            <p className="text-gray-600">Manage doctors and users</p>
          </div>

          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "doctors"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600"
              }`}
            >
              Doctor Approvals
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "users"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600"
              }`}
            >
              User Management
            </button>
          </div>

          {activeTab === "doctors" && (
            <div className="space-y-6">
              {unverifiedDoctors.length !== 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Pending Approvals
                  </h3>
                  {unverifiedDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{"👩‍⚕️"}</div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              {doctor?.userId?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {doctor?.specialization[0]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {doctor.experienceYears} years of experience
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                            <CheckCircle size={16} className="mr-2" />
                            Approve
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
                            <XCircle size={16} className="mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Approved Doctors
                </h3>
                {doctors
                  .filter((d) => d.status === "approved")
                  .map((doctor) => (
                    <div
                      key={doctor.id}
                      className="border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{doctor.image}</div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              {doctor.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                          Suspend
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                User Management
              </h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">{user.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Mail size={14} className="mr-2" />
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {user.joinDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                        {user.status === "active" ? (
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
                            <UserX size={16} className="mr-2" />
                            Block
                          </button>
                        ) : (
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                            <UserCheck size={16} className="mr-2" />
                            Unblock
                          </button>
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

export default AdminDash;
