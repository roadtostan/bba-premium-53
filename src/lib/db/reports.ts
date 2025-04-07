import { supabase } from "@/lib/supabase";
import type { Report, ReportStatus } from "@/types";

// Fungsi helper untuk transformasi data
function transformReportData(report: any): Report {
  console.log("Raw report data:", report); // Tambahkan log untuk melihat data mentah

  return {
    ...report,
    totalSales: Number(report.total_income) || 0, // Gunakan total_income sebagai totalSales
    branchName: report.branch_name,
    subdistrictName: report.subdistrict_name,
    cityName: report.city_name,
    branchManager: report.branch_manager,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    rejectionReason: report.rejection_reason,
    productInfo: {
      initialStock: Number(report.initial_stock) || 0,
      remainingStock: Number(report.remaining_stock) || 0,
      testers: Number(report.testers) || 0,
      rejects: Number(report.rejects) || 0,
      sold: Number(report.sold) || 0,
    },
    expenseInfo: {
      employeeSalary: Number(report.employee_salary) || 0,
      employeeBonus: Number(report.employee_bonus) || 0,
      cookingOil: Number(report.cooking_oil) || 0,
      lpgGas: Number(report.lpg_gas) || 0,
      plasticBags: Number(report.plastic_bags) || 0,
      tissue: Number(report.tissue) || 0,
      soap: Number(report.soap) || 0,
      otherExpenses: report.other_expenses || [],
      totalExpenses: Number(report.total_expenses) || 0,
    },
    incomeInfo: {
      cashReceipts: Number(report.cash_receipts) || 0,
      transferReceipts: Number(report.transfer_receipts) || 0,
      remainingIncome: Number(report.remaining_income) || 0,
      totalIncome: Number(report.total_income) || 0,
    },
    locationInfo: {
      cityName: report.city_name || "",
      districtName: report.subdistrict_name || "",
      branchName: report.branch_name || "",
      branchManager: report.branch_manager || "",
    },
  };
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
  return reports.map(transformReportData);
}

// Fungsi untuk mendapatkan single report by ID
export async function getReportById(reportId: string) {
  try {
    // Get report data from RPC
    const { data: report, error: reportError } = await supabase.rpc(
      "get_report_detail",
      {
        p_report_id: reportId,
      }
    );

    if (reportError) {
      console.error("Error fetching report detail:", reportError);
      throw reportError;
    }

    if (!report) {
      throw new Error("Report not found");
    }

    // Get comments using RPC to avoid infinite recursion
    const { data: comments, error: commentsError } = await supabase.rpc(
      "get_report_comments",
      {
        p_report_id: reportId,
      }
    );

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw commentsError;
    }

    // Transform report data and include comments
    const transformedReport = transformReportData({
      ...report,
      comments: comments || [],
    });

    console.log("Transformed report with comments:", transformedReport);
    return transformedReport;
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

    console.log("Raw user reports data:", reports); // Tambahkan log ini
    return (reports || []).map(transformReportData);
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

// Update fungsi canCreateNewReport untuk menggunakan checkCanCreateReport
export async function canCreateNewReport(userId: string): Promise<boolean> {
  try {
    return await checkCanCreateReport(userId);
  } catch (error) {
    console.error("Error in canCreateNewReport:", error);
    return false;
  }
}

// Fungsi untuk mengecek apakah user bisa membuat laporan baru
export async function checkCanCreateReport(userId: string): Promise<boolean> {
  try {
    // Menggunakan RPC untuk menghindari masalah policy
    const { data, error } = await supabase.rpc("check_can_create_report", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error checking pending reports:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in checkCanCreateReport:", error);
    return false;
  }
}

// Update fungsi canEditReport untuk menggunakan RPC
export async function canEditReport(
  userId: string,
  reportId: string
): Promise<boolean> {
  try {
    console.log(`Checking edit permissions for report ${reportId} and user ${userId}`);
    
    // Using an RPC call to check if user can edit this report
    const { data, error } = await supabase.rpc("can_edit_report", {
      p_user_id: userId,
      p_report_id: reportId,
    });

    if (error) {
      console.error("Error checking edit permission:", error);
      return false;
    }

    console.log("RPC can_edit_report result:", data);
    return !!data;
  } catch (error) {
    console.error("Error in canEditReport:", error);
    return false;
  }
}

export async function createReport(reportData: any) {
  try {
    // Ensure we have required location IDs
    if (
      !reportData.branch_id ||
      !reportData.subdistrict_id ||
      !reportData.city_id
    ) {
      throw new Error(
        "Data lokasi tidak lengkap. Pastikan branch_id, subdistrict_id, dan city_id tersedia."
      );
    }

    // Menggunakan RPC untuk menghindari masalah policy
    const { data, error } = await supabase.rpc("create_report", {
      p_title: reportData.title,
      p_content: reportData.content,
      p_date: reportData.date,
      p_status: reportData.status,
      p_branch_id: reportData.branch_id,
      p_subdistrict_id: reportData.subdistrict_id,
      p_city_id: reportData.city_id,
      p_branch_manager: reportData.branch_manager,
      p_initial_stock: reportData.initial_stock,
      p_remaining_stock: reportData.remaining_stock,
      p_testers: reportData.testers,
      p_rejects: reportData.rejects,
      p_sold: reportData.sold,
      p_employee_salary: reportData.employee_salary,
      p_employee_bonus: reportData.employee_bonus,
      p_cooking_oil: reportData.cooking_oil,
      p_lpg_gas: reportData.lpg_gas,
      p_plastic_bags: reportData.plastic_bags,
      p_tissue: reportData.tissue,
      p_soap: reportData.soap,
      p_other_expenses: reportData.other_expenses,
      p_total_expenses: reportData.total_expenses,
      p_cash_receipts: reportData.cash_receipts,
      p_transfer_receipts: reportData.transfer_receipts,
      p_total_income: reportData.total_income,
      p_remaining_income: reportData.remaining_income,
    });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}

export async function updateReport(reportId: string, reportData: any) {
  try {
    // Ensure we have required location IDs
    if (
      !reportData.branch_id ||
      !reportData.subdistrict_id ||
      !reportData.city_id
    ) {
      throw new Error(
        "Data lokasi tidak lengkap. Pastikan branch_id, subdistrict_id, dan city_id tersedia."
      );
    }

    // Menggunakan RPC untuk menghindari masalah policy
    const { data, error } = await supabase.rpc("update_report", {
      p_report_id: reportId,
      p_title: reportData.title,
      p_content: reportData.content,
      p_date: reportData.date,
      p_status: reportData.status,
      p_branch_id: reportData.branch_id,
      p_subdistrict_id: reportData.subdistrict_id,
      p_city_id: reportData.city_id,
      p_branch_manager: reportData.branch_manager,
      p_initial_stock: reportData.initial_stock,
      p_remaining_stock: reportData.remaining_stock,
      p_testers: reportData.testers,
      p_rejects: reportData.rejects,
      p_sold: reportData.sold,
      p_employee_salary: reportData.employee_salary,
      p_employee_bonus: reportData.employee_bonus,
      p_cooking_oil: reportData.cooking_oil,
      p_lpg_gas: reportData.lpg_gas,
      p_plastic_bags: reportData.plastic_bags,
      p_tissue: reportData.tissue,
      p_soap: reportData.soap,
      p_other_expenses: reportData.other_expenses,
      p_total_expenses: reportData.total_expenses,
      p_cash_receipts: reportData.cash_receipts,
      p_transfer_receipts: reportData.transfer_receipts,
      p_total_income: reportData.total_income,
      p_remaining_income: reportData.remaining_income,
    });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
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

    console.log("Raw pending reports data:", reports); // Tambahkan log ini
    return (reports || []).map(transformReportData);
  } catch (error) {
    console.error("Error in getPendingActionReports:", error);
    return [];
  }
}

// Function to approve a report
export async function approveReport(
  reportId: string,
  currentStatus: ReportStatus
) {
  try {
    // Determine the next status based on current status
    let newStatus: ReportStatus;

    if (currentStatus === "pending_subdistrict") {
      newStatus = "pending_city";
    } else if (currentStatus === "pending_city") {
      newStatus = "approved";
    } else {
      throw new Error("Report cannot be approved from its current status");
    }

    // Menggunakan RPC untuk menghindari masalah policy
    const { data, error } = await supabase.rpc("approve_report", {
      p_report_id: reportId,
      p_new_status: newStatus,
    });

    if (error) {
      console.error("Error approving report:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in approveReport:", error);
    throw error;
  }
}

// Function to reject a report
export async function rejectReport(reportId: string, reason: string) {
  try {
    // Menggunakan RPC untuk menghindari masalah policy
    const { data, error } = await supabase.rpc("reject_report", {
      p_report_id: reportId,
      p_rejection_reason: reason,
    });

    if (error) {
      console.error("Error rejecting report:", error);
      throw error;
    }

    // Transform data sebelum dikembalikan
    return transformReportData(data);
  } catch (error) {
    console.error("Error in rejectReport:", error);
    throw error;
  }
}

// Fungsi untuk menambah komentar pada report
export async function addReportComment(
  reportId: string,
  userId: string,
  text: string
) {
  try {
    const { data: comment, error } = await supabase.rpc("add_report_comment", {
      p_report_id: reportId,
      p_user_id: userId,
      p_text: text,
    });

    if (error) {
      console.error("Error adding comment:", error);
      throw error;
    }

    return {
      id: comment.comment_id,
      text: comment.text,
      user_id: comment.user_id,
      user_name: comment.user_name || "Unknown User",
      created_at: comment.created_at,
    };
  } catch (error) {
    console.error("Error in addReportComment:", error);
    throw error;
  }
}
