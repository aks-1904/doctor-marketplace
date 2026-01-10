import React, { useState } from "react";
import {
  User,
  Stethoscope,
  Shield,
  Calendar,
  Clock,
  Phone,
  Mail,
  Lock,
  FileText,
  Award,
  Languages,
  DollarSign,
  Loader2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState("patient"); // patient or doctor
  const [licenseFile, setLicenseFile] = useState(null);
  const { register, login, error, loading } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    gender: "",
    type: [],
    specialization: [],
    qualifications: [],
    experienceYears: "",
    consultationFee: "",
    currency: "INR",
    licenseNumber: "",
    languages: [],
    availabilityDays: [],
    timeSlots: [{ from: "", to: "" }],
  });

  const type = ["Ayurveda", "Allopathy"];
  const specializations = [
    "Cardiology",
    "Oncology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Gynecology",
    "Gastroentrology",
    "Endocrinology",
    "Hematology",
    "Opthalomology",
    "ENT",
    "Urology",
    "Radiology",
    "Pathology",
  ];
  const languageOptions = [
    "Hindi",
    "English",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
    "Gujarati",
  ];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { from: "", to: "" }],
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const handleSubmit = () => {
    // ================= LOGIN =================
    if (isLogin) {
      const loginPayload = {
        email: formData.email,
        password: formData.password,
      };

      // you will implement this hook later
      login(loginPayload);
      return;
    }

    // ================= REGISTER =================
    const fd = new FormData();

    // common
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("phone", formData.phone);
    fd.append("password", formData.password);
    fd.append("role", accountType);

    // patient
    if (accountType === "patient") {
      fd.append("age", formData.age);
      fd.append("gender", formData.gender);
    }

    // doctor
    if (accountType === "doctor") {
      fd.append("experienceYears", formData.experienceYears);
      fd.append("consultationFee", formData.consultationFee);
      fd.append("licenseNumber", formData.licenseNumber);
      fd.append("gender", formData.gender);

      // arrays — append individually
      formData.specialization.forEach((item) =>
        fd.append("specialization[]", item)
      );

      formData.qualifications.forEach((item) =>
        fd.append("qualifications[]", item)
      );

      formData.languages.forEach((item) => fd.append("languages[]", item));

      formData.type.forEach(
        (item) => fd.append("type[]", item) // allopathic / ayurvedic
      );

      // Availability
      if (
        formData.availabilityDays.length === 0 ||
        formData.timeSlots.length === 0
      ) {
        alert("Please select availability days and time slots");
        return;
      }

      let availabilityIdx = 0;
      formData.availabilityDays.forEach((day) => {
        formData.timeSlots.forEach((slot) => {
          if (!slot.from || !slot.to) return;
          if (slot.from >= slot.to) {
            alert("Invalid time slot");
            return;
          }

          fd.append(`availability[${availabilityIdx}][day]`, day);
          fd.append(`availability[${availabilityIdx}][from]`, slot.from);
          fd.append(`availability[${availabilityIdx}][to]`, slot.to);

          availabilityIdx++;
        });
      });

      if (!licenseFile) {
        alert("Medical license PDF is required");
        return;
      }

      fd.append("licenseDocument", licenseFile);
    }

    register(fd);
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-brfrom-blue-50 via-white to-green-50 py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 ml-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to MediLink
              </h2>
              <p className="text-gray-600">
                {isLogin ? "Login to your account" : "Create your account"}
              </p>
            </div>

            {/* Login/Register Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-full transition-all font-medium ${
                  isLogin ? "bg-white shadow-md text-blue-600" : "text-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-full transition-all font-medium ${
                  !isLogin
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Register
              </button>
            </div>

            {/* Account Type Selection (Only for Register) */}
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am registering as
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAccountType("patient")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      accountType === "patient"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white/50 hover:border-gray-300"
                    }`}
                  >
                    <User
                      className={`w-8 h-8 mx-auto mb-2 ${
                        accountType === "patient"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`font-semibold ${
                        accountType === "patient"
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      Patient
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Seek medical care
                    </div>
                  </button>

                  <button
                    onClick={() => setAccountType("doctor")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      accountType === "doctor"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white/50 hover:border-gray-300"
                    }`}
                  >
                    <Stethoscope
                      className={`w-8 h-8 mx-auto mb-2 ${
                        accountType === "doctor"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`font-semibold ${
                        accountType === "doctor"
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      Doctor
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Provide healthcare
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* LOGIN FORM - Same for all users */}
              {isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </>
              )}

              {/* REGISTER FORM - Changes based on account type */}
              {!isLogin && (
                <>
                  {/* Common Fields for Both */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Patient-specific fields */}
                  {accountType === "patient" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="Your age"
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Doctor-specific fields */}
                  {accountType === "doctor" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Stethoscope className="w-4 h-4 inline mr-2" />
                          Specialization
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {specializations.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() =>
                                toggleSelection("specialization", spec)
                              }
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                formData.specialization.includes(spec)
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white/50 text-gray-700 hover:bg-white border border-gray-200"
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {type.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSelection("type", spec)}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                formData.type.includes(spec)
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white/50 text-gray-700 hover:bg-white border border-gray-200"
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Award className="w-4 h-4 inline mr-2" />
                          Qualifications
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., MBBS, MD, MS (comma separated)"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              qualifications: e.target.value
                                .split(",")
                                .map((q) => q.trim())
                                .filter((q) => q),
                            }))
                          }
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleInputChange}
                            placeholder="Years"
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-2" />
                            Consultation Fee (₹)
                          </label>
                          <input
                            type="number"
                            name="consultationFee"
                            value={formData.consultationFee}
                            onChange={handleInputChange}
                            placeholder="Amount"
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="w-4 h-4 inline mr-2" />
                          Medical License Number
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your license number"
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="w-4 h-4 inline mr-2" />
                          Upload Medical License (PDF only)
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            if (file.type !== "application/pdf") {
                              alert("Only PDF files are allowed");
                              e.target.value = "";
                              return;
                            }

                            setLicenseFile(file);
                          }}
                          className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Languages className="w-4 h-4 inline mr-2" />
                          Languages Spoken
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {languageOptions.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleSelection("languages", lang)}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                formData.languages.includes(lang)
                                  ? "bg-green-500 text-white shadow-md"
                                  : "bg-white/50 text-gray-700 hover:bg-white border border-gray-200"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Available Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() =>
                                toggleSelection("availabilityDays", day)
                              }
                              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                formData.availabilityDays.includes(day)
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white/50 text-gray-700 hover:bg-white border border-gray-200"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Consultation Time Slots
                        </label>
                        {formData.timeSlots.map((slot, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input
                              type="time"
                              value={slot.from}
                              onChange={(e) =>
                                updateTimeSlot(idx, "from", e.target.value)
                              }
                              className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="self-center text-gray-500 font-medium">
                              to
                            </span>
                            <input
                              type="time"
                              value={slot.to}
                              onChange={(e) =>
                                updateTimeSlot(idx, "to", e.target.value)
                              }
                              className="flex-1 px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTimeSlot}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Another Time Slot
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Please Wait...
                  </span>
                ) : isLogin ? (
                  "Login to Account"
                ) : (
                  `Register as ${
                    accountType === "doctor" ? "Doctor" : "Patient"
                  }`
                )}
              </button>

              {isLogin && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register here
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login here
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
