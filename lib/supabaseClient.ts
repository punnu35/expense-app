import { createClient } from '@supabase/supabase-js';

function getEnvVar(name: string): string {
  const value = process.env[name];
  console.log(value); 
  if (!value) throw new Error(`⚠️ Environment variable "${name}" is missing!`);
  return value;
}

// Frontend client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey1 = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
//console.log(supabaseUrl);
//console.log(serviceRoleKey1);
// Server/Admin client

export const supabaseAdmin = createClient( supabaseUrl, 
  "a",
  {   auth: {
        autoRefreshToken: true, // Prevents automatic token refresh for admin operations
        persistSession: true,   // Prevents session persistence for admin operations
      },
  }
);
