import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, Users } from "lucide-react";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter group name");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      let imageUrl = "";

      // Upload image to Cloudinary
      if (image) {
        const formData = new FormData();

        formData.append("file", image);
        formData.append("upload_preset", "expense_tracker_groups");

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dqe3gchpd/image/upload",
          formData
        );

        imageUrl = uploadRes.data.secure_url;
      }

      // Create group
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

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-400/30">
            <Users size={38} className="text-blue-300" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Create Group
          </h1>

          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            Start managing expenses with your friends & family
          </p>
        </div>

        {/* GROUP NAME */}
        <div className="mb-6">
          <label className="block text-gray-200 mb-2 text-sm font-medium">
            Group Name
          </label>

          <input
            type="text"
            placeholder="Goa Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* IMAGE PICKER */}
        <div className="mb-6">
          <label className="block text-gray-200 mb-2 text-sm font-medium">
            Group Image
          </label>

          <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition overflow-hidden">

            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <Upload size={40} className="mb-3" />
                <p className="font-medium">
                  Click to upload image
                </p>
                <span className="text-sm text-gray-400 mt-1">
                  PNG, JPG, JPEG
                </span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className={`w-full py-3 rounded-2xl font-semibold text-white transition-all duration-300 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Group...
            </div>
          ) : (
            "Create Group"
          )}
        </button>
      </div>
    </div>
  );
}