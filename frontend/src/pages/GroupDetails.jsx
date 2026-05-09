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
    <div className="min-h-screen bg-gray-100 px-6 py-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Group Details
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
          >
            + Expense
          </button>

          <button
            onClick={addMember}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600"
          >
            + Member
          </button>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

            <input
              type="number"
              placeholder="Amount"
              className="w-full mb-3 p-3 border rounded-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="w-full mb-4 p-3 border rounded-lg"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value="">Select payer</option>
              {members.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCES */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Balances</h2>

        {Object.entries(balances).map(([name, amount]) => (
          <div
            key={name}
            className="bg-white rounded-xl shadow p-4 flex justify-between mb-2"
          >
            <span>{name === currentUser ? "You" : name}</span>

            <span
              className={
                amount > 0
                  ? "text-green-600"
                  : amount < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }
            >
              {amount > 0
                ? `gets ₹${amount}`
                : amount < 0
                ? `owes ₹${Math.abs(amount)}`
                : "settled"}
            </span>
          </div>
        ))}
      </div>

   {/* SETTLEMENTS */}
<div className="mb-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Settlements
  </h2>

  {settlements.length === 0 ? (
    <div className="bg-white rounded-2xl shadow-sm p-5 text-gray-500">
      All balances settled 🎉
    </div>
  ) : (
    settlements.map((s) => (
      <div
        key={s.id}
        className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between mb-3"
      >
        <div>
          <p className="text-gray-800 font-medium">
            {s.from === currentUser ? "You" : s.from}
            {" pays "}
            {s.to === currentUser ? "You" : s.to}
            {" ₹"}
            {s.amount}
          </p>
        </div>

        {s.from === currentUser && (
          <button
            onClick={() => handlePay(s.amount, s.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-medium transition"
          >
            Pay
          </button>
        )}
      </div>
    ))
  )}
</div>

      {/* EXPENSES */}
<div>
  <h2 className="text-xl font-semibold mb-3">Expenses</h2>

  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">

    {expenses.map((exp) => (
      <div
        key={exp.id}
        className="bg-white rounded-xl shadow p-4"
      >
        <p className="font-medium text-lg">
          ₹{exp.amount}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Paid by {exp.paidBy.name}
        </p>
      </div>
    ))}

  </div>
</div>
    </div>
  );
}