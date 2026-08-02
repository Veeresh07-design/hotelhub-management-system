import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardCard from "../components/DashboardCard";
import Layout from "../components/Layout";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        console.log(response.data);

        setDashboardData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return <h1 className="text-center mt-10 text-2xl">Loading...</h1>;
  }

  return (
    <Layout>
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Rooms"
          value={dashboardData.total_rooms}
        />

        <DashboardCard
          title="Available Rooms"
          value={dashboardData.available_rooms}
        />

        <DashboardCard
          title="Occupied Rooms"
          value={dashboardData.occupied_rooms}
        />

        <DashboardCard
          title="Total Guests"
          value={dashboardData.total_guests}
        />

        <DashboardCard
          title="Active Bookings"
          value={dashboardData.active_bookings}
        />

        <DashboardCard
          title="Total Revenue"
          value={`₹${dashboardData.total_revenue}`}
        />
      </div>
    </Layout>
  );
}

export default Dashboard;