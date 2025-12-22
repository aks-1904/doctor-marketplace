import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import Lobby from "./screens/Lobby";

const App = () => {
  
  return (
    
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
       <Route path="/lobby" element={<Lobby />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
