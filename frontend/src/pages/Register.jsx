import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [upiId, setUpiId] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();
console.log("Register clicked");

    try {
      await axios.post(
        "https://expense-tracker-fullstack-sni7.onrender.com/users",
        {
          name,
          email,
          password,
          upiId,
        }
      );

      alert("Account created successfully ✅");
      navigate("/"); // go back to login
    } catch (err) {
      console.error(err);
      alert("Registration failed ❌");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-200 px-4">
    
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      
      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Create Account!
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Start managing your expenses smartly
      </p>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">

        {/* Name */}
        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* UPI */}
        <div>
          <label className="text-sm text-gray-600">UPI ID</label>
          <input
            type="text"
            placeholder="example@upi"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
        >
          Register
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-2 text-gray-400 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Login */}
      <p
        className="text-center text-sm text-blue-500 cursor-pointer hover:underline"
        onClick={() => navigate("/")}
      >
        Already have an account? Login
      </p>

    </div>
  </div>
);
}