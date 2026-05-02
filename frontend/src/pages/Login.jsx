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
      navigate("/dashboard");
      // 👉 next step: redirect to dashboard
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
        <p
  className="text-sm text-center mt-3 text-blue-500 cursor-pointer"
  onClick={() => navigate("/register")}
>
  Create Account
</p>
      </form>
    </div>
  );
}