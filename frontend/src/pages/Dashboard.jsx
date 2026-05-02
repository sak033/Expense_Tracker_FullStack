import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const [groups, setGroups] = useState([]);
const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      
      console.log("TOKEN:", token); 
      const res = await axios.get("https://expense-tracker-fullstack-sni7.onrender.com/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

     

      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Groups</h1>
      
      {groups.length === 0 ? (
        <p>No groups found</p>
        
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={()=> navigate(`/groups/${group.id}`)}
              className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-100"
            >
              <h2 className="text-lg font-semibold">
                {group.name}
              </h2>

              <p className="text-sm text-gray-500">
               Members: {group.memberCount}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
  onClick={() => navigate("/create-group")}
  className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
>
  + Create Group
</button>
    </div>
  );
}