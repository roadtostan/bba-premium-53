
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * This is a client for our supabase database.
 * We can use this to make queries to our database.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "anon-key"
);

// Update the can_edit_report RPC function if needed
export async function updateCanEditRPCFunction() {
  const { error } = await supabase.rpc('update_can_edit_report_function');
  if (error) {
    console.error('Error updating can_edit_report function:', error);
    return false;
  }
  return true;
}
