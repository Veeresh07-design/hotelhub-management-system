
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import AddRoomModal from "../components/AddRoomModal";
import EditRoomModal from "../components/EditRoomModal";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get("/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/rooms/${id}`);
      alert("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      console.error(error);
      alert("Failed to delete room.");
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold premium-heading">
            Rooms
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage room details, pricing and availability
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="premium-button"
        >
          + Add Room
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg text-[#172B36]">
              Room Directory
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {rooms.length} rooms registered
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full premium-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-center">Room No</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Floor</th>
                <th className="p-4 text-center">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room.id} className="text-center hover:bg-[#FAF9F6] transition">
                    <td className="p-4 font-semibold">{room.room_number}</td>
                    <td className="p-4">{room.room_type}</td>
                    <td className="p-4">{room.floor}</td>
                    <td className="p-4 font-semibold">₹{room.price}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          room.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : room.status === "Occupied"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(room)}
                        className="bg-[#C5A46D] text-[#172B36] px-4 py-2 rounded-lg font-semibold hover:bg-[#D4B781] transition mr-2"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(room.id)}
                        className="bg-[#A94442] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#913936] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    No rooms found. Add your first room to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddRoomModal
          onClose={() => setShowModal(false)}
          onRoomAdded={fetchRooms}
        />
      )}

      {showEditModal && (
        <EditRoomModal
          room={selectedRoom}
          onClose={() => setShowEditModal(false)}
          onRoomUpdated={fetchRooms}
        />
      )}
    </Layout>
  );
}

export default Rooms;
