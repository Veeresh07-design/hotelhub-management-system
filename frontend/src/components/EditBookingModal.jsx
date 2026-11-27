
import { useState } from "react";
import api from "../services/api";

function EditBookingModal({ booking, onClose, onBookingUpdated }) {
  const [guestId, setGuestId] = useState(booking.guest_id);
  const [roomId, setRoomId] = useState(booking.room_id);
  const [checkIn, setCheckIn] = useState(booking.check_in);
  const [checkOut, setCheckOut] = useState(booking.check_out);
  const [status, setStatus] = useState(booking.status);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/bookings/${booking.id}`, {
        guest_id: Number(guestId),
        room_id: Number(roomId),
        check_in: checkIn,
        check_out: checkOut,
        status: status,
      });

      alert("Booking Updated Successfully!");
      onBookingUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update booking.");
    }
  };

  const inputStyle =
    "w-full border border-[#DED9CE] bg-[#FCFBF8] p-3.5 rounded-lg text-[#172B36] outline-none focus:border-[#C5A46D] focus:ring-2 focus:ring-[#C5A46D]/20 transition";

  return (
    <div className="fixed inset-0 z-50 bg-[#172B36]/55 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] p-7 md:p-8 max-h-[90vh] overflow-y-auto">

        <div className="mb-7">
          <p className="text-xs font-semibold tracking-widest text-[#A18453] uppercase mb-2">
            HotelHub Management
          </p>
          <h2 className="text-2xl font-bold text-[#172B36]">
            Edit Booking
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update guest, room and reservation details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Guest ID
            </label>
            <input
              type="number"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Room ID
            </label>
            <input
              type="number"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Booking Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputStyle}
              required
            >
              <option value="Booked">Booked</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EEEAE2]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#203641] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#172B36] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#C5A46D] text-[#172B36] px-6 py-3 rounded-lg font-semibold hover:bg-[#D4B781] transition"
            >
              Update Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;
