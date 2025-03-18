import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmail, signOut, getCurrentUser } from "@/lib/db";
import type { User } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        if (mounted) {
          setUser(userData as User);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        if (mounted) {
          // Jangan set user ke null jika terjadi error
          // Ini mencegah redirect ke login saat refresh
          setError("Gagal memuat data pengguna");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await signInWithEmail(email, password);
      setUser(userData as User);
      toast.success("Berhasil masuk");
    } catch (err) {
      setError("Login gagal. Periksa email dan password Anda.");
      console.error("Login error:", err);
      toast.error("Login gagal. Periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.info("Berhasil keluar");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Gagal keluar dari sistem");
    }
  };

  // Jika masih loading, tampilkan loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
