import { useState } from "react";
import axios from "axios";

export default function CreateGroup() {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      await axios.post(
        "https://expense-tracker-fullstack-sni7.onrender.com/groups",
        {
          name: name,
          members: [
            { id: parseInt(userId) } // 👈 VERY IMPORTANT
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Group created ✅");
      setName("");

    } catch (err) {
      console.error(err);
      alert("Error creating group ❌");
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={handleCreate}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create
      </button>
    </div>
  );
}