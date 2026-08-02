import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Bookings from "./pages/Bookings";
import Restaurant from "./pages/Restaurant";
import Bills from "./pages/Bills";
import Reports from "./pages/Reports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/guests" element={<Guests />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/restaurant" element={<Restaurant />} />
      <Route path="/bills" element={<Bills />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;