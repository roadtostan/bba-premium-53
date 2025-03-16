
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';
import { toast } from 'sonner';

export async function fetchUserProfile(userId: string): Promise<AppUser | null> {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Try direct query first - more reliable than RPC
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Direct profile fetch failed:', profileError);
      
      // Fallback: Try RPC if direct query fails
      const { data, error } = await supabase
        .rpc('get_profile_by_id', { user_id: userId });
      
      if (error) {
        console.error('RPC profile fetch also failed:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const profile = data[0];
        console.log('Profile fetched via RPC:', profile);
        
        // Transform the profile into an AppUser
        const appUser: AppUser = {
          id: profile.id,
          name: profile.name || 'User',
          email: profile.email || '',
          role: profile.role as any,
          branch: profile.branch || undefined,
          subdistrict: profile.subdistrict || undefined,
          city: profile.city || undefined
        };
        
        return appUser;
      }
      
      return null;
    }
    
    if (profileData) {
      console.log('Profile fetched directly:', profileData);
      
      // Transform the profile into an AppUser
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
    console.error('Error fetching user profile:', error);
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

export async function loginWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) throw error;
    
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
    window.location.href = '/login';
    return { error: null };
  } catch (err: any) {
    console.error('Error logging out:', err);
    toast.error('Error logging out');
    return { error: err.message };
  }
}
