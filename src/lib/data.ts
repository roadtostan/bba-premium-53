import { User, Report, ReportStatus } from "@/types";

// Mock Users
export const users: User[] = [
  {
    id: "u1",
    name: "John Branch",
    email: "branch1@bolabolaayam.com",
    role: "branch_user",
    branch: "Branch A",
    subdistrict: "North District",
    city: "Metro City"
  },
  {
    id: "u2",
    name: "Sarah Branch",
    email: "branch2@bolabolaayam.com",
    role: "branch_user",
    branch: "Branch B",
    subdistrict: "South District",
    city: "Metro City"
  },
  {
    id: "u3",
    name: "Mike Admin",
    email: "subdistrict@bolabolaayam.com",
    role: "subdistrict_admin",
    subdistrict: "North District",
    city: "Metro City"
  },
  {
    id: "u4",
    name: "Jane Admin",
    email: "city@bolabolaayam.com",
    role: "city_admin",
    city: "Metro City"
  },
  {
    id: "u5",
    name: "Super Admin",
    email: "admin@bolabolaayam.com",
    role: "super_admin"
  }
];

// Branch, Subdistrict, and City data
export const branches = [
  { id: "b1", name: "Branch A", subdistrictId: "sd1" },
  { id: "b2", name: "Branch B", subdistrictId: "sd2" }
];

export const subdistricts = [
  { id: "sd1", name: "North District", cityId: "c1" },
  { id: "sd2", name: "South District", cityId: "c1" }
];

export const cities = [
  { id: "c1", name: "Metro City" }
];

// Mock Reports
export const reports: Report[] = [
  {
    id: "r1",
    title: "Weekly Sales Report - Branch A",
    date: "2023-06-01",
    content: "This week we had a 15% increase in chicken ball sales.",
    totalSales: 12500,
    status: "approved",
    branchId: "b1",
    branchName: "Branch A",
    subdistrictId: "sd1",
    subdistrictName: "North District",
    cityId: "c1",
    cityName: "Metro City",
    createdBy: "u1",
    createdAt: "2023-06-01T10:30:00Z",
    updatedAt: "2023-06-02T14:20:00Z",
    comments: [
      {
        id: "c1",
        text: "Great job on the sales increase!",
        userId: "u3",
        userName: "Mike Admin",
        timestamp: "2023-06-01T16:45:00Z"
      }
    ],
    locationInfo: {
      cityName: "Metro City",
      districtName: "North District",
      branchName: "Branch A",
      branchManager: "John Branch"
    },
    productInfo: {
      initialStock: 100,
      remainingStock: 20,
      testers: 3,
      rejects: 2,
      sold: 75
    },
    expenseInfo: {
      employeeSalary: 1000000,
      employeeBonus: 200000,
      cookingOil: 50000,
      lpgGas: 75000,
      plasticBags: 25000,
      tissue: 15000,
      soap: 10000,
      otherExpenses: [
        { id: "oe1", description: "Equipment maintenance", amount: 100000 }
      ],
      totalExpenses: 1475000
    },
    incomeInfo: {
      cashReceipts: 1500000,
      transferReceipts: 500000,
      remainingIncome: 525000,
      totalIncome: 2000000
    }
  },
  {
    id: "r2",
    title: "Monthly Sales Report - Branch A",
    date: "2023-05-31",
    content: "May monthly sales summary with 10% growth compared to April.",
    totalSales: 45000,
    status: "pending_city",
    branchId: "b1",
    branchName: "Branch A",
    subdistrictId: "sd1",
    subdistrictName: "North District",
    cityId: "c1",
    cityName: "Metro City",
    createdBy: "u1",
    createdAt: "2023-05-31T09:15:00Z",
    updatedAt: "2023-06-01T11:10:00Z",
    locationInfo: {
      cityName: "Metro City",
      districtName: "North District",
      branchName: "Branch A",
      branchManager: "John Branch"
    },
    productInfo: {
      initialStock: 500,
      remainingStock: 50,
      testers: 5,
      rejects: 10,
      sold: 435
    },
    expenseInfo: {
      employeeSalary: 5000000,
      employeeBonus: 1000000,
      cookingOil: 200000,
      lpgGas: 300000,
      plasticBags: 100000,
      tissue: 80000,
      soap: 50000,
      otherExpenses: [
        { id: "oe1", description: "Advertising", amount: 250000 },
        { id: "oe2", description: "Equipment repair", amount: 150000 }
      ],
      totalExpenses: 7130000
    },
    incomeInfo: {
      cashReceipts: 5000000,
      transferReceipts: 4500000,
      remainingIncome: 2370000,
      totalIncome: 9500000
    }
  },
  {
    id: "r3",
    title: "Weekly Sales Report - Branch B",
    date: "2023-06-01",
    content: "This week sales were slightly down due to renovations.",
    totalSales: 9800,
    status: "pending_subdistrict",
    branchId: "b2",
    branchName: "Branch B",
    subdistrictId: "sd2",
    subdistrictName: "South District",
    cityId: "c1",
    cityName: "Metro City",
    createdBy: "u2",
    createdAt: "2023-06-01T11:45:00Z",
    updatedAt: "2023-06-01T11:45:00Z",
    locationInfo: {
      cityName: "Metro City",
      districtName: "South District",
      branchName: "Branch B",
      branchManager: "Sarah Branch"
    },
    productInfo: {
      initialStock: 80,
      remainingStock: 30,
      testers: 2,
      rejects: 1,
      sold: 47
    },
    expenseInfo: {
      employeeSalary: 900000,
      employeeBonus: 0,
      cookingOil: 40000,
      lpgGas: 60000,
      plasticBags: 20000,
      tissue: 15000,
      soap: 10000,
      otherExpenses: [
        { id: "oe1", description: "Renovation expenses", amount: 500000 }
      ],
      totalExpenses: 1545000
    },
    incomeInfo: {
      cashReceipts: 800000,
      transferReceipts: 650000,
      remainingIncome: -95000,
      totalIncome: 1450000
    }
  },
  {
    id: "r4",
    title: "Monthly Sales Report - Branch B",
    date: "2023-05-31",
    content: "May monthly report shows steady performance.",
    totalSales: 38500,
    status: "rejected",
    branchId: "b2",
    branchName: "Branch B",
    subdistrictId: "sd2",
    subdistrictName: "South District",
    cityId: "c1",
    cityName: "Metro City",
    createdBy: "u2",
    createdAt: "2023-05-31T10:30:00Z",
    updatedAt: "2023-06-01T13:20:00Z",
    rejectionReason: "Please include the breakdown of product categories.",
    locationInfo: {
      cityName: "Metro City",
      districtName: "South District",
      branchName: "Branch B",
      branchManager: "Sarah Branch"
    },
    productInfo: {
      initialStock: 400,
      remainingStock: 40,
      testers: 5,
      rejects: 5,
      sold: 350
    },
    expenseInfo: {
      employeeSalary: 4500000,
      employeeBonus: 750000,
      cookingOil: 180000,
      lpgGas: 250000,
      plasticBags: 90000,
      tissue: 70000,
      soap: 45000,
      otherExpenses: [
        { id: "oe1", description: "Marketing", amount: 300000 }
      ],
      totalExpenses: 6185000
    },
    incomeInfo: {
      cashReceipts: 4000000,
      transferReceipts: 3850000,
      remainingIncome: 1665000,
      totalIncome: 7850000
    }
  },
  {
    id: "r5",
    title: "Draft Report",
    date: "2023-06-02",
    content: "Draft content for upcoming report.",
    totalSales: 0,
    status: "draft",
    branchId: "b1",
    branchName: "Branch A",
    subdistrictId: "sd1",
    subdistrictName: "North District",
    cityId: "c1",
    cityName: "Metro City",
    createdBy: "u1",
    createdAt: "2023-06-02T08:30:00Z",
    updatedAt: "2023-06-02T08:30:00Z",
    locationInfo: {
      cityName: "Metro City",
      districtName: "North District",
      branchName: "Branch A",
      branchManager: "John Branch"
    },
    productInfo: {
      initialStock: 0,
      remainingStock: 0,
      testers: 0,
      rejects: 0,
      sold: 0
    },
    expenseInfo: {
      employeeSalary: 0,
      employeeBonus: 0,
      cookingOil: 0,
      lpgGas: 0,
      plasticBags: 0,
      tissue: 0,
      soap: 0,
      otherExpenses: [],
      totalExpenses: 0
    },
    incomeInfo: {
      cashReceipts: 0,
      transferReceipts: 0,
      remainingIncome: 0,
      totalIncome: 0
    }
  }
];

// Helper function to get reports by user
export const getReportsByUser = (userId: string): Report[] => {
  const user = users.find(u => u.id === userId);
  
  if (!user) return [];
  
  switch (user.role) {
    case "branch_user":
      // Branch users can only see their own reports
      return reports.filter(r => r.createdBy === userId);
      
    case "subdistrict_admin":
      // Subdistrict admins can see all reports in their subdistrict
      return reports.filter(r => r.subdistrictName === user.subdistrict);
      
    case "city_admin":
      // City admins can see all reports in their city
      return reports.filter(r => r.cityName === user.city);
      
    default:
      return [];
  }
};

// Helper function to get reports by status
export const getReportsByStatus = (userId: string, status: ReportStatus): Report[] => {
  return getReportsByUser(userId).filter(r => r.status === status);
};

// Helper function to check if a user can create a new report
export const canCreateNewReport = (userId: string): boolean => {
  const user = users.find(u => u.id === userId);
  
  if (!user || user.role !== "branch_user") return false;
  
  // Check if there are any pending or rejected reports
  const pendingReports = reports.filter(
    r => r.createdBy === userId && 
    (r.status === "pending_subdistrict" || r.status === "pending_city")
  );
  
  return pendingReports.length === 0;
};

// Helper function to check if a user can edit a report
export const canEditReport = (userId: string, reportId: string): boolean => {
  const user = users.find(u => u.id === userId);
  const report = reports.find(r => r.id === reportId);
  
  if (!user || !report) return false;
  
  // Only branch users who created the report can edit it
  if (user.role !== "branch_user" || report.createdBy !== userId) return false;
  
  // Report must be in draft or rejected status to be editable
  return report.status === "draft" || report.status === "rejected";
};

// Get pending reports that require action from a user
export const getPendingActionReports = (userId: string): Report[] => {
  const user = users.find(u => u.id === userId);
  
  if (!user) return [];
  
  switch (user.role) {
    case "subdistrict_admin":
      // Subdistrict admins need to approve reports pending_subdistrict
      return reports.filter(
        r => r.subdistrictName === user.subdistrict && r.status === "pending_subdistrict"
      );
      
    case "city_admin":
      // City admins need to approve reports pending_city
      return reports.filter(
        r => r.cityName === user.city && r.status === "pending_city"
      );
      
    default:
      return [];
  }
};

// Find user by email (for login)
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(u => u.email === email);
};
