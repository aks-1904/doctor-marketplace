import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import Lobby from "./screens/Lobby";
import { SocketProvider } from "./context/SocketProvider";
import Room from "./screens/Room";
import UserDash from "./pages/UserDash";
import AdminDash from "./pages/AdminDash";
import DoctorDash from "./pages/DoctorDash";

const App = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/patient" element={<UserDash />} />
          <Route path="/admin" element={<AdminDash />} />
          <Route path="/doctor" element={<DoctorDash />} />
       </Routes>
      </SocketProvider>
   </BrowserRouter>
  );
};

export default App;
