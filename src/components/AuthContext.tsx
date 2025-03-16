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
    setError
  } = useAuthState();

  const [profileLoadAttempted, setProfileLoadAttempted] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setProfileLoadAttempted(false);
          const appUser = await fetchUserProfile(currentSession.user.id);
          
          if (appUser) {
            setUser(appUser);
            
            if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
              window.location.href = '/';
            }
          } else {
            const basicUser: AppUser = {
              id: currentSession.user.id,
              name: currentSession.user.user_metadata.name || currentSession.user.email?.split('@')[0] || 'User',
              email: currentSession.user.email || '',
              role: 'branch_user'
            };
            
            setUser(basicUser);
            
            try {
              await supabase.from('profiles').upsert({
                id: currentSession.user.id,
                name: basicUser.name,
                email: basicUser.email,
                role: basicUser.role
              });
              
              toast.success('Profile updated');
              
              if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
                window.location.href = '/';
              }
            } catch (err) {
              console.error('Error updating profile:', err);
            }
          }
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            window.location.href = '/login';
          }
        }
        
        setIsLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          
          const appUser = await fetchUserProfile(initialSession.user.id);
          if (appUser) {
            setUser(appUser);
          } else if (!profileLoadAttempted) {
            setProfileLoadAttempted(true);
            
            const basicUser: AppUser = {
              id: initialSession.user.id,
              name: initialSession.user.user_metadata.name || initialSession.user.email?.split('@')[0] || 'User',
              email: initialSession.user.email || '',
              role: 'branch_user'
            };
            
            setUser(basicUser);
            
            try {
              await supabase.from('profiles').upsert({
                id: initialSession.user.id,
                name: basicUser.name,
                email: basicUser.email,
                role: basicUser.role
              });
              
              console.log('Profile created/updated for user:', initialSession.user.id);
            } catch (err) {
              console.error('Error updating profile:', err);
            }
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
  }, [setUser, setSupabaseUser, setSession, setIsLoading, profileLoadAttempted, setProfileLoadAttempted]);

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
