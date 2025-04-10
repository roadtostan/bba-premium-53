
import { getCurrentUser, signInWithEmail, signOut } from "./auth";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  findUserByEmail,
} from "./users";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  getSubdistricts,
  createSubdistrict,
  updateSubdistrict,
  deleteSubdistrict,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "./locations";
import {
  getReports,
  getReportById,
  getReportsByUser,
  getReportsByStatus,
  canCreateNewReport,
  createReport,
  updateReport,
  getPendingActionReports,
  addReportComment,
  approveReport,
  rejectReport,
} from "./reports";

import { testSupabaseConnection } from "./utils";

// Import the canEditReport function directly from data.ts
import { canEditReport } from "../data";

export {
  // Auth
  getCurrentUser,
  signInWithEmail,
  signOut,
  
  // Users
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  findUserByEmail,
  
  // Locations
  getCities,
  createCity,
  updateCity,
  deleteCity,
  getSubdistricts,
  createSubdistrict,
  updateSubdistrict,
  deleteSubdistrict,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  
  // Reports
  getReports,
  getReportById,
  getReportsByUser,
  getReportsByStatus,
  canCreateNewReport,
  createReport,
  updateReport,
  getPendingActionReports,
  addReportComment,
  approveReport,
  rejectReport,
  canEditReport,
  
  // Utils
  testSupabaseConnection,
};
