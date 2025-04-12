
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

// Function to check if a user can edit a specific report - avoiding recursion
export async function canEditReport(userId: string, reportId: string): Promise<boolean> {
  try {
    console.log("Checking edit permissions for report:", reportId, "and user:", userId);
    
    // Get user data directly from auth session to avoid recursion
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error("No active session found");
      return false;
    }
    
    // Get the report details with proper error handling
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("status, branch_manager, subdistrict_id, city_id")
      .eq("id", reportId)
      .single();
    
    if (reportError || !report) {
      console.error("Error getting report details:", reportError);
      return false;
    }
    
    // Get user role and location info directly to avoid recursion
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, subdistrict, city")
      .eq("id", userId)
      .single();
    
    if (userError || !userData) {
      console.error("Error getting user data:", userError);
      return false;
    }
    
    const userRole = userData.role;
    
    // Super admin can edit any report
    if (userRole === 'super_admin') {
      return true;
    }
    
    // For subdistrict_admin, specifically check if they are admin of report's subdistrict
    if (userRole === 'subdistrict_admin') {
      // First, get the subdistrict name for the report
      const { data: subdistrict, error: subdistrictError } = await supabase
        .from("subdistricts")
        .select("name")
        .eq("id", report.subdistrict_id)
        .single();
      
      if (subdistrictError || !subdistrict) {
        console.error("Error getting subdistrict name:", subdistrictError);
        return false;
      }
      
      console.log("Checking subdistrict admin permissions:", {
        userSubdistrict: userData.subdistrict,
        reportSubdistrict: subdistrict.name,
        reportStatus: report.status
      });
      
      // Allow subdistrict admins to edit reports in their subdistrict that are not approved
      if (userData.subdistrict === subdistrict.name && report.status !== 'approved') {
        console.log("Subdistrict admin has edit permission");
        return true;
      }
    }
    
    // Branch user can edit their own reports that are in draft or rejected status
    if (userRole === 'branch_user' && 
       report.branch_manager === userId &&
       (report.status === 'draft' || report.status === 'rejected')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in canEditReport:", error);
    return false;
  }
}

// Type definition for the location data response
interface ReportLocationData {
  branch_id: string;
  subdistrict_id: string;
  city_id: string;
}

// Function to get report location data - using a direct query instead of RPC
// to avoid infinite recursion in RLS policies
export async function getReportLocationData(reportId: string): Promise<ReportLocationData | null> {
  try {
    console.log("Getting report location data for report:", reportId);
    
    // Direct query approach
    const { data, error } = await supabase
      .from("reports")
      .select("branch_id, subdistrict_id, city_id")
      .eq("id", reportId)
      .single();
    
    if (error || !data) {
      console.error("Error using direct query for location data:", error);
      return null;
    }
    
    console.log("Location data retrieved via direct query:", data);
    return data as ReportLocationData;
  } catch (error) {
    console.error("Error in getReportLocationData:", error);
    return null;
  }
}

// Function to check if a user can delete a specific report - avoiding recursion
export async function canDeleteReport(userId: string, reportId: string): Promise<boolean> {
  try {
    console.log("Checking delete permissions for report:", reportId, "and user:", userId);
    
    // Get user data directly from auth session to avoid recursion
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error("No active session found");
      return false;
    }
    
    // Get user role directly to avoid recursion
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, subdistrict")
      .eq("id", userId)
      .single();
    
    if (userError || !userData) {
      console.error("Error getting user role:", userError);
      return false;
    }
    
    const userRole = userData.role;
    
    // Super admin can delete any report
    if (userRole === 'super_admin') {
      return true;
    }
    
    // Get the report details
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("status, branch_manager, subdistrict_id")
      .eq("id", reportId)
      .single();
    
    if (reportError || !report) {
      console.error("Error getting report details:", reportError);
      return false;
    }
    
    // If user is subdistrict_admin, check report status and subdistrict
    if (userRole === 'subdistrict_admin') {
      // Get the subdistrict name for the report
      const { data: subdistrict, error: subdistrictError } = await supabase
        .from("subdistricts")
        .select("name")
        .eq("id", report.subdistrict_id)
        .single();
      
      if (subdistrictError || !subdistrict) {
        console.error("Error getting subdistrict name:", subdistrictError);
        return false;
      }
      
      // Subdistrict admin can delete reports in their subdistrict that are NOT approved
      if (userData.subdistrict === subdistrict.name && report.status !== 'approved') {
        return true;
      }
    }
    
    // Branch user can delete their own reports that are in draft or rejected status
    if (userRole === 'branch_user' && 
        report.branch_manager === userId && 
        (report.status === 'draft' || report.status === 'rejected')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in canDeleteReport:", error);
    return false;
  }
}

// Function to delete report
export async function deleteReport(reportId: string) {
  try {
    console.log("Attempting to delete report:", reportId);
    
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      throw new Error("Gagal menghapus laporan: " + error.message);
    }
    
    console.log("Report deleted successfully:", reportId);
    return { success: true };
  } catch (error) {
    console.error("Exception in deleteReport:", error);
    throw error;
  }
}
