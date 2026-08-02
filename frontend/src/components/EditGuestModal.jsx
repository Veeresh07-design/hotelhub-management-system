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

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">

        <h2 className="text-2xl font-bold mb-6">
          Edit Guest
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full border p-3 rounded"
          />

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
              Update
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditGuestModal;