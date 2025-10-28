import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

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
  isAdmin: boolean;
}

export default function AllExpenses({ expenses, isAdmin }: Props) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isAdmin ? "All Expenses (Admin View)" : "My Expenses"}
      </h1>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses found.</p>
      ) : (
        <table className="min-w-full border bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              {isAdmin && <th className="px-4 py-2 border">User Email</th>}
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Receipt</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-b">
                {isAdmin && <td className="px-4 py-2">{exp.user_email}</td>}
                <td className="px-4 py-2">{exp.description}</td>
                <td className="px-4 py-2">${exp.amount}</td>
                <td className="px-4 py-2">{exp.status}</td>
                <td className="px-4 py-2">
                  {exp.receipt_url ? (
                    <a
                      href={exp.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">
                  {new Date(exp.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = session.user.email;
  const isAdmin = userEmail === ADMIN_EMAIL;
  alert(isAdmin)
  // Admin: fetch all expenses
  // User: only their own
  const { data: expensesData, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !expensesData) {
    console.error("Error fetching expenses:", error?.message);
    return { props: { expenses: [], isAdmin } };
  }

  let filteredExpenses = expensesData;
  if (!isAdmin) {
    filteredExpenses = expensesData.filter(
      (exp) => exp.user_id === session.user.id
    );
  }

  // Admin view: show emails
  const expensesWithEmails = await Promise.all(
    filteredExpenses.map(async (exp) => {
      if (isAdmin) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(
            exp.user_id
          );
          return {
            ...exp,
            user_email: userData?.user?.email || exp.user_id,
          };
        } catch {
          return { ...exp, user_email: exp.user_id };
        }
      }
      return exp;
    })
  );

  return {
    props: { expenses: expensesWithEmails, isAdmin },
  };
};
