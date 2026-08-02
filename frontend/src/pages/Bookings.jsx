import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import AddBookingModal from "../components/AddBookingModal";
import EditBookingModal from "../components/EditBookingModal";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (booking) => {
  setSelectedBooking(booking);
  setShowEditModal(true);
};

const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this booking?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/bookings/${id}`);

    alert("Booking Deleted Successfully!");

    fetchBookings();

  } catch (error) {
    console.error(error);
    alert("Failed to delete booking.");
  }
};

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-4xl font-bold">
          Bookings
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Booking
        </button>

      </div>

      <table className="w-full bg-white rounded-lg shadow">

        <thead>

          <tr className="bg-gray-200">
            <th className="p-3">Guest</th>
            <th className="p-3">Room</th>
            <th className="p-3">Check In</th>
            <th className="p-3">Check Out</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>

        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr key={booking.id} className="border-b text-center">

              <td className="p-3">{booking.guest_id}</td>
              <td className="p-3">{booking.room_id}</td>
              <td className="p-3">{booking.check_in}</td>
              <td className="p-3">{booking.check_out}</td>
              <td className="p-3">{booking.status}</td>

              <td className="p-3">

                <button
                  onClick={() => handleEdit(booking)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(booking.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

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