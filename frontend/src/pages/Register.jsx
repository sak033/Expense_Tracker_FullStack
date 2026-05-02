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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-100 to-green-200">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-3 p-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="UPI ID"
          className="w-full mb-4 p-2 border rounded-lg"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          Register
        </button>

        <p
          className="text-sm text-center mt-3 text-blue-500 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}