import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import AddGuestModal from "../components/AddGuestModal";
import EditGuestModal from "../components/EditGuestModal";

function Guests() {
  const [guests, setGuests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests");
      setGuests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this guest?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/guests/${id}`);

    alert("Guest deleted successfully!");

    fetchGuests();

  } catch (error) {
    console.error(error);
    alert("Failed to delete guest.");
  }
};

const handleEdit = (guest) => {
  setSelectedGuest(guest);
  setShowEditModal(true);
};

  return (
    <Layout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-4xl font-bold">
          Guests
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Guest
        </button>

      </div>

      <table className="w-full bg-white shadow rounded-lg">

        <thead>

          <tr className="bg-gray-200">

            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Room No</th>
            <th className="p-3">Actions</th>

          </tr>

        </thead>

        <tbody>

          {guests.map((guest) => (

            <tr key={guest.id} className="border-b text-center">

              <td className="p-3">{guest.guest_name}</td>
              <td className="p-3">{guest.email}</td>
              <td className="p-3">{guest.phone}</td>
              <td className="p-3">{guest.room_number}</td>

              <td className="p-3">

                <button
                  onClick={() => handleEdit(guest)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(guest.id)}
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
        <AddGuestModal
          onClose={() => setShowModal(false)}
          onGuestAdded={fetchGuests}
        />
      )}

      {showEditModal && (
        <EditGuestModal
        guest={selectedGuest}
        onClose={() => setShowEditModal(false)}
        onGuestUpdated={fetchGuests}
        />
      )}

    </Layout>
  );
}

export default Guests;