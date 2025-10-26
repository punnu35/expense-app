import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "POST") {
    const { description, amount, receipt_url } = req.body;

    if (!description || !amount) return res.status(400).json({ error: "Missing fields" });
    console.log(session.user.id);
    const { data, error } = await supabase
      .from("expenses")
      .insert([{
        user_id: session.user.id,
        description,
        amount,
        receipt_url,
        status: "pending"
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
