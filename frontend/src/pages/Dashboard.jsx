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
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 sm:px-6 py-6">
    <div className="max-w-7xl mx-auto">

    {/* HEADER */}
{/* HEADER */}
<div className="flex items-start justify-between mb-10">

  {/* LEFT */}
  <div>
    <p className="text-sm text-gray-500 font-medium mb-1">
      Welcome back 👋
    </p>

    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
      {localStorage.getItem("name")}
    </h1>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-4">

    {/* PROFILE ICON */}
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
      {localStorage.getItem("name")?.charAt(0)}
    </div>
</div>
{/* BUTTON */}
    <button
      onClick={() => navigate("/create-group")}
      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300 font-semibold text-lg"
    >
      + New Group
    </button>
</div>
    {/* CONTENT */}
    {loading ? (
      <div className="flex justify-center items-center h-[60vh]">
  <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
</div>
    ) : groups.length === 0 ? (

      /* EMPTY STATE */
      <div className="flex flex-col items-center justify-center mt-24 text-center">

  <div className="text-7xl mb-4">
    🌍
  </div>

  <h2 className="text-3xl font-bold text-gray-800">
    No groups yet
  </h2>

  <p className="text-gray-500 mt-3 max-w-sm">
    Start tracking trips, outings, and shared expenses beautifully.
  </p>

  <button
    onClick={() => navigate("/create-group")}
    className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-2xl shadow-xl hover:scale-105 transition duration-300 font-semibold"
  >
    Create Your First Group
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
  </div>
);
}