
import { useState } from "react";
import api from "../services/api";

function EditGuestModal({ guest, onClose, onGuestUpdated }) {
  const [guestName, setGuestName] = useState(guest.guest_name);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone);
  const [roomNumber, setRoomNumber] = useState(guest.room_number);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/guests/${guest.id}`, {
        guest_name: guestName,
        email: email,
        phone: phone,
        room_number: Number(roomNumber),
      });

      alert("Guest Updated Successfully!");
      onGuestUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update guest.");
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
            Edit Guest
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update guest information and room details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Guest Name
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Room Number
            </label>
            <input
              type="number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className={inputStyle}
              required
            />
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
              Update Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGuestModal;
