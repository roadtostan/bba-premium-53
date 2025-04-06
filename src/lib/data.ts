import { supabase } from "@/lib/supabase";

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
  canEditReport,
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
