
import { supabase } from "@/lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  try {
    // Coba sign in dulu
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;

    // Setelah sign in berhasil, ambil data user dari tabel users menggunakan RPC
    if (authData.user) {
      const { data: userData, error: userError } = await supabase
        .rpc("get_user_data", { user_email: email })
        .single();

      if (userError) {
        await supabase.auth.signOut();
        console.error("User data error:", userError);
        throw new Error("Gagal mengambil data pengguna. Silakan coba lagi.");
      }

      if (!userData) {
        await supabase.auth.signOut();
        throw new Error("Data pengguna tidak ditemukan.");
      }

      return userData;
    }

    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // Gunakan RPC untuk menghindari infinite recursion
      const { data: userData, error } = await supabase
        .rpc("get_user_data", { user_email: session.user.email })
        .single();

      if (error) {
        console.error("Error getting user data:", error);
        await supabase.auth.signOut();
        throw error;
      }

      return userData;
    }

    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}
