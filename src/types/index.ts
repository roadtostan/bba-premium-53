
export type UserRole = "branch_user" | "subdistrict_admin" | "city_admin";

export type ReportStatus = "draft" | "pending_subdistrict" | "pending_city" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  subdistrict?: string;
  city?: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  content: string;
  totalSales: number;
  status: ReportStatus;
  branchId: string;
  branchName: string;
  subdistrictId: string;
  subdistrictName: string;
  cityId: string;
  cityName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  rejectionReason?: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface SalesItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
