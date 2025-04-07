
import { createClient } from '@supabase/supabase-js'

// Use the environment variables or fallback to default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tjzxzaabqxutwdknscwh.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqenh6YWFicXh1dHdka25zY3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwOTQ3MTUsImV4cCI6MjA1NzY3MDcxNX0.sPTFXnaUN0i7e0SlP6NXbuGxgzFz0nby85ExjcNSkYY";

/**
 * This is a client for our supabase database.
 * We can use this to make queries to our database.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Update the can_edit_report RPC function if needed
export async function updateCanEditRPCFunction() {
  const { error } = await supabase.rpc('update_can_edit_report_function');
  if (error) {
    console.error('Error updating can_edit_report function:', error);
    return false;
  }
  return true;
}
