import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";
import Lobby from "./screens/Lobby";
import { SocketProvider } from "./context/SocketProvider";

const App = () => {
  
  return (
    
    <BrowserRouter>
    <SocketProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
       <Route path="/lobby" element={<Lobby />} />

      </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
