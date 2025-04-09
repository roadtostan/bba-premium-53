
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

// Function to check if a user can edit a specific report using the RPC function
export async function canEditReport(userId: string, reportId: string): Promise<boolean> {
  try {
    console.log("Checking edit permissions via RPC for report:", reportId, "and user:", userId);
    
    // Using the RPC function we created in Supabase
    const { data, error } = await supabase.rpc("can_edit_report", {
      p_user_id: userId,
      p_report_id: reportId,
    });
    
    if (error) {
      console.error("Error checking edit permission:", error);
      return false;
    }
    
    console.log("canEditReport result:", data);
    return !!data;
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
    
    // First, try the direct query approach
    const { data, error } = await supabase
      .from("reports")
      .select("branch_id, subdistrict_id, city_id")
      .eq("id", reportId)
      .single();
    
    if (error) {
      console.error("Error using direct query for location data:", error);
      
      // If direct query fails, try using RPC function as fallback
      // Directly access the jsonb object returned by the function
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_report_location_data_safe", {
        p_report_id: reportId
      });
      
      if (rpcError) {
        console.error("Error using RPC for location data:", rpcError);
        return null;
      }
      
      // Validate the returned data
      if (!rpcData || typeof rpcData !== 'object') {
        console.error("Invalid data returned from RPC:", rpcData);
        return null;
      }
      
      // Safely type cast the data
      const locationData = rpcData as unknown as ReportLocationData;
      
      if (!locationData.branch_id) {
        console.error("No branch_id in location data from RPC:", locationData);
        return null;
      }
      
      console.log("Location data retrieved via RPC:", locationData);
      return locationData;
    }
    
    if (!data) {
      console.error("No report found with ID:", reportId);
      return null;
    }
    
    console.log("Location data retrieved via direct query:", data);
    return data as ReportLocationData;
  } catch (error) {
    console.error("Error in getReportLocationData:", error);
    return null;
  }
}

// Function to check if a user can delete a specific report
export async function canDeleteReport(userId: string, reportId: string): Promise<boolean> {
  try {
    console.log("Checking delete permissions for report:", reportId, "and user:", userId);
    
    // First get user role
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting current user:", userError);
      return false;
    }
    
    const { data: userRole, error: roleError } = await supabase.rpc("get_user_role", {
      user_id: userData.user.id
    });
    
    if (roleError) {
      console.error("Error getting user role:", roleError);
      return false;
    }
    
    // Super admin can delete any report
    if (userRole === 'super_admin') {
      return true;
    }
    
    // If user is subdistrict_admin, check report status
    if (userRole === 'subdistrict_admin') {
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select("status")
        .eq("id", reportId)
        .single();
      
      if (reportError) {
        console.error("Error getting report status:", reportError);
        return false;
      }
      
      // Subdistrict admin can't delete approved reports
      return report.status !== 'approved';
    }
    
    // For other roles, use the can_edit_report function as a base permission check
    // This ensures branch users can only delete their own reports in draft/rejected status
    return await canEditReport(userId, reportId);
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
