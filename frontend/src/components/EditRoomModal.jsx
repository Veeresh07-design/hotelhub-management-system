import { useState } from "react";
import api from "../services/api";

function EditRoomModal({ room, onClose, onRoomUpdated }) {
  const [roomNumber, setRoomNumber] = useState(room.room_number);
  const [roomType, setRoomType] = useState(room.room_type);
  const [floor, setFloor] = useState(room.floor);
  const [price, setPrice] = useState(room.price);
  const [status, setStatus] = useState(room.status);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/rooms/${room.id}`, {
        room_number: Number(roomNumber),
        room_type: roomType,
        floor: Number(floor),
        price: Number(price),
        status: status,
      });

      alert("Room Updated Successfully!");

      onRoomUpdated();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to update room.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">

        <h2 className="text-2xl font-bold mb-6">
          Edit Room
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
          </select>

          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
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
              Update
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditRoomModal;