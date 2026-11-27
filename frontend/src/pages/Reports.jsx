
import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

function Reports() {
  const [dashboardData, setDashboardData] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [dashboardResponse, billsResponse] = await Promise.all([
          api.get("/dashboard"),
          api.get("/bills"),
        ]);

        setDashboardData(dashboardResponse.data);
        setBills(billsResponse.data);
      } catch (error) {
        console.error("Failed to load reports:", error);
        alert("Unable to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <Layout>
        <div className="premium-card p-10 text-center text-gray-500">
          Loading Reports...
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="premium-card p-10 text-center text-gray-500">
          Unable to load reports.
        </div>
      </Layout>
    );
  }

  const paidBills = bills.filter((bill) => bill.payment_status === "Paid");
  const pendingBills = bills.filter((bill) => bill.payment_status !== "Paid");

  const paidAmount = paidBills.reduce(
    (total, bill) => total + Number(bill.total_amount || 0),
    0
  );

  const pendingAmount = pendingBills.reduce(
    (total, bill) => total + Number(bill.total_amount || 0),
    0
  );

  const restaurantRevenue = bills.reduce(
    (total, bill) => total + Number(bill.restaurant_charge || 0),
    0
  );

  const roomRevenue = bills.reduce(
    (total, bill) => total + Number(bill.room_charge || 0),
    0
  );

  const StatCard = ({ title, value, description }) => (
    <div className="premium-card p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl md:text-3xl font-bold text-[#172B36] mt-3">
        {value}
      </h3>
      {description && (
        <p className="text-xs text-gray-400 mt-2">{description}</p>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold premium-heading">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 mt-2">
          Overview of hotel bookings, rooms and financial performance.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#172B36]">Hotel Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Current hotel operations summary
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <StatCard title="Total Rooms" value={dashboardData.total_rooms} />
          <StatCard title="Available Rooms" value={dashboardData.available_rooms} />
          <StatCard title="Occupied Rooms" value={dashboardData.occupied_rooms} />
          <StatCard title="Total Guests" value={dashboardData.total_guests} />
          <StatCard title="Active Bookings" value={dashboardData.active_bookings} />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(dashboardData.total_revenue)}
          />
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[#172B36]">
            Financial Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Payment collection and revenue breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <StatCard title="Total Bills" value={bills.length} />
          <StatCard title="Paid Amount" value={formatCurrency(paidAmount)} />
          <StatCard title="Pending Amount" value={formatCurrency(pendingAmount)} />
          <StatCard title="Room Revenue" value={formatCurrency(roomRevenue)} />
          <StatCard title="Restaurant Revenue" value={formatCurrency(restaurantRevenue)} />
          <StatCard title="Paid Bills" value={paidBills.length} />
        </div>
      </section>

      <section className="premium-card overflow-hidden">
        <div className="p-5 border-b border-[#eae7df]">
          <h2 className="text-xl font-semibold text-[#172B36]">Billing Report</h2>
          <p className="text-sm text-gray-500 mt-1">
            Payment details for all generated bills
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
              </tr>
            </thead>
            <tbody>
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <tr key={bill.id} className="text-center hover:bg-[#FAF9F6]">
                    <td className="p-4 font-semibold">{bill.booking_id}</td>
                    <td className="p-4">{formatCurrency(bill.room_charge)}</td>
                    <td className="p-4">{formatCurrency(bill.restaurant_charge)}</td>
                    <td className="p-4 font-bold text-[#172B36]">
                      {formatCurrency(bill.total_amount)}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No billing records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Reports;
