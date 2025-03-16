
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';
import { toast } from 'sonner';

export async function fetchUserProfile(userId: string): Promise<AppUser | null> {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Direct query from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }
    
    if (profileData) {
      console.log('Profile fetched successfully:', profileData);
      
      const appUser: AppUser = {
        id: profileData.id,
        name: profileData.name || 'User',
        email: profileData.email || '',
        role: profileData.role as any,
        branch: profileData.branch || undefined,
        subdistrict: profileData.subdistrict || undefined,
        city: profileData.city || undefined
      };
      
      return appUser;
    }
    
    return null;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
}

export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    toast.success('Logged in successfully');
    return { data, error: null };
  } catch (err: any) {
    toast.error(err.message);
    return { data: null, error: err.message };
  }
}

export async function signUpWithEmailPassword(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    
    toast.success('Account created successfully! Please check your email for verification.');
    return { data, error: null };
  } catch (err: any) {
    toast.error(err.message);
    return { data: null, error: err.message };
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.info('Logged out successfully');
    return { error: null };
  } catch (err: any) {
    console.error('Error logging out:', err);
    toast.error('Error logging out');
    return { error: err.message };
  }
}
