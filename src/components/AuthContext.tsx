
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User as AppUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import {
  fetchUserProfile,
  loginWithEmailPassword,
  signUpWithEmailPassword,
  logoutUser
} from '@/services/authService';
import { createDemoAccount } from '@/services/demoService';

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  createDemoAccount: (role: 'branch_user' | 'subdistrict_admin' | 'city_admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
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
  } = useAuthState();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            const profile = await fetchUserProfile(currentSession.user.id);
            
            if (profile) {
              console.log('Setting user profile:', profile);
              setUser(profile);
            } else {
              console.error('No profile found for user:', currentSession.user.id);
              setUser(null);
            }
            
            if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
              window.location.href = '/';
            }
          } catch (error) {
            console.error('Error setting up user after auth state change:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth...');
        
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log('Found initial session:', initialSession.user.id);
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          
          const profile = await fetchUserProfile(initialSession.user.id);
          if (profile) {
            console.log('Setting initial user profile:', profile);
            setUser(profile);
          } else {
            console.error('No profile found for initial user:', initialSession.user.id);
            setUser(null);
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
  }, [setUser, setSupabaseUser, setSession, setIsLoading]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await loginWithEmailPassword(email, password);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signUpWithEmailPassword(email, password, name);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
  };
  
  const handleCreateDemoAccount = async (role: 'branch_user' | 'subdistrict_admin' | 'city_admin') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await createDemoAccount(role);
      if (error) setError(error);
    } finally {
      setIsLoading(false);
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
        logout,
        createDemoAccount: handleCreateDemoAccount
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
