import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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


const fetchMembers = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `http://localhost:8080/groups/${id}/members`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  setMembers(res.data);
};

const fetchExpenses = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `http://localhost:8080/expenses/group/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setExpenses(res.data);
};



  useEffect(() => {
    fetchData();
     fetchMembers();
     fetchExpenses();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Fetch balances
      const balanceRes = await axios.get(
        `http://localhost:8080/groups/${id}/balances`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Fetch settlements
      const settleRes = await axios.get(
        `http://localhost:8080/groups/${id}/settle`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBalances(balanceRes.data);
      setSettlements(settleRes.data);
    } catch (err) {
      console.error("Error fetching group data", err);
    }
  };

  const handleAddExpense = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8080/expenses",
      {
        amount: parseFloat(amount),
        paidByName: paidBy,
        groupId: id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Expense added");

    setShowForm(false);
    setAmount("");
    setPaidBy("");

    fetchData(); // 🔥 refresh balances

  } catch (err) {
    console.error("Error adding expense", err);
  }
};

const handlePay = async (s) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://localhost:8080/groups/${id}/payment-qr?to=${s.to}&amount=${s.amount}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const imageUrl = URL.createObjectURL(res.data);

    window.open(imageUrl);

  } catch (err) {
    console.error("QR error", err);
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Group Details</h1>

      <button
  onClick={() => setShowForm(true)}
  className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
>
  + Add Expense
</button>
{showForm && (
  <div className="mb-6 bg-white p-4 rounded shadow">
    <input
      type="number"
      placeholder="Amount"
      className="w-full mb-2 p-2 border rounded"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
    />

    <select
  className="w-full mb-2 p-2 border rounded"
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

    <button
      onClick={handleAddExpense}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Submit
    </button>
  </div>
)}

      {/* 🔥 BALANCES */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Balances</h2>

        {Object.keys(balances).length === 0 ? (
          <p>No data</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(balances).map(([name, amount]) => (
              <li
                key={name}
                className="p-2 bg-white rounded shadow flex justify-between"
              >
                <span>{name === currentUser ? "You" : name}</span>
                <span
                  className={
                    amount > 0
                      ? "text-green-600"
                      : amount < 0
                      ? "text-red-600"
                      : ""
                  }
                >
                  {amount > 0
  ? `gets ₹${amount}`
  : amount < 0
  ? `owes ₹${Math.abs(amount)}`
  : "settled"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔥 SETTLEMENT */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Settlement</h2>

        {settlements.length === 0 ? (
          <p>No settlements</p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((s, index) => (
  <li
    key={index}
    className="p-2 bg-white rounded shadow flex justify-between items-center"
  >
    <span>
      {s.from === currentUser ? "You" : s.from} pays {s.to === currentUser ? "You" : s.to} ₹{s.amount}
    </span>

    {s.from === currentUser && (
  <button
    onClick={() => handlePay(s)}
    className="bg-green-500 text-white px-3 py-1 rounded"
  >
    Pay
  </button>
)}
  </li>
))}
          </ul>
        )}
      </div>

      <div className="mt-6">
  <h2 className="text-lg font-semibold mb-2">Expenses</h2>

  {expenses.length === 0 ? (
    <p>No expenses yet</p>
  ) : (
    <ul className="space-y-2">
      {expenses.map((exp) => (
        <li key={exp.id} className="p-3 bg-white rounded shadow">
          <div className="font-medium">
            ₹{exp.amount} paid by {exp.paidBy.name}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
}