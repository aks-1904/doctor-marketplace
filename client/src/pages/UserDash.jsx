import { useState } from "react";
import { MessageSquare, Clock, Video, Search, Star } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import usePatient from "../hooks/usePatient";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserDash = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { logout } = useAuth();
  const { getDoctors, bookAppointment, getAllAppointments } = usePatient();
  const doctors = useSelector((store) => store?.patient?.doctors);
  const patientId = useSelector((store) => store?.auth?.profile?._id);
  const { appointments } = useSelector((store) => store?.patient);
  const navigate = useNavigate();

  const getDayName = (dateStr) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(dateStr).getDay()];
  };

  const generateSlots = (from, to) => {
    const slots = [];
    let [h, m] = from.split(":").map(Number);
    const [endH, endM] = to.split(":").map(Number);

    while (h < endH || (h === endH && m < endM)) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }
    return slots;
  };

  useEffect(() => {
    const initializeData = async () => {
      await getDoctors();
      await getAllAppointments();
    };
    initializeData();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusColor = (status) => {
    if (status === "confirmed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <>
      <div>
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50">
          <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">M</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  MediConnect
                </h1>
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
                onClick={() => setActiveTab("appointments")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "appointments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                My Appointments
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
                  {doctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
                    >
                      <div className="flex items-center mb-4">
                        <div className="text-5xl mr-4">👨‍⚕️</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {doctor?.userId?.name}
                          </h3>
                          <p className="text-blue-600 text-sm">
                            {doctor?.specialization?.map((sp) => sp + " ")}
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
                          <span>{doctor?.ratingAvg} rating</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2" size={16} />
                          <span>
                            {doctor?.experienceYears} years experience
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setBookingDoctor(doctor)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                          <Video size={16} className="mr-2" />
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div>
                {appointments.length === 0 ? (
                  <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                    No appointments found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div
                        key={appt._id}
                        className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center"
                      >
                        {/* Doctor Info */}
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            Dr. {appt.doctorId?.userId?.name ?? "Unknown"}
                          </h4>

                          <p className="text-sm text-blue-600">
                            {appt.doctorId?.specialization?.join(", ")}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(appt.slotDate)} • {appt.slotTime}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => {
                              navigate(`/room/${appt?.roomId}`);
                            }}
                            className="bg-blue-600 text-white h-auto px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                          >
                            <Video size={16} className="mr-2" />
                            Start Call
                          </button>
                          <div className="text-right space-y-2">
                            <div
                              className={`text-xs px-3 py-1 rounded-full inline-block ${statusColor(
                                appt.status
                              )}`}
                            >
                              {appt.status.toUpperCase()}
                            </div>

                            <p className="text-sm font-semibold text-gray-800">
                              ₹{appt.amount}
                            </p>

                            <p
                              className={`text-xs ${
                                appt.payment ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {appt.payment ? "Paid" : "Payment Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {bookingDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Book Appointment with {bookingDoctor.userId.name}
            </h3>

            {/* Date Picker */}
            <label className="block text-sm font-semibold mb-2">
              Select Date
            </label>
            <input
              type="date"
              className="w-full border p-2 rounded mb-4"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
              }}
            />

            {/* Time Slots */}
            {selectedDate &&
              (() => {
                const day = getDayName(selectedDate);
                const availability = bookingDoctor.availability.find(
                  (a) => a.day === day
                );

                if (!availability) {
                  return (
                    <p className="text-red-500 text-sm">
                      Doctor not available on {day}
                    </p>
                  );
                }

                const slots = generateSlots(availability.from, availability.to);

                return (
                  <>
                    <label className="block text-sm font-semibold mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`border rounded p-2 text-sm ${
                            selectedTime === time
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setBookingDoctor(null);
                  setSelectedDate("");
                  setSelectedTime("");
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                disabled={!selectedDate || !selectedTime}
                onClick={async () => {
                  const res = await bookAppointment({
                    doctorId: bookingDoctor?._id,
                    slotDate: selectedDate,
                    slotTime: selectedTime,
                    patientId,
                  });

                  if (res) {
                    setSelectedDate("");
                    setSelectedTime("");
                    setBookingDoctor(null);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDash;
