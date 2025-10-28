import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Expense {
  id: string;
  title: string;
  description?: string;
  vendor?: string;
  amount: number;
  date?: string;
  receipts_url?: string[];
  status: "pending" | "approved" | "rejected" | "paid" | "closed";
  created_at?: string;
  user_email?: string;
  user_id: string;
}

export default function ApproverDashboard() {
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const approverEmail = process.env.NEXT_PUBLIC_APPROVER_EMAIL;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      setUser(userData.user);

      if ((userData.user.email !== approverEmail) && (userData.user.email !== adminEmail)) {
        alert("You are not authorized to view this page.");
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching expenses:", error);
      else setExpenses(data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleApproval = async (id: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase
      .from("expenses")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) alert(error.message);
    else
      setExpenses(prev =>
        prev.map(exp =>
          exp.id === id ? { ...exp, status: newStatus } : exp
        )
      );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Approver Dashboard</h1>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No pending or approved expenses found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Vendor</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Receipts</th>
              <th className="border px-4 py-2">User Email</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{exp.title}</td>
                <td className="border px-4 py-2">{exp.description || "-"}</td>
                <td className="border px-4 py-2">{exp.vendor || "-"}</td>
                <td className="border px-4 py-2">${exp.amount}</td>
                <td className="border px-4 py-2">{exp.date || "-"}</td>
                <td className="border px-4 py-2">
                  {exp.receipts_url && exp.receipts_url.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {exp.receipts_url.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View {i + 1}
                          </a>
                        ))}
                      </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-4 py-2">{exp.user_email || "-"}</td>
                <td className="border px-4 py-2">{exp.status}</td>
                <td className="border px-4 py-2 flex flex-col gap-2">
                  {exp.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApproval(exp.id, "approved")}
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(exp.id, "rejected")}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {exp.status === "approved" && (
                    <span className="text-green-700 font-semibold">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
