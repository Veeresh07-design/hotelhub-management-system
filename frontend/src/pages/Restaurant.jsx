
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import AddMenuModal from "../components/AddMenuModal";
import EditMenuModal from "../components/EditMenuModal";

function Restaurant() {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await api.get("/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await api.get("/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await api.delete(`/menu/${id}`);
      alert("Menu item deleted successfully!");
      fetchMenu();
    } catch (error) {
      console.error(error);
      alert("Failed to delete menu item.");
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold premium-heading">
            Restaurant Menu
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage food items, categories and availability
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="premium-button">
          + Add Item
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-5 border-b border-[#eae7df]">
          <h2 className="text-lg font-semibold text-[#172B36]">Menu Directory</h2>
          <p className="text-sm text-gray-500 mt-1">
            {menuItems.length} menu items
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full premium-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-center">Item Name</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Price</th>
                <th className="p-4 text-center">Availability</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <tr key={item.id} className="text-center hover:bg-[#FAF9F6]">
                    <td className="p-4 font-semibold">{item.item_name}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-semibold">₹{item.price}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        String(item.availability).toLowerCase() === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {item.availability}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-[#C5A46D] text-[#172B36] px-4 py-2 rounded-lg font-semibold hover:bg-[#D4B781] mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-[#A94442] text-white px-4 py-2 rounded-lg hover:bg-[#913936]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No menu items found. Add your first item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddMenuModal
          onClose={() => setShowAddModal(false)}
          onMenuAdded={fetchMenu}
        />
      )}

      {showEditModal && (
        <EditMenuModal
          item={selectedItem}
          onClose={() => setShowEditModal(false)}
          onMenuUpdated={fetchMenu}
        />
      )}
    </Layout>
  );
}

export default Restaurant;
