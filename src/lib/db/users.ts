
import { supabase } from "@/lib/supabase";

// Fungsi untuk mendapatkan semua users
export async function getUsers(filters?: {
  role?: string;
  branch?: string;
  subdistrict?: string;
  city?: string;
}) {
  try {
    // Gunakan RPC untuk menghindari infinite recursion
    const { data: users, error } = await supabase.rpc("get_users_data");

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Anda tidak memiliki izin untuk melihat data pengguna");
      }
      throw error;
    }

    // Terapkan filter di sisi client jika ada
    let filteredUsers = users;
    if (filters) {
      filteredUsers = users.filter((user) => {
        if (filters.role && user.role !== filters.role) return false;
        if (filters.branch && user.branch !== filters.branch) return false;
        if (filters.subdistrict && user.subdistrict !== filters.subdistrict)
          return false;
        if (filters.city && user.city !== filters.city) return false;
        return true;
      });
    }

    return filteredUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Fungsi untuk mendapatkan user by ID
export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return user;
}

// Fungsi untuk update user
export async function updateUser(
  userId: string,
  userData: {
    name: string;
    role: string;
    branch?: string;
    subdistrict?: string;
    city?: string;
  }
) {
  try {
    // Validasi role
    const validRoles = [
      "super_admin",
      "city_admin",
      "subdistrict_admin",
      "branch_user",
    ];
    if (!validRoles.includes(userData.role)) {
      throw new Error("Role tidak valid");
    }

    const { data, error } = await supabase.rpc("update_user_data", {
      p_user_id: userId,
      p_name: userData.name,
      p_role: userData.role,
      p_branch: userData.branch,
      p_subdistrict: userData.subdistrict,
      p_city: userData.city,
    });

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(
          "Anda tidak memiliki izin untuk mengubah data pengguna ini"
        );
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Fungsi untuk delete user
export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Anda tidak memiliki izin untuk menghapus pengguna");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
}
