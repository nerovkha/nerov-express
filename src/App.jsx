import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import "./App.css";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customer" element={<CustomerDashboard />} />
     <Route path="/driver" element={<DriverDashboard />}
/>
    </Routes>
  );
}

export default App;