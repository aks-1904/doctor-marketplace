import React,{useState} from "react";
import { Stethoscope, Shield, Calendar, CheckCircle } from "lucide-react";

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState("home");
  return (
    <div>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MediLink
              </span>
            </div>
          {/*   <button
              onClick={() => setCurrentPage("auth")}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Login / Register
            </button> */}
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Your Health, Your Choice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with verified healthcare professionals for personalized
              treatment
            </p>
          </div>

          {/* Treatment Type Selection */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
              Choose Your Treatment Path
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ayurvedic Card */}
              <button className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-linear-to-br from-green-400 to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-12 text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-12 h-12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Ayurvedic</h3>
                  <p className="text-white/90 text-lg">
                    Natural healing through ancient Indian medicine and holistic
                    wellness
                  </p>
                </div>
              </button>

              {/* Allopathic Card */}
              <button className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-12 text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Stethoscope className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Allopathic</h3>
                  <p className="text-white/90 text-lg">
                    Modern evidence-based medicine for immediate healthcare
                    needs
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Verified Doctors",
                desc: "All practitioners are licensed and verified",
              },
              {
                icon: Calendar,
                title: "Easy Scheduling",
                desc: "Book appointments at your convenience",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your health data is protected",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
     );
    </div>
  );
};

export default HomePage;
