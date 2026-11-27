
import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#C5A46D] text-[#172B36] font-bold shadow-md"
        : "text-gray-300 hover:bg-[#304651] hover:text-white"
    }`;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "▦" },
    { to: "/rooms", label: "Rooms", icon: "▤" },
    { to: "/guests", label: "Guests", icon: "♙" },
    { to: "/bookings", label: "Bookings", icon: "▣" },
    { to: "/housekeeping", label: "Housekeeping", icon: "✧" },
    { to: "/restaurant", label: "Restaurant Menu", icon: "♨" },
    { to: "/restaurant-orders", label: "Restaurant Orders", icon: "☷" },
    { to: "/bills", label: "Bills & Payments", icon: "₹" },
    { to: "/reports", label: "Reports", icon: "▥" },
  ];

  return (
    <aside className="admin-sidebar w-64 bg-[#203641] text-white min-h-screen p-5 shrink-0">

      <div className="mb-8 px-2">
        <p className="text-[#C5A46D] text-xs font-bold tracking-[2px] uppercase">
          Main Menu
        </p>
        <h2 className="text-gray-400 text-sm mt-2">
          Hotel Operations
        </h2>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={linkStyle}
          >
            <span className="w-6 text-center text-lg">
              {link.icon}
            </span>

            <span className="text-sm">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-12 border-t border-gray-600 pt-5 px-2">
        <p className="text-xs text-gray-400">
          HOTELHUB MANAGEMENT
        </p>
        <p className="text-xs text-[#C5A46D] mt-2">
          © 2026 HotelHub. All rights reserved.
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;
