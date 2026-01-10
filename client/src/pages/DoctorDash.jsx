import { useEffect, useState } from "react";
import { Calendar, Clock, Video } from "lucide-react";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import useDoctor from "../hooks/useDoctor";

const DoctorDash = () => {
  const { logout } = useAuth();
  const { getAllAppointments, updateAppointmentStatus } = useDoctor();

  const { appointments } = useSelector((store) => store?.doctor);
  const { user } = useSelector((store) => store?.auth);

  const [activeTab, setActiveTab] = useState("meetings");

  useEffect(() => {
    getAllAppointments();
  }, []);

  /* ---------------- helpers ---------------- */

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const updateStatus = async (id, status) => {
    await updateAppointmentStatus(id, status);
  };

  /* ---------------- appointment buckets ---------------- */

  const confirmedAppointments = appointments?.filter(
    (a) => a.status === "confirmed"
  );

  const pendingAppointments = appointments?.filter(
    (a) => a.status === "pending"
  );

  const historyAppointments = appointments?.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-linear-0-to-br from-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Doctor Dashboard
            </h1>
            <p className="text-sm text-gray-600">{user?.name}</p>
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
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          {["meetings", "requests", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize ${
                activeTab === tab
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ---------------- MEETINGS (CONFIRMED) ---------------- */}
        {activeTab === "meetings" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">
              Upcoming Confirmed Appointments
            </h3>

            {confirmedAppointments.length === 0 && (
              <p className="text-gray-500">No confirmed appointments</p>
            )}

            <div className="space-y-4">
              {confirmedAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="border-l-4 border-green-600 bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    {/* Patient Info */}
                    <div>
                      <h4 className="font-bold text-lg">
                        Patient • Age {appt.patientId?.age}
                      </h4>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(appt.slotDate)}
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {appt.slotTime}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <Video size={16} className="mr-2" />
                        Start Call
                      </button>

                      <button
                        onClick={() => updateStatus(appt._id, "completed")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- REQUESTS (PENDING) ---------------- */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">Appointment Requests</h3>

            {pendingAppointments.length === 0 && (
              <p className="text-gray-500">No pending requests</p>
            )}

            <div className="space-y-4">
              {pendingAppointments.map((appt) => (
                <div key={appt._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">
                        Patient • Age {appt.patientId?.age}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(appt.slotDate)} • {appt.slotTime}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(appt._id, "confirmed")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() => updateStatus(appt._id, "cancelled")}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- HISTORY ---------------- */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">Appointment History</h3>

            {historyAppointments.length === 0 && (
              <p className="text-gray-500">No past appointments</p>
            )}

            <div className="space-y-3">
              {historyAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <div>
                    <p className="font-medium">
                      Patient • Age {appt.patientId?.age}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(appt.slotDate)} • {appt.slotTime}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      appt.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {appt.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDash;
