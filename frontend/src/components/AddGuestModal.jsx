
import { useState } from "react";
import api from "../services/api";

function AddGuestModal({ onClose, onGuestAdded }) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/guests", {
        guest_name: guestName,
        email: email,
        phone: phone,
        room_number: Number(roomNumber),
      });

      alert("Guest Added Successfully!");

      onGuestAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add guest.");
    }
  };

  const inputStyle =
    "w-full border border-[#DED9CE] bg-[#FCFBF8] p-3.5 rounded-lg text-[#172B36] outline-none focus:border-[#C5A46D] focus:ring-2 focus:ring-[#C5A46D]/20 transition";

  return (
    <div className="fixed inset-0 z-50 bg-[#172B36]/55 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] p-7 md:p-8">

        <div className="mb-7">
          <p className="text-xs font-semibold tracking-widest text-[#A18453] uppercase mb-2">
            HotelHub Management
          </p>

          <h2 className="text-2xl font-bold text-[#172B36]">
            Add Guest
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter the guest information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Guest Name
            </label>
            <input
              type="text"
              placeholder="Enter guest name"
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
              placeholder="Enter email address"
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
              placeholder="Enter phone number"
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
              placeholder="Enter room number"
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
              Save Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGuestModal;
