export type UserRole =
  | "branch_user"
  | "subdistrict_admin"
  | "city_admin"
  | "super_admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
  subdistrict?: string;
  city?: string;
  created_at: string;
}

export type ReportStatus =
  | "draft"
  | "pending_subdistrict"
  | "pending_city"
  | "approved"
  | "rejected";

export interface Report {
  id: string;
  title: string;
  content: string;
  date: string;
  total_sales: number;
  status: ReportStatus;
  branch_name: string;
  subdistrict_name: string;
  city_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  comments?: Array<{
    id: string;
    text: string;
    user_id: string;
    user_name: string;
    created_at: string;
  }>;
}
