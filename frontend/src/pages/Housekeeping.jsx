
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [staffNames, setStaffNames] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/housekeeping");
      setTasks(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load housekeeping tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAssign = async (taskId) => {
    const staff = staffNames[taskId]?.trim();

    if (!staff) {
      alert("Please enter a staff name.");
      return;
    }

    try {
      await api.put(`/housekeeping/${taskId}/assign`, {
        assigned_to: staff,
      });
      alert("Staff assigned successfully!");
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to assign staff.");
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await api.put(`/housekeeping/${taskId}/status`, { status });
      alert(`Task marked as ${status}!`);
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to update status.");
    }
  };

  const pendingCount = tasks.filter((task) => task.status === "Pending").length;
  const progressCount = tasks.filter((task) => task.status === "In Progress").length;
  const completedCount = tasks.filter((task) => task.status === "Completed").length;

  const StatCard = ({ title, count, color }) => (
    <div className="premium-card p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-3 ${color}`}>{count}</h2>
    </div>
  );

  const statusStyle = (status) => {
    if (status === "Pending") return "bg-amber-100 text-amber-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold premium-heading">
          Housekeeping
        </h1>
        <p className="text-gray-500 mt-2">
          Manage room cleaning tasks and housekeeping staff.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Tasks" count={tasks.length} color="text-[#172B36]" />
        <StatCard title="Pending" count={pendingCount} color="text-amber-600" />
        <StatCard title="In Progress" count={progressCount} color="text-blue-600" />
        <StatCard title="Completed" count={completedCount} color="text-green-600" />
      </div>

      <div className="premium-card overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-[#eae7df]">
          <div>
            <h2 className="text-xl font-semibold text-[#172B36]">
              Housekeeping Tasks
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Assign staff and track cleaning progress
            </p>
          </div>
          <button onClick={fetchTasks} className="premium-button">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading housekeeping tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No housekeeping tasks available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full premium-table text-sm">
              <thead>
                <tr>
                  <th className="p-4 text-center">Task ID</th>
                  <th className="p-4 text-center">Room No</th>
                  <th className="p-4 text-center">Room Type</th>
                  <th className="p-4 text-center">Assigned Staff</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="text-center hover:bg-[#FAF9F6]">
                    <td className="p-4 font-semibold">{task.id}</td>
                    <td className="p-4 font-semibold">{task.room_number}</td>
                    <td className="p-4">{task.room_type}</td>
                    <td className="p-4">
                      {task.assigned_to || (
                        <span className="text-gray-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {task.status !== "Completed" ? (
                        <div className="flex flex-col gap-2 min-w-40 max-w-48 mx-auto">
                          <input
                            type="text"
                            placeholder="Staff name"
                            value={staffNames[task.id] ?? task.assigned_to ?? ""}
                            onChange={(e) =>
                              setStaffNames({
                                ...staffNames,
                                [task.id]: e.target.value,
                              })
                            }
                            className="border border-[#ddd8cc] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                          />

                          <button
                            onClick={() => handleAssign(task.id)}
                            className="bg-[#C5A46D] text-[#172B36] px-3 py-2 rounded-lg font-semibold hover:bg-[#D4B781]"
                          >
                            Assign Staff
                          </button>

                          {task.status === "Pending" && (
                            <button
                              onClick={() => handleStatusUpdate(task.id, "In Progress")}
                              disabled={!task.assigned_to && !staffNames[task.id]?.trim()}
                              className="bg-[#203641] text-white px-3 py-2 rounded-lg hover:bg-[#172B36] disabled:opacity-50"
                            >
                              Start Cleaning
                            </button>
                          )}

                          {task.status === "In Progress" && (
                            <button
                              onClick={() => handleStatusUpdate(task.id, "Completed")}
                              className="bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800"
                            >
                              Complete Cleaning
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-green-700 font-semibold">
                          Cleaning Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Housekeeping;
