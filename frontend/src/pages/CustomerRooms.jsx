
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerRooms() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const guests = searchParams.get("guests") || "1";

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        if (!checkIn || !checkOut || checkOut <= checkIn) {
          setError("Please select valid check-in and check-out dates.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        const response = await api.get("/rooms/available", {
          params: {
            check_in: checkIn,
            check_out: checkOut,
            guests: Number(guests),
          },
        });

        setRooms(response.data);
      } catch (err) {
        console.error("Room search error:", err);
        setError(
          err.response?.data?.detail ||
          "Unable to load available rooms. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailableRooms();
  }, [checkIn, checkOut, guests]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const handleBookNow = (room) => {
    const query = new URLSearchParams({
      room_id: String(room.id),
      check_in: checkIn,
      check_out: checkOut,
      guests: String(guests),
    });

    navigate(`/customer/booking?${query.toString()}`);
  };

  const formatDate = (date) => {
    if (!date) return "Not selected";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRoomDescription = (type) => {
    const descriptions = {
      standard: "A comfortable and welcoming space for a relaxing stay.",
      deluxe: "Enjoy extra comfort with elegant interiors and spacious design.",
      premium: "Experience a premium stay with additional space and comfort.",
    };

    return (
      descriptions[String(type).toLowerCase()] ||
      "Enjoy a comfortable and pleasant hotel stay."
    );
  };

  const getRoomImage = (type) => {
    const images = {
      standard:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85",
      deluxe:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
      premium:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
    };

    return (
      images[String(type).toLowerCase()] ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85"
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#172B36]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#EAE7DF] shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex justify-between items-center">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
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
          </button>

          <button
            onClick={() => navigate("/")}
            className="border border-[#C5A46D] text-[#172B36] px-4 py-2 rounded-lg font-medium hover:bg-[#F2EBDD] transition"
          >
            ← Back to Home
          </button>

        </div>
      </header>

      {/* SEARCH SUMMARY */}
      <section className="bg-[#172B36] text-white px-6 md:px-16 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">

          <p className="text-xs uppercase tracking-[3px] text-[#D4B781] font-semibold mb-3">
            Your Stay
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            Available Rooms
          </h1>

          <p className="text-gray-300 mt-2">
            Choose the perfect room for your stay at HotelHub.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-300 mb-2">Check-in</p>
              <p className="font-semibold text-[#D4B781]">
                {formatDate(checkIn)}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-300 mb-2">Check-out</p>
              <p className="font-semibold text-[#D4B781]">
                {formatDate(checkOut)}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-300 mb-2">Guests</p>
              <p className="font-semibold text-[#D4B781]">
                {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-300 mb-2">Duration</p>
              <p className="font-semibold text-[#D4B781]">
                {calculateNights()} Nights
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ROOM RESULTS */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-12">

        {loading && (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EAE7DF] border-t-[#C5A46D] rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-lg font-semibold text-[#172B36]">
              Searching available rooms...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please wait while we find the best options for you.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Unable to Load Rooms
            </h2>

            <p className="text-gray-600 mt-3">
              {error}
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-[#C5A46D] text-[#172B36] px-6 py-3 rounded-lg font-semibold hover:bg-[#D4B781] transition"
            >
              Change Dates
            </button>
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] shadow-sm p-10 md:p-16 text-center">

            <div className="w-20 h-20 rounded-full bg-[#F2EBDD] flex items-center justify-center mx-auto text-4xl">
              🏨
            </div>

            <h2 className="text-2xl font-bold text-[#172B36] mt-6">
              No Rooms Available
            </h2>

            <p className="text-gray-500 mt-3 max-w-lg mx-auto leading-7">
              Sorry, no rooms are available for your selected dates.
              Please try different dates to explore other options.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-7 bg-[#C5A46D] text-[#172B36] px-7 py-3 rounded-lg font-semibold hover:bg-[#D4B781] transition"
            >
              Change Dates
            </button>

          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">

              <div>
                <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                  Room Collection
                </p>

                <h2 className="text-2xl md:text-3xl font-bold text-[#172B36] mt-2">
                  {rooms.length} Room(s) Available
                </h2>

                <p className="text-gray-500 mt-2">
                  Select a room to continue with your reservation.
                </p>
              </div>

              <span className="text-sm bg-[#F2EBDD] text-[#80643B] px-4 py-2 rounded-full font-semibold w-fit">
                {calculateNights()} Night Stay
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {rooms.map((room) => (
                <div
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBookNow(room)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleBookNow(room);
                    }
                  }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EAE7DF] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#C5A46D] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                >

                  {/* ROOM IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-[#F2EBDD]">
                    <img
                      src={getRoomImage(room.room_type)}
                      alt={`${room.room_type} hotel room`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      Available
                    </span>
                  </div>

                  {/* ROOM DETAILS */}
                  <div className="p-6">

                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                          HotelHub Accommodation
                        </p>

                        <h3 className="text-xl font-bold capitalize text-[#172B36] mt-2 group-hover:text-[#A18453] transition">
                          {room.room_type} Room
                        </h3>
                      </div>

                      <span className="bg-[#F2EBDD] text-[#80643B] text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                        {room.room_type}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-6 mt-3">
                      {getRoomDescription(room.room_type)}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-[#F7F6F2] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Room Number</p>
                        <p className="font-semibold text-[#172B36] mt-1">
                          {room.room_number}
                        </p>
                      </div>

                      <div className="bg-[#F7F6F2] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="font-semibold text-[#172B36] mt-1">
                          {room.floor}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#EEEAE2] mt-5 pt-5">

                      <p className="text-gray-500 text-sm">
                        Price per night
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <div>
                          <span className="text-2xl font-bold text-[#A18453]">
                            ₹{Number(room.price).toLocaleString("en-IN")}
                          </span>

                          <span className="text-gray-500 text-sm">
                            {" "} / night
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-[#F7F6F2] rounded-lg p-3 mt-4">
                        <span className="text-sm text-gray-600">
                          Estimated room total
                        </span>

                        <span className="font-bold text-[#172B36]">
                          ₹{(
                            Number(room.price) * calculateNights()
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(room);
                        }}
                        className="w-full mt-5 bg-[#C5A46D] text-[#172B36] py-3.5 rounded-lg font-semibold hover:bg-[#D4B781] transition"
                      >
                        Book Now →
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#172B36] text-white px-6 md:px-16 py-8 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C5A46D] rounded-lg flex items-center justify-center">
              <span className="font-bold text-[#172B36]">H</span>
            </div>

            <span className="text-xl font-bold">HotelHub</span>
          </div>

          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} HotelHub. All rights reserved.
          </p>

          <button
            onClick={() => navigate("/")}
            className="text-[#D4B781] hover:text-white transition text-sm"
          >
            Back to Home ↑
          </button>

        </div>
      </footer>

    </div>
  );
}

export default CustomerRooms;
