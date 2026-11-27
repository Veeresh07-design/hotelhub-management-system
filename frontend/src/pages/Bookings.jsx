
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import AddBookingModal from "../components/AddBookingModal";
import EditBookingModal from "../components/EditBookingModal";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [processingActionId, setProcessingActionId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load bookings.");
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Booking #${id}?`)) return;

    try {
      await api.delete(`/bookings/${id}`);
      alert("Booking deleted successfully!");
      await fetchBookings();
      setExpandedId(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to delete booking.");
    }
  };

  const handleMarkAsPaid = async (booking) => {
    if (!window.confirm(`Have you received payment for Booking #${booking.id}?`)) return;

    try {
      setUpdatingPaymentId(booking.id);
      const response = await api.put(`/bookings/${booking.id}/payment`);
      alert(response.data.message);
      await fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Unable to update payment status.");
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleCheckIn = async (booking) => {
    if (!window.confirm(`Confirm check-in for Booking #${booking.id}?`)) return;

    try {
      setProcessingActionId(booking.id);
      const response = await api.put(`/bookings/checkin/${booking.id}`);
      alert(response.data.message);
      await fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Unable to check in guest.");
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleCheckOut = async (booking) => {
    if (!window.confirm(`Confirm check-out for Booking #${booking.id}?`)) return;

    try {
      setProcessingActionId(booking.id);
      const response = await api.put(`/bookings/checkout/${booking.id}`);
      alert(response.data.message);
      await fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Unable to check out guest.");
    } finally {
      setProcessingActionId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    return Math.max(0, Math.round((end - start) / 86400000));
  };

  const getStatusStyle = (status) => {
    if (status === "Booked") return "bg-green-100 text-green-700";
    if (status === "Checked In") return "bg-blue-100 text-blue-700";
    if (status === "Checked Out") return "bg-gray-100 text-gray-700";
    if (status === "Cancelled" || status === "Canceled") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold premium-heading">Bookings</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage reservations, guest check-in and check-out
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="premium-button">
          + New Booking
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-[#172B36]">All Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} reservations</p>
        </div>
      </div>

      <div className="space-y-5">
        {bookings.length === 0 ? (
          <div className="premium-card p-10 text-center text-gray-500">
            No bookings found.
          </div>
        ) : (
          bookings.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const nights = calculateNights(booking.check_in, booking.check_out);
            const totalAmount = Number(booking.price || 0) * nights;

            return (
              <div key={booking.id} className="premium-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  className="w-full text-left p-5 md:p-6 hover:bg-[#FAF9F6] transition"
                >
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#172B36]">
                        Booking #{booking.id}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        {booking.guest_name} · {booking.guest_phone}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="font-semibold text-[#172B36]">
                          Room {booking.room_number}
                        </p>
                        <p className="text-sm text-gray-500">{booking.room_type}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>

                      <span className="text-[#9B7A43] font-semibold">
                        {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 mt-5 text-sm text-gray-500">
                    <p>Check-in: {formatDate(booking.check_in)}</p>
                    <p>Check-out: {formatDate(booking.check_out)}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#eae7df] p-5 md:p-6 bg-[#FAF9F6]">
                    <div className="grid md:grid-cols-2 gap-5">
                      <section className="premium-card p-5">
                        <h3 className="font-bold text-lg text-[#172B36] mb-4">
                          Guest Information
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>Guest ID: <strong>{booking.guest_id}</strong></p>
                          <p>Guest Name: <strong>{booking.guest_name}</strong></p>
                          <p>Phone: <strong>{booking.guest_phone}</strong></p>
                          <p>Email: <strong>{booking.guest_email}</strong></p>
                        </div>
                      </section>

                      <section className="premium-card p-5">
                        <h3 className="font-bold text-lg text-[#172B36] mb-4">
                          Room Information
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>Room ID: <strong>{booking.room_id}</strong></p>
                          <p>Room Number: <strong>{booking.room_number ?? "N/A"}</strong></p>
                          <p>Room Type: <strong>{booking.room_type}</strong></p>
                          <p>Floor: <strong>{booking.floor ?? "N/A"}</strong></p>
                          <p>Price per Night: <strong>{booking.price != null ? `₹${Number(booking.price).toLocaleString("en-IN")}` : "N/A"}</strong></p>
                          <p>Room Status: <strong>{booking.room_status}</strong></p>
                        </div>
                      </section>

                      <section className="premium-card p-5">
                        <h3 className="font-bold text-lg text-[#172B36] mb-4">
                          Reservation Information
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>Booking ID: <strong>{booking.booking_id}</strong></p>
                          <p>Customer User ID: <strong>{booking.user_id ?? "N/A"}</strong></p>
                          <p>Check-in: <strong>{formatDate(booking.check_in)}</strong></p>
                          <p>Check-out: <strong>{formatDate(booking.check_out)}</strong></p>
                          <p>Number of Nights: <strong>{nights}</strong></p>
                          <p>Total Room Amount: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong></p>
                          <p>Booking Status: <strong>{booking.status}</strong></p>
                        </div>
                      </section>

                      <section className="premium-card p-5">
                        <h3 className="font-bold text-lg text-[#172B36] mb-4">
                          Payment Information
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>Payment Method: <strong>{booking.payment_method || "Not recorded"}</strong></p>
                          <p>
                            Payment Status:{" "}
                            <strong className={booking.payment_status === "Paid" ? "text-green-600" : "text-amber-600"}>
                              {booking.payment_status || "Not recorded"}
                            </strong>
                          </p>
                        </div>
                      </section>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      {booking.status === "Booked" && (
                        <button
                          onClick={() => handleCheckIn(booking)}
                          disabled={processingActionId === booking.id}
                          className="premium-button disabled:opacity-60"
                        >
                          {processingActionId === booking.id ? "Processing..." : "Check-in"}
                        </button>
                      )}

                      {booking.status === "Checked In" && (
                        <button
                          onClick={() => handleCheckOut(booking)}
                          disabled={processingActionId === booking.id}
                          className="bg-[#203641] text-white px-5 py-2 rounded-lg hover:bg-[#172B36] disabled:opacity-60"
                        >
                          {processingActionId === booking.id ? "Processing..." : "Check-out"}
                        </button>
                      )}

                      {booking.payment_method === "Pay at Hotel" &&
                        booking.payment_status === "Pending" &&
                        booking.status !== "Cancelled" &&
                        booking.status !== "Canceled" && (
                          <button
                            onClick={() => handleMarkAsPaid(booking)}
                            disabled={updatingPaymentId === booking.id}
                            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
                          >
                            {updatingPaymentId === booking.id ? "Updating..." : "Mark as Paid"}
                          </button>
                        )}

                      {booking.status !== "Checked In" &&
                        booking.status !== "Checked Out" &&
                        booking.status !== "Cancelled" &&
                        booking.status !== "Canceled" && (
                          <button
                            onClick={() => handleEdit(booking)}
                            className="bg-[#C5A46D] text-[#172B36] px-5 py-2 rounded-lg font-semibold hover:bg-[#D4B781]"
                          >
                            Edit Booking
                          </button>
                        )}

                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="bg-[#A94442] text-white px-5 py-2 rounded-lg hover:bg-[#913936]"
                      >
                        Delete Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddBookingModal
          onClose={() => setShowAddModal(false)}
          onBookingAdded={fetchBookings}
        />
      )}

      {showEditModal && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => setShowEditModal(false)}
          onBookingUpdated={fetchBookings}
        />
      )}
    </Layout>
  );
}

export default Bookings;
