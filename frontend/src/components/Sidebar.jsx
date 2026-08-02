import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-5">

      <h2 className="text-2xl font-bold mb-8">
        Menu
      </h2>

      <nav className="flex flex-col gap-4">

        <NavLink
            to="/dashboard"
            className={({ isActive }) =>
                isActive
                    ? "bg-blue-600 px-3 py-2 rounded"
                    : "px-3 py-2 hover:bg-gray-700 rounded"
            }
        >
            Dashboard
        </NavLink>

        <NavLink to="/rooms">
          Rooms
        </NavLink>

        <NavLink to="/guests">
          Guests
        </NavLink>

        <NavLink to="/bookings">
          Bookings
        </NavLink>

        <NavLink to="/restaurant">
          Restaurant
        </NavLink>

        <NavLink to="/bills">
          Bills
        </NavLink>

        <NavLink to="/reports">
          Reports
        </NavLink>

      </nav>

    </div>
  );
}

export default Sidebar;