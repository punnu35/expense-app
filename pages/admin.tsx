import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

interface Expense {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  status: "pending" | "paid";
  created_at: string;
  receipt_url?: string;
  user_email?: string;
}

interface Props {
  expenses: Expense[];
}

export default function AdminDashboard({ expenses: initialExpenses }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const markPaid = async (expenseId: number) => {
    setLoadingIds((prev) => [...prev, expenseId]);

    const res = await fetch("/api/expenses/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenseId }),
    });

    if (res.ok) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expenseId ? { ...e, status: "paid" } : e))
      );
    }

    setLoadingIds((prev) => prev.filter((id) => id !== expenseId));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <table className="min-w-full border bg-white rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">User Email</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Receipt</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="border-b">
              <td className="px-4 py-2">{exp.user_email}</td>
              <td className="px-4 py-2">{exp.description}</td>
              <td className="px-4 py-2">${exp.amount}</td>
              <td className="px-4 py-2">{exp.status}</td>
              <td className="px-4 py-2">
                {exp.receipt_url && (
                  <a
                    href={exp.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View
                  </a>
                )}
              </td>
              <td className="px-4 py-2">{new Date(exp.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2">
                {exp.status === "pending" && (
                  <button
                    onClick={() => markPaid(exp.id)}
                    disabled={loadingIds.includes(exp.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loadingIds.includes(exp.id) ? "Updating..." : "Mark Paid"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Server-side admin check
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  if (!session || session.user.id !== ADMIN_USER_ID) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const { data: expensesData } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  const expensesWithEmails = await Promise.all(
    expensesData!.map(async (exp) => {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(exp.user_id);
        return { ...exp, user_email: userData?.user?.email || exp.user_id };
      } catch {
        return { ...exp, user_email: exp.user_id };
      }
    })
  );

  return { props: { expenses: expensesWithEmails } };
};
