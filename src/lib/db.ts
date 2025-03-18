// src/lib/db.ts
import { supabase } from "@/lib/supabase";
import type { Report, ReportStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

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

// Fungsi untuk mendapatkan data cities
export async function getCities() {
  const { data: cities, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  if (error) throw error;
  return cities;
}

// Fungsi untuk mendapatkan data subdistricts dengan city
export async function getSubdistricts(cityId?: string) {
  let query = supabase
    .from("subdistricts")
    .select(
      `
      *,
      cities!fk_subdistricts_city (
        name
      )
    `
    )
    .order("name");

  if (cityId) {
    query = query.eq("city_id", cityId);
  }

  const { data: subdistricts, error } = await query;
  if (error) throw error;
  return subdistricts;
}

// Fungsi untuk mendapatkan data branches dengan subdistrict dan city
export async function getBranches(subdistrictId?: string) {
  let query = supabase
    .from("branches")
    .select(
      `
      *,
      subdistricts!branches_subdistrict_id_fkey (
        name,
        cities!fk_subdistricts_city (
          name
        )
      )
    `
    )
    .order("name");

  if (subdistrictId) {
    query = query.eq("subdistrict_id", subdistrictId);
  }

  const { data: branches, error } = await query;
  if (error) throw error;
  return branches;
}

// Fungsi untuk mendapatkan reports dengan filter
export async function getReports(filters?: {
  branchId?: string;
  subdistrictId?: string;
  cityId?: string;
  status?: ReportStatus;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from("reports")
    .select(
      `
      *,
      comments (
        id,
        text,
        user_id,
        user_name,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false });

  if (filters) {
    if (filters.branchId) {
      query = query.eq("branch_id", filters.branchId);
    }
    if (filters.subdistrictId) {
      query = query.eq("subdistrict_id", filters.subdistrictId);
    }
    if (filters.cityId) {
      query = query.eq("city_id", filters.cityId);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("date", filters.endDate);
    }
  }

  const { data: reports, error } = await query;
  if (error) throw error;
  return reports;
}

// Fungsi untuk mendapatkan single report by ID
export async function getReportById(reportId: string) {
  try {
    const { data: report, error } = await supabase.rpc("get_report_detail", {
      p_report_id: reportId,
    });

    if (error) {
      console.error("Error fetching report detail:", error);
      throw error;
    }

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  } catch (error) {
    console.error("Error in getReportById:", error);
    throw error;
  }
}

export async function getReportsByUser(userId: string) {
  try {
    const { data: reports, error } = await supabase.rpc("get_user_reports", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }

    return reports || [];
  } catch (error) {
    console.error("Error in getReportsByUser:", error);
    throw error;
  }
}

export const getReportsByStatus = async (
  userId: string,
  status: ReportStatus
): Promise<Report[]> => {
  return (await getReportsByUser(userId)).filter((r) => r.status === status);
};

// Update fungsi canCreateNewReport untuk menggunakan RPC
export async function canCreateNewReport(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("can_create_new_report", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error checking create permission:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in canCreateNewReport:", error);
    return false;
  }
}

// Update fungsi canEditReport untuk menggunakan RPC
export async function canEditReport(
  userId: string,
  reportId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("can_edit_report", {
      p_user_id: userId,
      p_report_id: reportId,
    });

    if (error) {
      console.error("Error checking edit permission:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in canEditReport:", error);
    return false;
  }
}

export async function createReport(reportData: Partial<Report>) {
  try {
    const { data, error } = await supabase
      .from("reports")
      .insert({
        ...reportData,
        branch_manager: ((await getCurrentUser()) as { id: string })?.id,
        status: reportData.status || "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}

export async function updateReport(
  reportId: string,
  reportData: Partial<Report>
) {
  const { data, error } = await supabase
    .from("reports")
    .update(reportData)
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update fungsi getPendingActionReports untuk menggunakan RPC
export async function getPendingActionReports(userId: string) {
  try {
    const { data: reports, error } = await supabase.rpc(
      "get_pending_action_reports",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Error fetching pending reports:", error);
      return [];
    }

    return reports || [];
  } catch (error) {
    console.error("Error in getPendingActionReports:", error);
    return [];
  }
}

// Fungsi untuk menambah komentar pada report
export async function addReportComment(
  reportId: string,
  userId: string,
  text: string
) {
  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        report_id: reportId,
        text,
        user_id: userId,
      })
      .select(
        `
        id,
        text,
        user_id,
        created_at,
        users!comments_user_id_fkey (
          name
        )
      `
      )
      .single();

    if (error) throw error;

    // Transform data structure to match expected format
    return {
      id: comment.id,
      text: comment.text,
      user_id: comment.user_id,
      user_name: comment.users[0].name,
      created_at: comment.created_at,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
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

// Fungsi untuk menambah city baru
export async function createCity(cityData: { name: string }) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newCity = {
      id: uuidv4(),
      name: cityData.name,
    };

    const { data, error } = await supabase
      .from("cities")
      .insert(newCity)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Kota dengan nama tersebut sudah ada.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create city error:", error);
    throw error;
  }
}

// Fungsi untuk update city
export async function updateCity(cityId: string, cityData: { name: string }) {
  const { data, error } = await supabase
    .from("cities")
    .update(cityData)
    .eq("id", cityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete city
export async function deleteCity(cityId: string) {
  const { error } = await supabase.from("cities").delete().eq("id", cityId);

  if (error) throw error;
}

// Fungsi untuk menambah subdistrict baru
export async function createSubdistrict(subdistrictData: {
  name: string;
  city_id: string;
}) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newSubdistrict = {
      id: uuidv4(),
      name: subdistrictData.name,
      city_id: subdistrictData.city_id,
    };
    const { data, error } = await supabase
      .from("subdistricts")
      .insert(newSubdistrict)
      .select(
        `
        *,
        cities!fk_subdistricts_city (
          name
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Kecamatan dengan nama tersebut sudah ada.");
      } else if (error.code === "23503") {
        throw new Error("Kota yang dipilih tidak valid.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create subdistrict error:", error);
    throw error;
  }
}

// Fungsi untuk update subdistrict
export async function updateSubdistrict(
  subdistrictId: string,
  subdistrictData: {
    name: string;
    city_id: string;
  }
) {
  const { data, error } = await supabase
    .from("subdistricts")
    .update(subdistrictData)
    .eq("id", subdistrictId)
    .select(
      `
      *,
      cities!fk_subdistricts_city (
        name
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete subdistrict
export async function deleteSubdistrict(subdistrictId: string) {
  const { error } = await supabase
    .from("subdistricts")
    .delete()
    .eq("id", subdistrictId);

  if (error) throw error;
}

// Fungsi untuk menambah branch baru
export async function createBranch(branchData: {
  name: string;
  subdistrict_id: string;
}) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newBranch = {
      id: uuidv4(),
      name: branchData.name,
      subdistrict_id: branchData.subdistrict_id,
    };
    const { data, error } = await supabase
      .from("branches")
      .insert(newBranch)
      .select(
        `
        *,
        subdistricts!branches_subdistrict_id_fkey (
          name,
          cities!fk_subdistricts_city (
            name
          )
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Cabang dengan nama tersebut sudah ada.");
      } else if (error.code === "23503") {
        throw new Error("Kecamatan yang dipilih tidak valid.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create branch error:", error);
    throw error;
  }
}

// Fungsi untuk update branch
export async function updateBranch(
  branchId: string,
  branchData: {
    name: string;
    subdistrict_id: string;
  }
) {
  const { data, error } = await supabase
    .from("branches")
    .update(branchData)
    .eq("id", branchId)
    .select(
      `
      *,
      subdistricts!branches_subdistrict_id_fkey (
        name,
        cities!fk_subdistricts_city (
          name
        )
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete branch
export async function deleteBranch(branchId: string) {
  const { error } = await supabase.from("branches").delete().eq("id", branchId);

  if (error) throw error;
}

// Fungsi untuk test koneksi Supabase
export async function testSupabaseConnection() {
  try {
    // Test koneksi dasar dengan query sederhana
    const { data, error } = await supabase.from("cities").select("id").limit(1);

    if (error) {
      console.error("Koneksi error:", error);
      return {
        connected: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
      };
    }

    // Test write permission
    const testData = { name: "TEST_CITY_" + Date.now() };
    const { error: writeError } = await supabase
      .from("cities")
      .insert(testData);

    if (writeError) {
      return {
        connected: true,
        canRead: true,
        canWrite: false,
        error: writeError.message,
        details: {
          code: writeError.code,
          hint: writeError.hint,
          details: writeError.details,
        },
      };
    }

    // Hapus data test
    await supabase.from("cities").delete().eq("name", testData.name);

    return {
      connected: true,
      canRead: true,
      canWrite: true,
    };
  } catch (error) {
    console.error("Test connection error:", error);
    return {
      connected: false,
      error: error.message,
    };
  }
}
