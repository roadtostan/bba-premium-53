import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { User as AppUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import {
  fetchUserProfile,
  loginWithEmailPassword,
  signUpWithEmailPassword,
  loginWithGoogle,
  logoutUser
} from '@/services/authService';
import { createDemoAccount } from '@/services/demoService';
import { toast } from 'sonner';

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
    setError,
    authInitialized,
    setAuthInitialized
  } = useAuthState();

  const ensureUserProfile = async (currentUser: User) => {
    console.log('Ensuring profile exists for user:', currentUser.id);
    
    try {
      const appUser = await fetchUserProfile(currentUser.id);
      
      if (appUser) {
        console.log('Found existing profile:', appUser);
        setUser(appUser);
        return true;
      }
      
      const basicUser: AppUser = {
        id: currentUser.id,
        name: currentUser.user_metadata.name || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        role: 'branch_user'
      };
      
      setUser(basicUser);
      
      const { error: insertError } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        name: basicUser.name,
        email: basicUser.email,
        role: basicUser.role
      });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
      
      console.log('Basic profile created successfully');
      return true;
    } catch (err) {
      console.error('Error in ensureUserProfile:', err);
      return false;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const success = await ensureUserProfile(currentSession.user);
          
          if (success && event === 'SIGNED_IN' && window.location.pathname === '/login') {
            window.location.href = '/';
          }
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            window.location.href = '/login';
          }
        }
        
        setIsLoading(false);
        setAuthInitialized(true);
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
          
          await ensureUserProfile(initialSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSupabaseUser, setSession, setIsLoading, setAuthInitialized]);

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

  const handleLoginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await loginWithGoogle();
      if (error) setError(error);
    } catch (err) {
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
        loginWithGoogle: handleLoginWithGoogle, 
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
