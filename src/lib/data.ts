
import { supabase } from "@/integrations/supabase/client";

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCities,
  getSubdistricts,
  getBranches,
  getReports,
  getReportById,
  getReportsByUser,
  getReportsByStatus,
  canCreateNewReport,
  createReport,
  updateReport,
  getPendingActionReports,
  findUserByEmail,
  addReportComment,
  createCity,
  updateCity,
  deleteCity,
  createSubdistrict,
  updateSubdistrict,
  deleteSubdistrict,
  createBranch,
  updateBranch,
  deleteBranch,
  testSupabaseConnection,
  signInWithEmail,
  signOut,
  getCurrentUser,
  approveReport,
  rejectReport,
} from "./db";

// Function to check if a user can edit a specific report
export async function canEditReport(userId: string, reportId: string): Promise<boolean> {
  try {
    // Get the report details
    const { data: report, error } = await supabase
      .from("reports")
      .select(`
        *,
        branch:branch_id(name),
        subdistrict:subdistrict_id(name),
        city:city_id(name)
      `)
      .eq("id", reportId)
      .single();
    
    if (error) {
      console.error("Error fetching report:", error);
      return false;
    }
    
    if (!report) {
      console.error("Report not found");
      return false;
    }
    
    // Get user details 
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user:", userError);
      return false;
    }
    
    if (!user) {
      return false;
    }
    
    // Super admin can edit any report
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Subdistrict admin can edit reports in their subdistrict
    if (
      user.role === 'subdistrict_admin' &&
      user.subdistrict === report.subdistrict.name
    ) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in canEditReport:", error);
    return false;
  }
}

// Fungsi untuk menghapus laporan
export async function deleteReport(reportId: string) {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);

  if (error) {
    throw new Error("Gagal menghapus laporan: " + error.message);
  }
}
