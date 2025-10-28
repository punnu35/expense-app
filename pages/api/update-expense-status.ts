import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { id, status, comments } = req.body;
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { error } = await supabase
      .from("expenses")
      .update({ status, comments })
      .eq("id", id);

    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
