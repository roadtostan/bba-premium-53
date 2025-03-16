
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loginWithEmailPassword } from './authService';

export async function createDemoAccount(role: 'branch_user' | 'subdistrict_admin' | 'city_admin') {
  try {
    const email = `demo-${role}@example.com`;
    const password = 'demo123';
    const name = `Demo ${role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    
    // Check if user already exists by trying to log in
    const { error: loginError } = await loginWithEmailPassword(email, password);
    
    if (!loginError) {
      // Login successful, user exists
      toast.success(`Logged in as ${name}`);
      return { error: null };
    }
    
    // User doesn't exist, create new account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (signUpError) throw signUpError;
    
    if (signUpData?.user) {
      // Update profile with role and location data
      let locationData = {};
      
      if (role === 'subdistrict_admin') {
        locationData = { subdistrict: 'Kebayoran Baru' };
      } else if (role === 'city_admin') {
        locationData = { city: 'Jakarta Selatan' };
      } else if (role === 'branch_user') {
        locationData = { branch: 'Branch 1' };
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, ...locationData })
        .eq('id', signUpData.user.id);
      
      if (updateError) throw updateError;
      
      toast.success(`Created demo account for ${name}`);
      
      // Log in with the new account
      await loginWithEmailPassword(email, password);
    }
    
    return { error: null };
  } catch (err: any) {
    toast.error(`Error creating demo account: ${err.message}`);
    return { error: err.message };
  }
}
