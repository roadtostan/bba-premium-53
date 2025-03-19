
import { supabase } from "@/lib/supabase";
import type { Report, ReportStatus } from "@/types";

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
    // Ensure we have a branchId, subdistrictId, and cityId
    if (!reportData.branchId || !reportData.subdistrictId || !reportData.cityId) {
      throw new Error("Data lokasi tidak lengkap. Pastikan branchId, subdistrictId, dan cityId tersedia.");
    }

    // Calculate total sales based on product information if not provided
    const totalSales = reportData.totalSales || reportData.productInfo?.sold || 0;
    
    // Extract branch manager from locationInfo if available
    const branchManager = reportData.locationInfo?.branchManager || "";

    const reportWithSales = {
      ...reportData,
      totalSales: totalSales,
      branch_manager: branchManager, // Map to the database column name
      status: reportData.status || "draft",
    };

    const { data, error } = await supabase
      .from("reports")
      .insert(reportWithSales)
      .select()
      .single();

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
    // Fix: Handle type safety for the users object
    let userName = "Unknown User";
    
    if (comment.users) {
      // Check if users is an array and has at least one element
      if (Array.isArray(comment.users) && comment.users.length > 0) {
        // Access the name from the first element if it exists
        userName = comment.users[0]?.name || "Unknown User";
      } else if (typeof comment.users === 'object' && comment.users !== null) {
        // If users is a single object, try to access name directly
        userName = (comment.users as { name?: string }).name || "Unknown User";
      }
    }

    return {
      id: comment.id,
      text: comment.text,
      user_id: comment.user_id,
      user_name: userName,
      created_at: comment.created_at,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}
