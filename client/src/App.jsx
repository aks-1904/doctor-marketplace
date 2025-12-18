import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Auth from "./pages/auth/Auth";

const App = () => {
  
  return (
    
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/Auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
