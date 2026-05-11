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
  <div className="min-h-screen bg-[#f3f4f6]">

    {/* HEADER */}
    <div className="px-4 sm:px-6 pt-6 pb-4">

      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-[32px] p-6 sm:p-8 shadow-xl">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <p className="text-white/80 text-sm sm:text-base mb-2">
              Group Overview 👋
            </p>

            <h1 className="text-3xl sm:text-5xl font-bold text-white">
              Group Details
            </h1>

            <p className="text-white/90 mt-3 text-sm sm:text-base">
              Track expenses, balances & settlements
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-green-600 px-5 py-3 rounded-2xl font-semibold shadow-md hover:scale-[1.03] active:scale-[0.98] transition"
            >
              + Add Expense
            </button>

            <button
              onClick={addMember}
              className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-white/30 transition"
            >
              + Add Member
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-6">

          {/* BALANCES */}
          <div className="bg-white rounded-[28px] shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-[#0f172a]">
                Balances
              </h2>

              <div className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm font-semibold">
                Overview
              </div>
            </div>

            <div className="space-y-4">

              {Object.entries(balances).map(([name, amount]) => (
                <div
                  key={name}
                  className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition"
                >
                  <div>

                    <p className="font-semibold text-lg text-[#0f172a]">
                      {name === currentUser ? "You" : name}
                    </p>

                    <p className="text-gray-500 text-sm mt-1">
                      Current balance status
                    </p>
                  </div>

                  <div>
                    <span
                      className={`font-bold text-lg ${
                        amount > 0
                          ? "text-green-600"
                          : amount < 0
                          ? "text-red-500"
                          : "text-gray-500"
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
          <div className="bg-white rounded-[28px] shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-[#0f172a]">
                Settlements
              </h2>

              <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">
                Payments
              </div>
            </div>

            {settlements.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-10 text-center">

                <div className="text-5xl mb-3">
                  🎉
                </div>

                <p className="text-gray-600 font-medium">
                  All balances are settled
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {settlements.map((s) => (
                  <div
                    key={s.id}
                    className="bg-gray-50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition"
                  >
                    <div>

                      <p className="text-[#0f172a] font-semibold text-lg">
                        {s.from === currentUser ? "You" : s.from}
                        <span className="text-gray-400 font-normal">
                          {" "}pays{" "}
                        </span>
                        {s.to === currentUser ? "You" : s.to}
                      </p>

                      <p className="text-green-600 font-bold text-2xl mt-1">
                        ₹{s.amount}
                      </p>
                    </div>

                    {s.from === currentUser && (
                      <button
                        onClick={() => handlePay(s.amount, s.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-md transition hover:scale-[1.02]"
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
          <div className="bg-white rounded-[28px] shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-[#0f172a]">
                Members
              </h2>

              <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl text-sm font-semibold">
                {members.length} Members
              </div>
            </div>

            <div className="space-y-4">

              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition"
                >
                  <div>

                    <p className="font-semibold text-[#0f172a]">
                      {member.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Group Member
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* EXPENSES */}
          <div className="bg-white rounded-[28px] shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-[#0f172a]">
                Expenses
              </h2>

              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold">
                History
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">

              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">

                    <p className="text-2xl font-bold text-green-600">
                      ₹{exp.amount}
                    </p>

                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                      Expense
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Paid by{" "}
                    <span className="font-semibold text-[#0f172a]">
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">

        <div className="bg-white rounded-[32px] p-6 w-full max-w-md shadow-2xl">

          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">
            Add Expense
          </h2>

          <input
            type="number"
            placeholder="Enter amount"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-green-400"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select payer</option>

            {members.map((user) => (
              <option
                key={user.id}
                value={user.name}
              >
                {user.name}
              </option>
            ))}
          </select>

          <div className="flex gap-3">

            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-semibold text-gray-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleAddExpense}
              className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-2xl font-semibold text-white shadow-md transition"
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