
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function Bills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await api.get("/bills");
      setBills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await api.get("/bills");
      setBills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/bills/pay/${id}`);
      alert("Payment Successful!");
      fetchBills();
    } catch (error) {
      console.error(error);
      alert("Failed to pay bill.");
    }
  };

  const paidCount = bills.filter((bill) => bill.payment_status === "Paid").length;
  const pendingCount = bills.length - paidCount;
  const totalAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.total_amount || 0),
    0
  );

  const paidAmount = bills
    .filter((bill) => bill.payment_status === "Paid")
    .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold premium-heading">
          Bills & Payments
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          View hotel bills and manage guest payments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="premium-card p-5">
          <p className="text-sm text-gray-500">Total Bills</p>
          <h2 className="text-3xl font-bold text-[#172B36] mt-2">{bills.length}</h2>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-gray-500">Paid Bills</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">{paidCount}</h2>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-gray-500">Pending Bills</p>
          <h2 className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</h2>
        </div>
        <div className="premium-card p-5">
          <p className="text-sm text-gray-500">Total Amount</p>
          <h2 className="text-3xl font-bold text-[#172B36] mt-2">
            ₹{totalAmount.toLocaleString("en-IN")}
          </h2>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-5 border-b border-[#eae7df]">
          <h2 className="text-xl font-semibold text-[#172B36]">Billing Records</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total collected: ₹{paidAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full premium-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-center">Booking ID</th>
                <th className="p-4 text-center">Room Charge</th>
                <th className="p-4 text-center">Restaurant Charge</th>
                <th className="p-4 text-center">Total Amount</th>
                <th className="p-4 text-center">Payment Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <tr key={bill.id} className="text-center hover:bg-[#FAF9F6]">
                    <td className="p-4 font-semibold">{bill.booking_id}</td>
                    <td className="p-4">
                      ₹{Number(bill.room_charge || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      ₹{Number(bill.restaurant_charge || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-bold text-[#172B36]">
                      ₹{Number(bill.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.payment_status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      {bill.payment_status === "Paid" ? (
                        <span className="text-green-700 font-semibold">Paid</span>
                      ) : (
                        <button
                          onClick={() => handlePay(bill.id)}
                          className="premium-button"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    No billing records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Bills;
