
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

// Function to get report location data - using a direct query instead of RPC
// to avoid infinite recursion in RLS policies
export async function getReportLocationData(reportId: string): Promise<{
  branch_id: string;
  subdistrict_id: string;
  city_id: string;
} | null> {
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
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_report_location_data_safe", {
        p_report_id: reportId
      });
      
      if (rpcError) {
        console.error("Error using RPC for location data:", rpcError);
        return null;
      }
      
      if (!rpcData || !rpcData.branch_id) {
        console.error("No location data retrieved from RPC");
        return null;
      }
      
      console.log("Location data retrieved via RPC:", rpcData);
      return {
        branch_id: rpcData.branch_id,
        subdistrict_id: rpcData.subdistrict_id,
        city_id: rpcData.city_id
      };
    }
    
    if (!data) {
      console.error("No report found with ID:", reportId);
      return null;
    }
    
    console.log("Location data retrieved via direct query:", data);
    return {
      branch_id: data.branch_id,
      subdistrict_id: data.subdistrict_id,
      city_id: data.city_id
    };
  } catch (error) {
    console.error("Error in getReportLocationData:", error);
    return null;
  }
}

// Function to delete report
export async function deleteReport(reportId: string) {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);

  if (error) {
    throw new Error("Gagal menghapus laporan: " + error.message);
  }
}
