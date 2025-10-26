import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  if (!session || session.user.id !== ADMIN_USER_ID) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (req.method === "POST") {
    const { expenseId } = req.body;

    const { data, error } = await supabase
      .from("expenses")
      .update({ status: "paid" })
      .eq("id", expenseId)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
