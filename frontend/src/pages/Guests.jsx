
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
    const loadGuests = async () => {
      try {
        const response = await api.get("/guests");
        setGuests(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadGuests();
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold premium-heading">
            Guests
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage guest information and room assignments
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="premium-button"
        >
          + Add Guest
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg text-[#172B36]">
              Guest Directory
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {guests.length} registered guests
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full premium-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-center">Name</th>
                <th className="p-4 text-center">Email</th>
                <th className="p-4 text-center">Phone</th>
                <th className="p-4 text-center">Room No</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {guests.length > 0 ? (
                guests.map((guest) => (
                  <tr key={guest.id} className="text-center hover:bg-[#FAF9F6] transition">
                    <td className="p-4 font-semibold">{guest.guest_name}</td>
                    <td className="p-4">{guest.email}</td>
                    <td className="p-4">{guest.phone}</td>
                    <td className="p-4">
                      <span className="inline-block bg-[#F4F0E7] text-[#80663D] px-3 py-1 rounded-full font-semibold">
                        {guest.room_number}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(guest)}
                        className="bg-[#C5A46D] text-[#172B36] px-4 py-2 rounded-lg font-semibold hover:bg-[#D4B781] transition mr-2"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="bg-[#A94442] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#913936] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No guests found. Add your first guest to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
