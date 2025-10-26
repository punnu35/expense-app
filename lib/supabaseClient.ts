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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
//console.log(supabaseUrl);
//console.log(serviceRoleKey);
// Server/Admin client

export const supabaseAdmin = createClient( "https://trmltfhnqueidtcvjrtq.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWx0ZmhucXVlaWR0Y3ZqcnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxNjU0MCwiZXhwIjoyMDc2ODkyNTQwfQ.4qN1K96NEqUyMuGbsItoGXvMPDpILXYKzRD4ADlEqS4",
  {   auth: {
        autoRefreshToken: true, // Prevents automatic token refresh for admin operations
        persistSession: true,   // Prevents session persistence for admin operations
      },
  }
);
