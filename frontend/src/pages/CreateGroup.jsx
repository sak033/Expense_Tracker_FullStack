import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreate = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      let imageUrl = "";

      // UPLOAD IMAGE TO CLOUDINARY
      if (image) {

        const formData = new FormData();

        formData.append("file", image);
        formData.append("upload_preset", "expense_tracker_groups");

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/Root/image/upload",
          formData
        );

        imageUrl = uploadRes.data.secure_url;
      }

      // CREATE GROUP
      await axios.post(
        "https://expense-tracker-fullstack-sni7.onrender.com/groups",
        {
          name,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Group created successfully ✅");

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to create group ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Group
        </h1>

        {/* GROUP NAME */}
        <input
          type="text"
          placeholder="Enter group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* IMAGE PICKER */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
          className="w-full mb-4"
        />

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-52 object-cover rounded-2xl mb-4"
          />
        )}

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >

          {loading ? "Uploading..." : "Create Group"}
        </button>
      </div>
    </div>
  );
}