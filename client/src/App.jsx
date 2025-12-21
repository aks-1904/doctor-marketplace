import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import UserDash from "./pages/UserDash";
import AdminDash from "./pages/AdminDash";

const App = () => {
  
  return (
    
    <BrowserRouter>
      <Routes>
        
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
         <Route path="/patient" element={<UserDash />} />
         <Route path="/admin" element={<AdminDash />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
