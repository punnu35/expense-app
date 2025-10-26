// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Automatically confirms the user
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ user: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
