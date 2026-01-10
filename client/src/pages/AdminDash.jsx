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
  const {
    getAllUnverifiedDoctors,
    updateVerificationStatus,
    getAllApprovedDoctors,
    getAllUsers,
    blockAndUnblockUser,
  } = useAdmin();
  const { unverifiedDoctors, approvedDoctors, allUsers } = useSelector(
    (store) => store.admin
  );

  const doctors = approvedDoctors;

  useEffect(() => {
    getAllUnverifiedDoctors();
    getAllApprovedDoctors();
    getAllUsers();
  }, []);

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
                          <div className="text-4xl">
                            {doctor?.gender === "female" ? "👩‍⚕️" : "👨‍⚕️"}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              {doctor?.userId?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {doctor?.specialization.map((sp) => sp + " ")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {doctor.experienceYears} years of experience
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              updateVerificationStatus({
                                doctorId: doctor?.userId?._id,
                                updatedVerificationStatus: "approved",
                              });
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              updateVerificationStatus({
                                doctorId: doctor?.userId?._id,
                                updatedVerificationStatus: "rejected",
                                rejectedReason: "Achi nahi lagi",
                              });
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                          >
                            <XCircle size={16} className="mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {doctors && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Approved Doctors
                  </h3>
                  {doctors &&
                    doctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        className="border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">👨</div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">
                                {doctor.userId?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {doctor.specialization.map((sp) => sp + " ")}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              updateVerificationStatus({
                                doctorId: doctor?.userId?._id,
                                updatedVerificationStatus: "rejected",
                                rejectedReason: "Didn't like",
                              });
                            }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
                          >
                            Suspend
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <>
              {allUsers.length !== 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    User Management
                  </h3>
                  <div className="space-y-4">
                    {allUsers &&
                      allUsers.map((user) => (
                        <div
                          key={user._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {user.name}
                              </h4>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <Mail size={14} className="mr-2" />
                                {user.email}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Joined: {user.createdAt}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {!user.isBlocked ? (
                                <button
                                  onClick={() => {
                                    blockAndUnblockUser({
                                      status: "block",
                                      userId: user?._id,
                                    });
                                  }}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                                >
                                  <UserX size={16} className="mr-2" />
                                  Block
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    blockAndUnblockUser({
                                      status: "unblock",
                                      userId: user?._id,
                                    });
                                  }}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                                >
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
              {allUsers.length === 0 && <h1>No users</h1>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
