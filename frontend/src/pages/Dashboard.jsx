
import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardCard from "../components/DashboardCard";
import Layout from "../components/Layout";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = dashboardData
    ? [
        {
          title: "Total Rooms",
          value: dashboardData.total_rooms,
          icon: "▦",
          color: "gold",
        },
        {
          title: "Available Rooms",
          value: dashboardData.available_rooms,
          icon: "↗",
          color: "green",
        },
        {
          title: "Occupied Rooms",
          value: dashboardData.occupied_rooms,
          icon: "▣",
          color: "red",
        },
        {
          title: "Total Guests",
          value: dashboardData.total_guests,
          icon: "♙",
          color: "blue",
        },
        {
          title: "Active Bookings",
          value: dashboardData.active_bookings,
          icon: "▤",
          color: "gold",
        },
        {
          title: "Total Revenue",
          value: `₹${Number(dashboardData.total_revenue || 0).toLocaleString("en-IN")}`,
          icon: "₹",
          color: "green",
        },
      ]
    : [];

  return (
    <Layout>
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#A18453] uppercase tracking-widest mb-2">
          HotelHub Management
        </p>

        <h1 className="text-3xl md:text-4xl font-bold premium-heading">
          Welcome back, Admin!
        </h1>

        <p className="text-gray-500 mt-2">
          Here's an overview of your hotel's operations.
        </p>
      </div>

      {loading ? (
        <div className="premium-card p-10 text-center text-gray-500">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="premium-card p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="premium-button"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-semibold text-[#172B36]">
                Hotel Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your current operational summary
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {cards.map((card) => (
              <DashboardCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

export default Dashboard;
