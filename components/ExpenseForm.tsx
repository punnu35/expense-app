import { useState } from "react";

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!description || !amount || !receipt) {
      alert("Please fill all fields!");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("amount", amount);
    formData.append("receipt", receipt);

    const res = await fetch("/api/expenses/add", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else {
      setDescription("");
      setAmount("");
      setReceipt(null);
      onExpenseAdded();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md space-y-3 bg-white">
      <h2 className="font-semibold text-lg">Add New Expense</h2>
      <input
        type="text"
        placeholder="Description"
        className="w-full border p-2 rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        className="w-full border p-2 rounded"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="file"
        className="w-full"
        accept="image/*,application/pdf"
        onChange={(e) => setReceipt(e.target.files?.[0] || null)}
      />
      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Add Expense"}
      </button>
    </form>
  );
}
