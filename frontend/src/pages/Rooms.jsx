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
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      console.log(response.data);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Rooms</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Room
        </button>
      </div>

      <table className="w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-200">
          <th className="p-3">Room No</th>
          <th className="p-3">Type</th>
          <th className="p-3">Floor</th>
          <th className="p-3">Price</th>
          <th className="p-3">Status</th>
          <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-b text-center">
              <td className="p-3">{room.room_number}</td>
              <td className="p-3">{room.room_type}</td>
              <td className="p-3">{room.floor}</td>
              <td className="p-3">₹{room.price}</td>
              <td className="p-3">{room.status}</td>

              <td className="p-3">
                <button
                  onClick={() => handleEdit(room)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(room.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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