import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function GroupDetails() {
  const { id } = useParams();

  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const currentUser = localStorage.getItem("name");

  // ---------------- FETCH ----------------

  const fetchMembers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `https://expense-tracker-fullstack-sni7.onrender.com/groups/${id}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMembers(res.data);
  };

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `https://expense-tracker-fullstack-sni7.onrender.com/expenses/group/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setExpenses(res.data);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const balanceRes = await axios.get(
        `https://expense-tracker-fullstack-sni7.onrender.com/groups/${id}/balances`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const settleRes = await axios.get(
        `https://expense-tracker-fullstack-sni7.onrender.com/groups/${id}/settle`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBalances(balanceRes.data);
      setSettlements(settleRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMembers();
    fetchExpenses();
  }, []);

  // ---------------- ACTIONS ----------------

  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://expense-tracker-fullstack-sni7.onrender.com/expenses",
        {
          amount: parseFloat(amount),
          paidByName: paidBy,
          groupId: id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Expense added");

      setShowForm(false);
      setAmount("");
      setPaidBy("");

      fetchData();
      fetchExpenses();
    } catch (err) {
      toast.error("Error adding expense");
    }
  };

 const handlePay = async (amount, settlementId) => {
  console.log("PAY CLICKED:", settlementId);

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `https://expense-tracker-fullstack-sni7.onrender.com/payments/create-order?amount=${amount}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { orderId, amount: amt } = res.data;

    // 🔥 STORE ID SAFELY
    const currentSettlementId = settlementId;

    const options = {
      key: "rzp_test_Sk7y3P0HIOOJbN",
      amount: amt * 100,
      currency: "INR",
      name: "Expense Tracker",
      description: "Settlement Payment",
      order_id: orderId,

      handler: async function (response) {
        const token = localStorage.getItem("token");

        console.log("VERIFYING settlement:", currentSettlementId);

        await axios.post(
          "https://expense-tracker-fullstack-sni7.onrender.com/payments/verify",
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            settlementId: currentSettlementId, // 🔥 FIXED
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Payment successful");
        fetchData();
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    toast.error("Payment failed");
  }
};

  const addMember = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = prompt("Enter user ID:");

      await axios.post(
        `https://expense-tracker-fullstack-sni7.onrender.com/groups/${id}/add-member/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Member added");
      fetchMembers();
    } catch {
      toast.error("Error adding member");
    }
  };

  // ---------------- UI ----------------

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">

    {/* TOP HEADER */}
    <div className="relative h-72 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-80"></div>

      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Group Details
        </h1>

        <p className="text-gray-200 text-lg">
          Manage expenses, settlements & members
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 mt-8">

          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
          >
            + Add Expense
          </button>

          <button
            onClick={addMember}
            className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 rounded-2xl font-semibold hover:bg-white/20 transition"
          >
            + Add Member
          </button>
        </div>
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* BALANCES */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Balances
            </h2>

            <div className="space-y-3">

              {Object.entries(balances).map(([name, amount]) => (
                <div
                  key={name}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition"
                >
                  <div>
                    <p className="font-medium text-lg">
                      {name === currentUser ? "You" : name}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`font-semibold text-lg ${
                        amount > 0
                          ? "text-green-400"
                          : amount < 0
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {amount > 0
                        ? `gets ₹${amount}`
                        : amount < 0
                        ? `owes ₹${Math.abs(amount)}`
                        : "settled"}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* SETTLEMENTS */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Settlements
            </h2>

            {settlements.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                All balances settled 🎉
              </div>
            ) : (
              <div className="space-y-4">

                {settlements.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/10 transition"
                  >
                    <div>
                      <p className="text-lg font-medium">
                        {s.from === currentUser ? "You" : s.from}
                        <span className="text-gray-400"> pays </span>
                        {s.to === currentUser ? "You" : s.to}
                      </p>

                      <p className="text-green-400 font-bold mt-1 text-xl">
                        ₹{s.amount}
                      </p>
                    </div>

                    {s.from === currentUser && (
                      <button
                        onClick={() => handlePay(s.amount, s.id)}
                        className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-2xl font-semibold transition hover:scale-105"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* MEMBERS */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Members
            </h2>

            <div className="space-y-3">

              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between hover:bg-white/10 transition"
                >
                  <p className="font-medium">
                    {member.name}
                  </p>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* EXPENSES */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Expenses
            </h2>

            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">

              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-2">

                    <p className="text-2xl font-bold text-green-400">
                      ₹{exp.amount}
                    </p>

                    <div className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                      Expense
                    </div>
                  </div>

                  <p className="text-gray-300">
                    Paid by{" "}
                    <span className="font-semibold text-white">
                      {exp.paidBy.name}
                    </span>
                  </p>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>

    {/* MODAL */}
    {showForm && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">

          <h2 className="text-2xl font-bold mb-6">
            Add Expense
          </h2>

          <input
            type="number"
            placeholder="Enter amount"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4 outline-none focus:border-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select payer</option>

            {members.map((user) => (
              <option
                key={user.id}
                value={user.name}
                className="text-black"
              >
                {user.name}
              </option>
            ))}
          </select>

          <div className="flex gap-3">

            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-semibold transition"
            >
              Cancel
            </button>

            <button
              onClick={handleAddExpense}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl font-semibold transition"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}