import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import UserDash from "./pages/UserDash";
import AdminDash from "./pages/AdminDash";
import DoctorDash from "./pages/DoctorDash";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/patient" element={<UserDash />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path="/doctor" element={<DoctorDash />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
