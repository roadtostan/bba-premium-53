
export type UserRole =
  | "super_admin"
  | "city_admin"
  | "subdistrict_admin"
  | "branch_user";

export type ReportStatus =
  | "draft"
  | "pending_subdistrict"
  | "pending_city"
  | "approved"
  | "rejected";

export interface User {
  id: string;
  created_at: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
  subdistrict?: string;
  city?: string;
}

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  date: string;
  status: ReportStatus;
  total_sales: number;
  branch_name: string;
  subdistrict_name: string;
  city_name: string;
  branch_manager: string;
  rejection_reason?: string;
  comments?: ReportComment[];
}

export interface ReportComment {
  id: string;
  text: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface LocationInfo {
  city_name: string;
  subdistrict_name: string;
  branch_name: string;
  branch_manager: string;
}

export interface ProductInfo {
  initial_stock: number;
  remaining_stock: number;
  testers: number;
  rejects: number;
  sold: number;
}

export interface OtherExpense {
  id: string;
  description: string;
  amount: number;
}

export interface ExpenseInfo {
  employee_salary: number;
  employee_bonus: number;
  cooking_oil: number;
  lpg_gas: number;
  plastic_bags: number;
  tissue: number;
  soap: number;
  other_expenses: OtherExpense[];
  total_expenses: number;
}

export interface IncomeInfo {
  cash_receipts: number;
  transfer_receipts: number;
  remaining_income: number;
  total_income: number;
}
