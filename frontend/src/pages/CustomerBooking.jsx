
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function CustomerBooking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const roomId = params.get("room_id");
  const checkIn = params.get("check_in");
  const checkOut = params.get("check_out");
  const guests = params.get("guests") || "1";

  const [room, setRoom] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Pay at Hotel");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(`${checkOut}T00:00:00`) -
            new Date(`${checkIn}T00:00:00`)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const formatDate = (date) => {
    if (!date) return "Not selected";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadRoom = async () => {
      try {
        setLoading(true);
        setError("");
        setRoom(null);

        if (!roomId || !checkIn || !checkOut || nights <= 0) {
          setError("Invalid booking details. Please search again.");
          return;
        }

        const response = await api.get("/rooms/available", {
          params: {
            check_in: checkIn,
            check_out: checkOut,
            guests: Number(guests),
          },
        });

        const selectedRoom = response.data.find(
          (item) => String(item.id) === String(roomId)
        );

        if (!selectedRoom) {
          setError(
            "This room is no longer available. Please search again."
          );
          return;
        }

        if (!cancelled) {
          setRoom(selectedRoom);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Unable to load room details. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId, checkIn, checkOut, guests]);

  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "customer") {
      navigate("/customer/login");
      return;
    }

    if (paymentMethod === "Pay Online") {
      setError(
        "Online payment is not connected yet. Please select Pay at Hotel."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/customer/bookings", {
        room_id: Number(roomId),
        check_in: checkIn,
        check_out: checkOut,
        payment_method: paymentMethod,
      });

      alert(
        `Reservation created successfully! Booking ID: ${response.data.booking_id}`
      );

      navigate("/customer/profile");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create reservation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#EAE7DF] border-t-[#C5A46D] rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-lg font-semibold text-[#172B36]">
            Loading booking details...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we prepare your reservation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#172B36]">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#EAE7DF] shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex justify-between items-center">

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

          <Link
            to="/"
            className="border border-[#C5A46D] text-[#172B36] px-4 py-2 rounded-lg font-medium hover:bg-[#F2EBDD] transition"
          >
            ← Back to Home
          </Link>

        </div>
      </header>

      {/* PAGE HEADING */}
      <section className="bg-[#172B36] text-white px-6 md:px-16 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[3px] text-[#D4B781] font-semibold mb-3">
            Reservation
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            Confirm Your Booking
          </h1>

          <p className="text-gray-300 mt-2">
            Review your stay details and confirm your reservation.
          </p>
        </div>
      </section>

      {/* BOOKING CONTENT */}
      <main className="max-w-5xl mx-auto px-5 md:px-8 py-12">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl mb-7">
            <p className="font-semibold">Notice</p>
            <p className="text-sm mt-1">{error}</p>

            {!room && (
              <button
                onClick={() => navigate("/")}
                className="mt-4 text-sm font-semibold underline"
              >
                Search rooms again
              </button>
            )}
          </div>
        )}

        {room && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT: BOOKING SUMMARY */}
            <div className="lg:col-span-3 space-y-7">

              <section className="bg-white rounded-2xl border border-[#EAE7DF] shadow-sm overflow-hidden">

                <div className="p-6 border-b border-[#EEEAE2]">
                  <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                    Your Reservation
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Booking Summary
                  </h2>
                </div>

                <div className="p-6">

                  <div className="bg-[#F7F6F2] rounded-xl p-5 mb-6">
                    <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                      Selected Accommodation
                    </p>

                    <h3 className="text-2xl font-bold capitalize mt-2">
                      {room.room_type} Room
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Room Number: {room.room_number}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-semibold mt-1">
                        {formatDate(checkIn)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-semibold mt-1">
                        {formatDate(checkOut)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-semibold mt-1">
                        {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold mt-1">
                        {nights} {nights === 1 ? "Night" : "Nights"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Room Type</p>
                      <p className="font-semibold capitalize mt-1">
                        {room.room_type}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Price per Night</p>
                      <p className="font-semibold mt-1">
                        ₹{Number(room.price).toLocaleString("en-IN")}
                      </p>
                    </div>

                  </div>

                </div>
              </section>

              {/* PAYMENT METHOD */}
              <section className="bg-white rounded-2xl border border-[#EAE7DF] shadow-sm p-6">

                <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                  Payment
                </p>

                <h2 className="text-2xl font-bold mt-2 mb-6">
                  Select Payment Method
                </h2>

                <div className="space-y-4">

                  <label
                    className={`flex items-start gap-4 border rounded-xl p-5 cursor-pointer transition ${
                      paymentMethod === "Pay at Hotel"
                        ? "border-[#C5A46D] bg-[#F7F3EA]"
                        : "border-[#EAE7DF] hover:border-[#C5A46D]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="Pay at Hotel"
                      checked={paymentMethod === "Pay at Hotel"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 accent-[#A18453]"
                    />

                    <div>
                      <p className="font-semibold text-[#172B36]">
                        Pay at Hotel
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Pay at the hotel reception during your stay.
                      </p>

                      <span className="inline-block mt-3 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        Currently Available
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-4 border rounded-xl p-5 cursor-pointer transition ${
                      paymentMethod === "Pay Online"
                        ? "border-[#C5A46D] bg-[#F7F3EA]"
                        : "border-[#EAE7DF] hover:border-[#C5A46D]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="Pay Online"
                      checked={paymentMethod === "Pay Online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 accent-[#A18453]"
                    />

                    <div>
                      <p className="font-semibold text-[#172B36]">
                        Pay Online
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Online payment gateway integration coming soon.
                      </p>

                      <span className="inline-block mt-3 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </label>

                </div>
              </section>

            </div>

            {/* RIGHT: PRICE DETAILS */}
            <aside className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#EAE7DF] shadow-sm p-6 sticky top-28">

                <p className="text-xs uppercase tracking-widest text-[#A18453] font-semibold">
                  Payment Overview
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  Price Details
                </h2>

                <div className="space-y-4 mt-7">

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Room Price</span>
                    <span className="font-medium text-[#172B36]">
                      ₹{Number(room.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Number of Nights</span>
                    <span className="font-medium text-[#172B36]">
                      {nights}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-medium text-[#172B36] text-right">
                      {paymentMethod}
                    </span>
                  </div>

                </div>

                <div className="border-t border-[#EEEAE2] mt-7 pt-6">

                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="text-3xl font-bold text-[#A18453] mt-2">
                    ₹{(
                      Number(room.price) * nights
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Calculated from room price × number of nights.
                  </p>

                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="w-full mt-7 bg-[#C5A46D] text-[#172B36] py-4 rounded-xl font-semibold hover:bg-[#D4B781] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Processing Reservation..."
                    : "Confirm Booking →"}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4 leading-5">
                  Please review your reservation details before confirming.
                </p>

              </div>
            </aside>

          </div>
        )}

        {!room && !error && (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] p-10 text-center">
            <p className="text-gray-600">
              Room details are unavailable.
            </p>
          </div>
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

          <Link
            to="/"
            className="text-[#D4B781] hover:text-white transition text-sm"
          >
            Back to Home ↑
          </Link>

        </div>
      </footer>

    </div>
  );
}

export default CustomerBooking;
