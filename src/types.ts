
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
  branchId: string;
  branchName: string;
  subdistrictId: string;
  subdistrictName: string;
  cityId: string;
  cityName: string;
  branchManager: string;
  rejection_reason?: string;
  createdBy?: string;
  comments?: ReportComment[];
  locationInfo: LocationInfo;
  productInfo: ProductInfo;
  expenseInfo: ExpenseInfo;
  incomeInfo: IncomeInfo;
}

export interface ReportComment {
  id: string;
  text: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface LocationInfo {
  cityName: string;
  districtName: string;
  branchName: string;
  branchManager: string;
}

export interface ProductInfo {
  initialStock: number;
  remainingStock: number;
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
  employeeSalary: number;
  employeeBonus: number;
  cookingOil: number;
  lpgGas: number;
  plasticBags: number;
  tissue: number;
  soap: number;
  otherExpenses: OtherExpense[];
  totalExpenses: number;
}

export interface IncomeInfo {
  cashReceipts: number;
  transferReceipts: number;
  remainingIncome: number;
  totalIncome: number;
}
