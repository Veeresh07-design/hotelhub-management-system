
import { Routes, Route } from "react-router-dom";

// Customer pages
import CustomerHome from "./pages/CustomerHome";
import CustomerRooms from "./pages/CustomerRooms";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerBooking from "./pages/CustomerBooking";

// Admin pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Bookings from "./pages/Bookings";
import Restaurant from "./pages/Restaurant";
import Bills from "./pages/Bills";
import Reports from "./pages/Reports";
import Housekeeping from "./pages/Housekeeping";

import ProtectedRoute from "./ProtectedRoute";
import RestaurantOrders from "./pages/RestaurantOrders";

function App() {
  return (
    <Routes>
      {/* Customer portal */}
      <Route path="/" element={<CustomerHome />} />
      <Route path="/customer/rooms" element={<CustomerRooms />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />
      <Route path="/customer/booking" element={<CustomerBooking />} />

      {/* Admin login */}
      <Route path="/login" element={<Login />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/housekeeping" element={<Housekeeping />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/restaurant-orders" element={<RestaurantOrders />} />
      </Route>
    </Routes>
  );
}

export default App;
