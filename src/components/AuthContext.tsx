
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User as AppUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            // Fetch the user's profile from the profiles table
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            if (error) throw error;
            
            if (data) {
              // Transform the profile into an AppUser
              const appUser: AppUser = {
                id: data.id,
                name: data.name || currentSession.user.email?.split('@')[0] || 'User',
                email: currentSession.user.email || '',
                role: data.role as any,
                branch: data.branch || undefined,
                subdistrict: data.subdistrict || undefined,
                city: data.city || undefined
              };
              
              setUser(appUser);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session on initial load
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            const appUser: AppUser = {
              id: data.id,
              name: data.name || initialSession.user.email?.split('@')[0] || 'User',
              email: initialSession.user.email || '',
              role: data.role as any,
              branch: data.branch || undefined,
              subdistrict: data.subdistrict || undefined,
              city: data.city || undefined
            };
            
            setUser(appUser);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Logged in successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully! Please check your email for verification.');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      // No toast here as we're redirecting to Google
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      toast.info('Logged out successfully');
    } catch (err: any) {
      console.error('Error logging out:', err);
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        supabaseUser, 
        session, 
        isLoading, 
        error, 
        login, 
        signUp, 
        loginWithGoogle, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
