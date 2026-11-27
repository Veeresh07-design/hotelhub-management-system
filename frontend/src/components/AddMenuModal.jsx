
import { useState } from "react";
import api from "../services/api";

function AddMenuModal({ onClose, onMenuAdded }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/menu", {
        item_name: itemName,
        category: category,
        price: Number(price),
        availability: availability,
      });

      alert("Menu Item Added Successfully!");
      onMenuAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add menu item.");
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
            Add Menu Item
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new item to your restaurant menu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Item Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Category
            </label>
            <input
              type="text"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={inputStyle}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
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
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMenuModal;
