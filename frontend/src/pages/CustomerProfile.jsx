
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchProfile = async () => {
    try {
      const [profileResponse, bookingsResponse] = await Promise.all([
        api.get("/customer/profile"),
        api.get("/customer/bookings"),
      ]);

      setProfile(profileResponse.data);
      setBookings(bookingsResponse.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Booking #${bookingId}?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setError("");

      const response = await api.put(
        `/customer/bookings/${bookingId}/cancel`
      );

      alert(response.data.message);
      await fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to cancel booking. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getBookingStyle = (status) => {
    if (status === "Cancelled") return "bg-red-50 text-red-700";
    if (status === "Checked Out") return "bg-slate-100 text-slate-700";
    if (status === "Checked In") return "bg-emerald-50 text-emerald-700";
    return "bg-amber-50 text-amber-800";
  };

  const getPaymentStyle = (status) => {
    return status === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-orange-50 text-orange-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] text-[#203641]">
        Loading your profile...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#203641]">
      <nav className="sticky top-0 z-30 bg-white border-b border-[#eae7df] shadow-sm px-6 md:px-16 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#c5a46d] flex items-center justify-center text-[#172b36] text-2xl font-bold">
            H
          </div>
          <div>
            <h1 className="text-2xl font-bold">HotelHub</h1>
            <p className="text-[10px] tracking-[3px] text-[#a88650]">
              HOSPITALITY MANAGEMENT
            </p>
          </div>
        </Link>

        <Link
          to="/"
          className="border border-[#c5a46d] text-[#203641] px-5 py-2.5 rounded-lg hover:bg-[#f7f3eb] transition"
        >
          ← Back to Home
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="mb-8">
          <p className="text-sm tracking-[2px] text-[#a88650] font-semibold">
            CUSTOMER ACCOUNT
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            My Profile
          </h1>
          <p className="text-[#71808a] mt-2">
            Manage your personal information and hotel reservations.
          </p>
        </div>

        {/* Customer Information */}
        <section className="bg-white border border-[#eae7df] rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f3ede2] flex items-center justify-center text-3xl font-bold text-[#a88650]">
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <p className="text-[#71808a]">Customer Account</p>
            </div>
          </div>

          <div className="border-t border-[#eee9df] pt-6">
            <h3 className="text-xl font-bold mb-6">
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-7">
              <div>
                <p className="text-sm text-[#8a969d] mb-1">Full Name</p>
                <p className="font-semibold">{profile.username}</p>
              </div>

              <div>
                <p className="text-sm text-[#8a969d] mb-1">Email Address</p>
                <p className="font-semibold break-all">{profile.email}</p>
              </div>

              <div>
                <p className="text-sm text-[#8a969d] mb-1">Phone Number</p>
                <p className="font-semibold">{profile.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Bookings */}
        <section className="bg-white border border-[#eae7df] rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <p className="text-[#71808a] mt-1">
                Your reservation history
              </p>
            </div>

            <span className="bg-[#f3ede2] text-[#8b6a39] px-4 py-2 rounded-full text-sm font-semibold">
              {bookings.length} Reservations
            </span>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#ded7ca] rounded-xl">
              <h3 className="text-xl font-semibold mb-2">
                No bookings yet
              </h3>
              <p className="text-[#71808a] mb-5">
                Explore our rooms and plan your next stay.
              </p>

              <Link
                to="/"
                className="inline-block bg-[#c5a46d] text-[#172b36] px-6 py-3 rounded-lg font-semibold hover:bg-[#d4b781] transition"
              >
                Explore Rooms
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => {
                const canCancel = booking.status === "Booked";

                return (
                  <article
                    key={booking.id}
                    className="border border-[#eae7df] rounded-xl p-5 md:p-6 hover:shadow-sm transition"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                      <div>
                        <h3 className="text-lg font-bold">
                          Booking #{booking.id}
                        </h3>
                        <p className="text-sm text-[#8a969d] mt-1">
                          Reservation details
                        </p>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getBookingStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm text-[#8a969d]">Check-in</p>
                        <p className="font-semibold mt-1">{booking.check_in}</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#8a969d]">Check-out</p>
                        <p className="font-semibold mt-1">{booking.check_out}</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#8a969d]">Room ID</p>
                        <p className="font-semibold mt-1">{booking.room_id}</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#8a969d]">Payment Method</p>
                        <p className="font-semibold mt-1">
                          {booking.payment_method || "Not recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#eee9df] mt-5 pt-5 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#71808a]">Payment:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStyle(booking.payment_status)}`}>
                          {booking.payment_status || "Not recorded"}
                        </span>
                      </div>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="mt-5 bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-800 disabled:opacity-60 transition"
                      >
                        {cancellingId === booking.id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                    {booking.status === "Cancelled" && (
                      <p className="mt-4 text-sm text-red-700 font-medium">
                        This reservation has been cancelled.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="text-center text-sm text-[#8a969d] py-8">
          © 2026 HotelHub. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default CustomerProfile;
