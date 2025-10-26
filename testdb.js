// testDb.js
import { createClient } from '@supabase/supabase-js';

// Make sure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  try {
    // Insert a test row
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('expenses')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // test UUID
        description: 'Test expense',
        amount: 123,
        receipt_url: 'https://example.com/test.pdf',
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }

    console.log('Inserted row:', insertData);

    // Fetch rows
    const { data: rows, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return;
    }

    console.log('Current rows in expenses table:', rows);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDatabase();
