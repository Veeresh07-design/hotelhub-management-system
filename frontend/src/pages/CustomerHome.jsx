
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerHome() {
  const navigate = useNavigate();

  // Customer login state
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token") &&
    localStorage.getItem("user_role") === "customer"
  );

  const username = localStorage.getItem("username") || "Customer";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");

    setIsLoggedIn(false);
    navigate("/");
  };

  // Booking search
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const handleSearch = (e) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out must be after check-in.");
      return;
    }

    navigate(
      `/customer/rooms?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
    );
  };

  const inputStyle =
    "w-full border border-[#DED9CE] bg-[#FCFBF8] rounded-lg p-3.5 text-[#172B36] outline-none focus:border-[#C5A46D] focus:ring-2 focus:ring-[#C5A46D]/20 transition";

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#172B36]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#EAE7DF] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">

          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#C5A46D] rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-[#172B36]">H</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#172B36]">
                HotelHub
              </h1>
              <p className="text-[10px] tracking-[3px] uppercase text-[#A18453]">
                Hospitality Management
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#34434D]">
            <a href="#home" className="hover:text-[#A18453] transition">Home</a>
            <a href="#rooms" className="hover:text-[#A18453] transition">Rooms</a>
            <a href="#about" className="hover:text-[#A18453] transition">About Us</a>
            <a href="#contact" className="hover:text-[#A18453] transition">Contact</a>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/customer/profile")}
                  className="hidden sm:block px-4 py-2 border border-[#C5A46D] text-[#172B36] rounded-lg font-medium hover:bg-[#F2EBDD] transition"
                >
                  My Profile
                </button>

                <span className="hidden xl:inline text-sm font-medium text-[#34434D]">
                  Hi, {username}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#203641] text-white rounded-lg font-medium hover:bg-[#172B36] transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/customer/login"
                  className="px-4 py-2 border border-[#C5A46D] text-[#172B36] rounded-lg font-medium hover:bg-[#F2EBDD] transition"
                >
                  Login
                </Link>

                <Link
                  to="/customer/register"
                  className="px-4 py-2 bg-[#C5A46D] text-[#172B36] rounded-lg font-semibold hover:bg-[#D4B781] transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative min-h-[560px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,43,54,0.68), rgba(23,43,54,0.72)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85')"
        }}
      >
        <div className="text-center text-white px-5 max-w-4xl">

          <p className="uppercase tracking-[5px] text-sm text-[#D4B781] mb-5">
            Welcome to HotelHub
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Experience Comfort,
            <br />
            Luxury & Hospitality
          </h1>

          <p className="text-base md:text-lg text-gray-200 mb-9 max-w-2xl mx-auto leading-8">
            Find your perfect stay and enjoy a memorable hotel experience
            with comfort, convenience and warm hospitality.
          </p>

          <a
            href="#booking"
            className="inline-block bg-[#C5A46D] hover:bg-[#D4B781] text-[#172B36] px-9 py-3.5 rounded-lg font-semibold transition shadow-lg"
          >
            Book Your Stay
          </a>

        </div>
      </section>

      {/* BOOKING SEARCH */}
      <section id="booking" className="relative px-5 -mt-14 z-10">

        <div className="max-w-6xl mx-auto bg-white border border-[#EAE7DF] rounded-2xl shadow-xl p-6 md:p-9">

          <div className="mb-7">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#A18453]">
              Plan Your Visit
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-[#172B36] mt-2">
              Find Your Perfect Room
            </h2>

            <p className="text-gray-500 mt-2">
              Select your dates and number of guests to explore available rooms.
            </p>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <div>
                <label className="block text-sm font-semibold text-[#34434D] mb-2">
                  Check-in
                </label>

                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34434D] mb-2">
                  Check-out
                </label>

                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#34434D] mb-2">
                  Guests
                </label>

                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={inputStyle}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#C5A46D] text-[#172B36] p-3.5 rounded-lg font-semibold hover:bg-[#D4B781] transition"
                >
                  Search Rooms
                </button>
              </div>

            </div>
          </form>
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section id="rooms" className="px-6 md:px-16 py-20">

        <div className="text-center mb-12">
          <p className="text-[#A18453] font-semibold uppercase tracking-widest text-sm">
            Our Accommodation
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-[#172B36]">
            Explore Our Rooms
          </h2>

          <p className="text-gray-500 mt-3">
            Choose the perfect room for your comfortable stay.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* STANDARD ROOM */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#EAE7DF] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80"
              alt="Standard hotel room"
              className="w-full h-60 object-cover"
            />

            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                Comfortable Stay
              </p>

              <h3 className="text-xl font-bold text-[#172B36] mt-2">
                Standard Room
              </h3>

              <p className="text-gray-500 mt-2 leading-6">
                A comfortable room for a relaxing and pleasant stay.
              </p>

              <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#EEEAE2]">
                <span className="text-[#A18453] font-bold text-xl">
                  ₹1,000
                  <small className="text-gray-500 text-sm font-normal"> / night</small>
                </span>

                <span className="text-xs bg-[#F2EBDD] text-[#80643B] px-3 py-1.5 rounded-full font-semibold">
                  Standard
                </span>
              </div>
            </div>
          </div>

          {/* DELUXE ROOM */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#EAE7DF] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80"
              alt="Deluxe hotel room"
              className="w-full h-60 object-cover"
            />

            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                Extra Comfort
              </p>

              <h3 className="text-xl font-bold text-[#172B36] mt-2">
                Deluxe Room
              </h3>

              <p className="text-gray-500 mt-2 leading-6">
                Enjoy additional comfort and elegant interiors during your stay.
              </p>

              <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#EEEAE2]">
                <span className="text-[#A18453] font-bold text-xl">
                  ₹2,000
                  <small className="text-gray-500 text-sm font-normal"> / night</small>
                </span>

                <span className="text-xs bg-[#F2EBDD] text-[#80643B] px-3 py-1.5 rounded-full font-semibold">
                  Deluxe
                </span>
              </div>
            </div>
          </div>

          {/* PREMIUM ROOM */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#EAE7DF] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80"
              alt="Premium hotel room"
              className="w-full h-60 object-cover"
            />

            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                Premium Experience
              </p>

              <h3 className="text-xl font-bold text-[#172B36] mt-2">
                Premium Room
              </h3>

              <p className="text-gray-500 mt-2 leading-6">
                A spacious stay designed for a premium and relaxing experience.
              </p>

              <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#EEEAE2]">
                <span className="text-[#A18453] font-bold text-xl">
                  ₹3,000
                  <small className="text-gray-500 text-sm font-normal"> / night</small>
                </span>

                <span className="text-xs bg-[#F2EBDD] text-[#80643B] px-3 py-1.5 rounded-full font-semibold">
                  Premium
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white border-y border-[#EAE7DF] px-6 md:px-16 py-20">

        <div className="max-w-4xl mx-auto text-center">

          <p className="text-[#A18453] font-semibold uppercase tracking-widest text-sm mb-3">
            About Us
          </p>

          <h2 className="text-3xl font-bold mb-5 text-[#172B36]">
            Welcome to HotelHub
          </h2>

          <p className="text-gray-600 leading-8">
            HotelHub is designed to make hotel reservations and hospitality
            management simple and convenient. Discover comfortable rooms,
            enjoy restaurant services and experience a smooth booking journey
            through one integrated platform.
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[#172B36] text-white px-6 md:px-16 py-12">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C5A46D] rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-[#172B36]">H</span>
              </div>

              <h2 className="text-2xl font-bold text-white">
                HotelHub
              </h2>
            </div>

            <p className="text-gray-300 mt-4 leading-7">
              Your comfort is our priority. Experience hospitality with
              comfort and convenience.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-[#D4B781]">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-gray-300">
              <a href="#home" className="hover:text-[#D4B781] transition">Home</a>
              <a href="#rooms" className="hover:text-[#D4B781] transition">Rooms</a>
              <a href="#about" className="hover:text-[#D4B781] transition">About Us</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-[#D4B781]">
              Contact
            </h3>

            <p className="text-gray-300 leading-7">
              Contact our hotel reception for assistance.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/15 mt-10 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} HotelHub. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default CustomerHome;
