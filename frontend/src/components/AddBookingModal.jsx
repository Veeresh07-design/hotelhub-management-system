import { useState } from "react";
import api from "../services/api";

function AddBookingModal({ onClose, onBookingAdded }) {
  const [guestId, setGuestId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("Booked");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/bookings", {
        guest_id: Number(guestId),
        room_id: Number(roomId),
        check_in: checkIn,
        check_out: checkOut,
        status: status,
      });

      alert("Booking Added Successfully!");

      onBookingAdded();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to add booking.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="number"
            placeholder="Guest ID"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="number"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="Booked">Booked</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddBookingModal;