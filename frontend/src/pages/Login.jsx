import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://expense-tracker-fullstack-sni7.onrender.com/auth/login", {
        email,
        password,
      });
      console.log(res.data); 
      // ✅ store JWT token
      localStorage.setItem("token", res.data.token);
localStorage.setItem("name", res.data.name);
localStorage.setItem("userId", res.data.id);
      navigate("/dashboard");
      // 👉 next step: redirect to dashboard
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 px-4">
    
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      
      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Welcome Back 👋
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Login to your Expense Tracker
      </p>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">

        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-2 text-gray-400 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Register */}
      <p
        className="text-center text-sm text-blue-500 cursor-pointer hover:underline"
        onClick={() => navigate("/register")}
      >
        Create a new account
      </p>

    </div>
  </div>
);
}