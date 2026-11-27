
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, bookingsRes, menuRes] = await Promise.all([
        api.get("/restaurant-orders"),
        api.get("/bookings"),
        api.get("/menu"),
      ]);
      setOrders(ordersRes.data);
      setBookings(bookingsRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error("Error loading restaurant data:", error);
      alert("Failed to load restaurant data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/restaurant-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Unable to refresh restaurant orders.");
    }
  };

  const addItemToCart = () => {
    if (!selectedMenu) {
      alert("Please select a menu item.");
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      alert("Quantity must be a positive whole number.");
      return;
    }

    const menu = menuItems.find((item) => item.id === Number(selectedMenu));
    if (!menu) return;

    setCart((prev) => [
      ...prev,
      {
        menu_id: menu.id,
        item_name: menu.item_name,
        price: Number(menu.price),
        quantity: Number(quantity),
        subtotal: Number(menu.price) * Number(quantity),
      },
    ]);

    setSelectedMenu("");
    setQuantity(1);
  };

  const removeCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((total, item) => total + item.subtotal, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!selectedBooking) {
      alert("Please select a booking.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one menu item.");
      return;
    }

    setSubmitting(true);

    try {
      const orderResponse = await api.post("/restaurant-orders", {
        booking_id: Number(selectedBooking),
        order_date: new Date().toLocaleDateString("en-CA"),
      });

      const orderId = orderResponse.data.order_id;

      if (!orderId) {
        throw new Error(orderResponse.data.message || "Order creation failed.");
      }

      for (const item of cart) {
        await api.post("/order-items", {
          restaurant_order_id: orderId,
          menu_id: item.menu_id,
          quantity: item.quantity,
        });
      }

      alert("Restaurant order created successfully!");

      setSelectedBooking("");
      setSelectedMenu("");
      setQuantity(1);
      setCart([]);
      setShowCreateForm(false);
      await fetchOrders();
    } catch (error) {
      console.error("Error creating restaurant order:", error);
      alert(
        error.response?.data?.detail ||
        error.message ||
        "Failed to create restaurant order."
      );
      await fetchOrders();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/restaurant-orders/${orderId}/status`, {
        status: newStatus,
      });
      alert("Order status updated successfully!");
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.detail || "Failed to update order status.");
    }
  };

  const statusStyle = (status) => {
    if (status === "Pending") return "bg-amber-100 text-amber-800";
    if (status === "Preparing") return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold premium-heading">
            Restaurant Orders
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage restaurant orders and menu items
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="premium-button"
        >
          {showCreateForm ? "Close Form" : "+ Create Order"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateOrder} className="premium-card p-5 md:p-6 mb-8">
          <h2 className="text-xl font-bold text-[#172B36] mb-5">
            Create Restaurant Order
          </h2>

          <div className="mb-5">
            <label className="block font-semibold text-sm mb-2">
              Select Booking
            </label>
            <select
              value={selectedBooking}
              onChange={(e) => setSelectedBooking(e.target.value)}
              className="w-full border border-[#ddd8cc] rounded-lg p-3 bg-white"
              required
            >
              <option value="">Choose a booking</option>
              {bookings
                .filter((booking) => booking.status === "Checked In")
                  .map((booking) => (
                  
                  <option key={booking.id} value={booking.id}>
                    Booking #{booking.id} - {booking.guest_name} - Room{" "}
                    {booking.room_number} ({booking.status})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block font-semibold text-sm mb-2">Menu Item</label>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="w-full border border-[#ddd8cc] rounded-lg p-3 bg-white"
              >
                <option value="">Select food item</option>
                {menuItems
                  .filter((item) =>
                    String(item.availability).toLowerCase() === "available"
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} - ₹{item.price}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-sm mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-[#ddd8cc] rounded-lg p-3"
              />
            </div>

            <button
              type="button"
              onClick={addItemToCart}
              className="bg-[#203641] text-white p-3 rounded-lg hover:bg-[#172B36]"
            >
              + Add Item
            </button>
          </div>

          <h3 className="font-bold text-lg text-[#172B36] mt-7 mb-3">
            Selected Items
          </h3>

          {cart.length === 0 ? (
            <p className="text-gray-500">No items added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full premium-table text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Subtotal</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3">{item.item_name}</td>
                      <td className="p-3">₹{item.price}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">₹{item.subtotal}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => removeCartItem(index)}
                          className="bg-[#A94442] text-white px-3 py-1 rounded-lg"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
            <p className="text-xl font-bold text-[#172B36]">
              Total: ₹{cartTotal.toLocaleString("en-IN")}
            </p>
            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="premium-button disabled:opacity-50"
            >
              {submitting ? "Creating Order..." : "Place Order"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#172B36]">All Orders</h2>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} restaurant orders
        </p>
      </div>

      {loading ? (
        <div className="premium-card p-8 text-center text-gray-500">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="premium-card p-8 text-center text-gray-500">
          No restaurant orders found.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.order_id} className="premium-card p-5 md:p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[#172B36]">
                    Order #{order.order_id}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Booking ID: {order.booking_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {order.order_date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="font-semibold text-sm">Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                    className={`border border-[#C5A46D] rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A46D] ${statusStyle(order.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Served">Served</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full premium-table text-sm">
                  <thead>
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Quantity</th>
                      <th className="p-3 text-left">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${order.order_id}-${item.menu_id}-${index}`}>
                        <td className="p-3">{item.item_name}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">₹{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-5">
                <p className="text-xl font-bold text-[#172B36]">
                  Total: ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default RestaurantOrders;
