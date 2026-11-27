
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="bg-[#172B36] text-white px-5 md:px-8 py-4 shadow-lg flex justify-between items-center min-h-[76px]">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C5A46D] flex items-center justify-center text-[#172B36] font-bold text-xl">
          H
        </div>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            HotelHub
          </h1>
          <p className="text-[10px] tracking-[3px] text-[#C5A46D] uppercase">
            Hospitality Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold">Welcome, Admin</p>
          <p className="text-xs text-gray-400">Management Portal</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#C5A46D] text-[#172B36] flex items-center justify-center font-bold">
          A
        </div>

        <button
          onClick={handleLogout}
          className="border border-[#C5A46D] text-[#E7D4AE] px-3 md:px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#C5A46D] hover:text-[#172B36] transition"
        >
          Logout
        </button>
      </div>

    </nav>
  );
}

export default Navbar;
