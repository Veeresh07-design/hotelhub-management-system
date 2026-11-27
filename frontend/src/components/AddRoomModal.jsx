
import { useState } from "react";
import api from "../services/api";

function AddRoomModal({ onClose, onRoomAdded }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("standard");
  const [floor, setFloor] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/rooms", {
        room_number: Number(roomNumber),
        room_type: roomType,
        floor: Number(floor),
        price: Number(price),
        status: status,
      });

      alert("Room Added Successfully!");
      onRoomAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add room.");
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
            Add Room
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter room details, pricing and availability.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className={inputStyle}
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Floor
            </label>
            <input
              type="number"
              placeholder="Enter floor number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Price per Night (₹)
            </label>
            <input
              type="number"
              placeholder="Enter room price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Room Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputStyle}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
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
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRoomModal;
