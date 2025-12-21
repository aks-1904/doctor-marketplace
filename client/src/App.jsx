import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import UserDash from "./pages/UserDash";

const App = () => {
  
  return (
    
    <BrowserRouter>
      <Routes>
        
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
         <Route path="/patient" element={<UserDash />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
