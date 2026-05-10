import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateGroup() {
  const [name, setName] = useState("");
 const navigate = useNavigate();
 const [image, setImage] = useState(null);

const handleCreate = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "https://expense-tracker-fullstack-sni7.onrender.com/groups",
      {
        name: name
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Group created ✅");

    navigate("/dashboard"); // 👈 REDIRECT

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