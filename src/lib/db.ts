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
    let query = supabase.from("users").select("*").order("name");

    if (filters) {
      if (filters.role) {
        query = query.eq("role", filters.role);
      }
      if (filters.branch) {
        query = query.eq("branch", filters.branch);
      }
      if (filters.subdistrict) {
        query = query.eq("subdistrict", filters.subdistrict);
      }
      if (filters.city) {
        query = query.eq("city", filters.city);
      }
    }

    const { data: users, error } = await query;
    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Anda tidak memiliki izin untuk melihat data pengguna");
      }
      throw error;
    }
    return users;
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
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

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
  const { data: report, error } = await supabase
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
    .eq("id", reportId)
    .single();

  if (error) throw error;
  return report;
}

export async function getReportsByUser(userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) return [];

  let query = supabase.from("reports").select("*");

  switch (user.role) {
    case "branch_user":
      query = query.eq("created_by", userId);
      break;
    case "subdistrict_admin":
      query = query.eq("subdistrict_name", user.subdistrict);
      break;
    case "city_admin":
      query = query.eq("city_name", user.city);
      break;
  }

  const { data: reports } = await query;
  return reports || [];
}

export const getReportsByStatus = async (
  userId: string,
  status: ReportStatus
): Promise<Report[]> => {
  return (await getReportsByUser(userId)).filter((r) => r.status === status);
};

// Update fungsi canCreateNewReport untuk menggunakan Supabase
export async function canCreateNewReport(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (!user || user.role !== "branch_user") return false;

  // Check pending reports
  const { data: pendingReports, error } = await supabase
    .from("reports")
    .select("id")
    .eq("created_by", userId)
    .in("status", ["pending_subdistrict", "pending_city"]);

  if (error) throw error;
  return pendingReports.length === 0;
}

// Update fungsi canEditReport untuk menggunakan Supabase
export async function canEditReport(
  userId: string,
  reportId: string
): Promise<boolean> {
  const [userResponse, reportResponse] = await Promise.all([
    supabase.from("users").select("role").eq("id", userId).single(),
    supabase
      .from("reports")
      .select("created_by, status")
      .eq("id", reportId)
      .single(),
  ]);

  const user = userResponse.data;
  const report = reportResponse.data;

  if (!user || !report) return false;
  if (user.role !== "branch_user" || report.created_by !== userId) return false;

  return report.status === "draft" || report.status === "rejected";
}

export async function createReport(reportData: Partial<Report>) {
  const { data, error } = await supabase
    .from("reports")
    .insert(reportData)
    .select()
    .single();

  if (error) throw error;
  return data;
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

// Update fungsi getPendingActionReports untuk menggunakan Supabase
export async function getPendingActionReports(userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("role, subdistrict, city")
    .eq("id", userId)
    .single();

  if (!user) return [];

  let query = supabase.from("reports").select("*");

  switch (user.role) {
    case "subdistrict_admin":
      query = query
        .eq("subdistrict_name", user.subdistrict)
        .eq("status", "pending_subdistrict");
      break;
    case "city_admin":
      query = query.eq("city_name", user.city).eq("status", "pending_city");
      break;
    default:
      return [];
  }

  const { data: reports } = await query;
  return reports || [];
}

// Fungsi untuk menambah komentar pada report
export async function addReportComment(
  reportId: string,
  userId: string,
  text: string
) {
  const { data: user } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      report_id: reportId,
      text,
      user_id: userId,
      user_name: user.name,
    })
    .select()
    .single();

  if (error) throw error;
  return comment;
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (error) throw error;
    return userData;
  }

  return null;
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
