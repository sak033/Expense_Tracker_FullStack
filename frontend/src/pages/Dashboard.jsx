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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {groups.map((group) => (

    <div
      key={group.id}
      onClick={() => navigate(`/groups/${group.id}`)}
      className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-xl"
    >

      {/* IMAGE */}
      <img
        src={
          group.imageUrl ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
        }
        alt="group"
        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* CONTENT */}
      <div className="absolute bottom-0 p-5 text-white w-full">

        <h2 className="text-2xl font-bold">
          {group.name}
        </h2>

        <p className="text-sm opacity-90 mt-1">
          {group.memberCount} members
        </p>

        <div className="mt-4 inline-flex items-center text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          Open Group →
        </div>
      </div>
    </div>
  ))}
</div>
    )}

  </div>
);
}