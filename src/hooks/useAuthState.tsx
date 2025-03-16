
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser } from '@/types';

export function useAuthState() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add a safety timeout to prevent infinite loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        // If still loading after 10 seconds, reset loading state
        console.log('Auth loading timeout reached, resetting loading state');
        setIsLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return {
    user,
    setUser,
    supabaseUser,
    setSupabaseUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
