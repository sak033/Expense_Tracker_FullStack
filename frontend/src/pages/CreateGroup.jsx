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

      // CLOUDINARY UPLOAD
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

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-xl p-6 sm:p-8">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-green-100 flex items-center justify-center mb-5 shadow-sm">

            <Users
              size={38}
              className="text-green-600"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Create Group
          </h1>

          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Create a group and start tracking shared expenses
          </p>
        </div>

        {/* GROUP NAME */}
        <div className="mb-6">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Group Name
          </label>

          <input
            type="text"
            placeholder="Goa Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        {/* IMAGE PICKER */}
        <div className="mb-8">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Group Image
          </label>

          <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition overflow-hidden">

            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">

                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Upload
                    size={28}
                    className="text-green-600"
                  />
                </div>

                <p className="font-semibold text-gray-700">
                  Upload Group Image
                </p>

                <span className="text-sm text-gray-400 mt-1">
                  PNG, JPG or JPEG
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
          className={`w-full py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:scale-[1.01] active:scale-[0.99]"
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