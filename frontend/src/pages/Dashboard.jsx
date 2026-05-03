import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const [groups, setGroups] = useState([]);
const navigate = useNavigate();
const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

   const fetchGroups = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://expense-tracker-fullstack-sni7.onrender.com/groups",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setGroups(res.data);
  } catch (err) {
    console.error("Error fetching groups", err);
  } finally {
    setLoading(false);
  }
};


 
 return (
  <div className="min-h-screen bg-gray-100 px-6 py-6">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome, {localStorage.getItem("name")}
        </p>
      </div>

      <button
        onClick={() => navigate("/create-group")}
        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
      >
        + New Group
      </button>
    </div>

    {/* CONTENT */}
    {loading ? (
      <p className="text-gray-500">Loading groups...</p>
    ) : groups.length === 0 ? (

      /* EMPTY STATE */
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-gray-700">
          No groups yet
        </h2>
        <p className="text-gray-500 mt-2">
          Start by creating your first group
        </p>

        <button
          onClick={() => navigate("/create-group")}
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
        >
          Create Group
        </button>
      </div>

    ) : (

      /* GROUP CARDS */
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => navigate(`/groups/${group.id}`)}
            className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition duration-200"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {group.name}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {group.memberCount} members
            </p>

            <div className="mt-4 text-blue-500 text-sm font-medium">
              View Details →
            </div>
          </div>
        ))}
      </div>
    )}

  </div>
);
}