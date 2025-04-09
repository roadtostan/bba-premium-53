
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import NavBar from "@/components/NavBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  LocationInfo,
  ProductInfo,
  ExpenseInfo,
  IncomeInfo,
  OtherExpense,
  ReportStatus,
} from "@/types";
import {
  createReport,
  getBranches,
  getSubdistricts,
  getCities,
  getReportById,
  updateReport,
  canEditReport,
  getReportLocationData,
} from "@/lib/data";
import { id as idLocale } from "date-fns/locale";

export default function CreateReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [title, setTitle] = useState("Laporan Penjualan Harian");
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Branch, subdistrict, and city data
  const [branchId, setBranchId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [cityId, setCityId] = useState("");

  // Block I: Location Information
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    cityName: user?.city || "",
    districtName: user?.subdistrict || "",
    branchName: user?.branch || "",
    branchManager: user?.name || "",
  });

  // Block II: Product Information
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    initialStock: 0,
    remainingStock: 0,
    testers: 0,
    rejects: 0,
    sold: 0,
  });

  // Block III: Expense Information
  const [expenseInfo, setExpenseInfo] = useState<ExpenseInfo>({
    employeeSalary: 0,
    employeeBonus: 0,
    cookingOil: 0,
    lpgGas: 0,
    plasticBags: 0,
    tissue: 0,
    soap: 0,
    otherExpenses: [
      { id: "1", description: "", amount: 0 },
      { id: "2", description: "", amount: 0 },
      { id: "3", description: "", amount: 0 },
    ],
    totalExpenses: 0,
  });

  // Block IV: Income Information
  const [incomeInfo, setIncomeInfo] = useState<IncomeInfo>({
    cashReceipts: 0,
    transferReceipts: 0,
    remainingIncome: 0,
    totalIncome: 0,
  });

  // Check edit permission for the report
  useEffect(() => {
    const checkEditPermission = async () => {
      if (isEditMode && id && user) {
        try {
          const hasPermission = await canEditReport(user.id, id);
          console.log("Can edit report:", hasPermission);
          setCanEdit(hasPermission);
          
          if (!hasPermission) {
            toast.error("Anda tidak memiliki izin untuk mengedit laporan ini");
            navigate("/");
          }
        } catch (error) {
          console.error("Error checking edit permission:", error);
          setCanEdit(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        // For new reports, only branch users can create
        setCanEdit(user?.role === "branch_user");
        setIsLoading(false);
      }
    };

    checkEditPermission();
  }, [id, user, isEditMode, navigate]);

  // Fetch branch, subdistrict, and city data for the user
  useEffect(() => {
    const fetchUserLocationData = async () => {
      try {
        if (user && user.branch) {
          // Get branches to find the branch ID
          const branches = await getBranches();
          const userBranch = branches.find((b) => b.name === user.branch);

          if (userBranch) {
            setBranchId(userBranch.id);
            setSubdistrictId(userBranch.subdistrict_id);

            // Get subdistrict to find the city ID
            const subdistricts = await getSubdistricts();
            const userSubdistrict = subdistricts.find(
              (s) => s.id === userBranch.subdistrict_id
            );

            if (userSubdistrict) {
              setCityId(userSubdistrict.city_id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        toast.error("Gagal mengambil data lokasi");
      }
    };

    fetchUserLocationData();
  }, [user]);

  // Fetch report data if in edit mode
  useEffect(() => {
    const fetchReportData = async () => {
      if (isEditMode && id) {
        try {
          const reportData = await getReportById(id);
          console.log("Report data received:", reportData);

          // Set form data from report
          setTitle(reportData?.title ?? "Laporan Penjualan Harian");
          setContent(reportData?.content ?? "");
          setDate(reportData?.date ? new Date(reportData.date) : new Date());

          // Set location info
          setLocationInfo({
            cityName: reportData?.cityName ?? user?.city ?? "",
            districtName:
              reportData?.subdistrictName ?? user?.subdistrict ?? "",
            branchName: reportData?.branchName ?? user?.branch ?? "",
            branchManager: reportData?.branchManager ?? user?.name ?? "",
          });

          // Get location IDs for the report - crucial for edit mode
          if (isEditMode && id) {
            try {
              const locationData = await getReportLocationData(id);
              if (locationData) {
                console.log("Setting location IDs:", locationData);
                setBranchId(locationData.branch_id);
                setSubdistrictId(locationData.subdistrict_id);
                setCityId(locationData.city_id);
              } else {
                console.error("Failed to retrieve location data for report");
                
                // Fallback to using IDs from the report if available
                if (reportData.branch_id && reportData.subdistrict_id && reportData.city_id) {
                  console.log("Using location IDs from report data:", {
                    branch_id: reportData.branch_id,
                    subdistrict_id: reportData.subdistrict_id,
                    city_id: reportData.city_id
                  });
                  setBranchId(reportData.branch_id);
                  setSubdistrictId(reportData.subdistrict_id);
                  setCityId(reportData.city_id);
                } else {
                  toast.error("Gagal mengambil data lokasi laporan");
                }
              }
            } catch (error) {
              console.error("Error fetching report location IDs:", error);
              toast.error("Gagal mengambil data lokasi laporan");
            }
          }

          // Set product info
          setProductInfo({
            initialStock: reportData?.productInfo?.initialStock ?? 0,
            remainingStock: reportData?.productInfo?.remainingStock ?? 0,
            testers: reportData?.productInfo?.testers ?? 0,
            rejects: reportData?.productInfo?.rejects ?? 0,
            sold: reportData?.productInfo?.sold ?? 0,
          });

          // Set expense info
          setExpenseInfo({
            employeeSalary: reportData?.expenseInfo?.employeeSalary ?? 0,
            employeeBonus: reportData?.expenseInfo?.employeeBonus ?? 0,
            cookingOil: reportData?.expenseInfo?.cookingOil ?? 0,
            lpgGas: reportData?.expenseInfo?.lpgGas ?? 0,
            plasticBags: reportData?.expenseInfo?.plasticBags ?? 0,
            tissue: reportData?.expenseInfo?.tissue ?? 0,
            soap: reportData?.expenseInfo?.soap ?? 0,
            otherExpenses: reportData?.expenseInfo?.otherExpenses ?? [
              { id: "1", description: "", amount: 0 },
              { id: "2", description: "", amount: 0 },
              { id: "3", description: "", amount: 0 },
            ],
            totalExpenses: reportData?.expenseInfo?.totalExpenses ?? 0,
          });

          // Set income info
          setIncomeInfo({
            cashReceipts: reportData?.incomeInfo?.cashReceipts ?? 0,
            transferReceipts: reportData?.incomeInfo?.transferReceipts ?? 0,
            remainingIncome: reportData?.incomeInfo?.remainingIncome ?? 0,
            totalIncome: reportData?.incomeInfo?.totalIncome ?? 0,
          });
        } catch (error) {
          console.error("Error fetching report data:", error);
          toast.error("Gagal mengambil data laporan");
        }
      }
    };

    fetchReportData();
  }, [isEditMode, id, user]);

  // Calculate total expenses and income
  useEffect(() => {
    const totalExpenses =
      expenseInfo.employeeSalary +
      expenseInfo.employeeBonus +
      expenseInfo.cookingOil +
      expenseInfo.lpgGas +
      expenseInfo.plasticBags +
      expenseInfo.tissue +
      expenseInfo.soap +
      expenseInfo.otherExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    const totalIncome = incomeInfo.cashReceipts + incomeInfo.transferReceipts;

    const remainingIncome = totalIncome - totalExpenses;

    setExpenseInfo((prev) => ({ ...prev, totalExpenses: totalExpenses }));
    setIncomeInfo((prev) => ({
      ...prev,
      totalIncome: totalIncome,
      remainingIncome: remainingIncome,
    }));
  }, [
    expenseInfo.employeeSalary,
    expenseInfo.employeeBonus,
    expenseInfo.cookingOil,
    expenseInfo.lpgGas,
    expenseInfo.plasticBags,
    expenseInfo.tissue,
    expenseInfo.soap,
    expenseInfo.otherExpenses,
    incomeInfo.cashReceipts,
    incomeInfo.transferReceipts,
  ]);

  // Calculate sold items based on other product info
  useEffect(() => {
    if (productInfo.initialStock >= productInfo.remainingStock) {
      const sold =
        productInfo.initialStock -
        productInfo.remainingStock -
        productInfo.testers -
        productInfo.rejects;
      setProductInfo((prev) => ({ ...prev, sold: sold >= 0 ? sold : 0 }));
    }
  }, [
    productInfo.initialStock,
    productInfo.remainingStock,
    productInfo.testers,
    productInfo.rejects,
  ]);

  // Check user permissions
  if (!user || (user.role !== "branch_user" && user.role !== "subdistrict_admin" && !isEditMode)) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleProductChange = (field: keyof ProductInfo, value: number) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseChange = (
    field: keyof Omit<ExpenseInfo, "otherExpenses" | "totalExpenses">,
    value: number
  ) => {
    setExpenseInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtherExpenseChange = (
    id: string,
    field: "description" | "amount",
    value: string | number
  ) => {
    setExpenseInfo((prev) => ({
      ...prev,
      otherExpenses: prev.otherExpenses.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleIncomeChange = (
    field: keyof Omit<IncomeInfo, "remainingIncome" | "totalIncome">,
    value: number
  ) => {
    setIncomeInfo((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Silakan masukkan judul laporan");
      return false;
    }

    if (!date) {
      toast.error("Silakan pilih tanggal");
      return false;
    }

    if (!content.trim()) {
      toast.error("Silakan masukkan konten laporan");
      return false;
    }

    // Validate product info
    if (productInfo.initialStock < 0 || productInfo.testers > 5) {
      toast.error(
        "Informasi produk tidak valid. Catatan: Tester tidak boleh melebihi 5"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    saveAsDraft: boolean = false
  ) => {
    e.preventDefault();
    setIsDraft(saveAsDraft);

    if (!saveAsDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine status based on user role and whether it's a draft
      let reportStatus: ReportStatus;
      if (saveAsDraft) {
        reportStatus = "draft";
      } else if (user?.role === "branch_user") {
        reportStatus = "pending_subdistrict";
      } else if (user?.role === "subdistrict_admin") {
        // For subdistrict admin, if they're creating a new report, set to pending_city
        // If they're editing an existing report with status pending_subdistrict, it will
        // be changed to pending_city in the updateReport function
        reportStatus = isEditMode ? "pending_subdistrict" : "pending_city";
      } else {
        reportStatus = "pending_subdistrict"; // Default
      }

      console.log("Current IDs before submit:", { branchId, subdistrictId, cityId });
      
      // For edit mode, ensure we're using the location IDs from the database
      let locationIds = {
        branch_id: branchId,
        subdistrict_id: subdistrictId,
        city_id: cityId
      };
      
      if (isEditMode && id) {
        try {
          const locationData = await getReportLocationData(id);
          if (locationData) {
            console.log("Using location IDs from database:", locationData);
            locationIds = locationData;
          } else {
            console.log("No location data returned from database, using current state values");
          }
        } catch (error) {
          console.error("Error fetching report location IDs:", error);
          // Continue with existing IDs if there's an error
        }
      }
      
      // Extra validation to ensure we have location IDs
      if (!locationIds.branch_id || !locationIds.subdistrict_id || !locationIds.city_id) {
        console.error("Missing critical location IDs:", locationIds);
        toast.error("Data lokasi tidak lengkap, mohon refresh halaman dan coba lagi");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare report data with the correct structure matching database columns
      const reportData = {
        title,
        content,
        date: date?.toISOString().split("T")[0], // Format as YYYY-MM-DD
        status: reportStatus,

        // Location IDs - use the values we have
        branch_id: locationIds.branch_id,
        subdistrict_id: locationIds.subdistrict_id,
        city_id: locationIds.city_id,

        // Branch manager info
        branch_manager: isEditMode ? locationInfo.branchManager : user?.id || "",

        // Product information
        initial_stock: productInfo.initialStock,
        remaining_stock: productInfo.remainingStock,
        testers: productInfo.testers,
        rejects: productInfo.rejects,
        sold: productInfo.sold,

        // Expense information
        employee_salary: expenseInfo.employeeSalary,
        employee_bonus: expenseInfo.employeeBonus,
        cooking_oil: expenseInfo.cookingOil,
        lpg_gas: expenseInfo.lpgGas,
        plastic_bags: expenseInfo.plasticBags,
        tissue: expenseInfo.tissue,
        soap: expenseInfo.soap,
        other_expenses: expenseInfo.otherExpenses,
        total_expenses: expenseInfo.totalExpenses,

        // Income information
        cash_receipts: incomeInfo.cashReceipts,
        transfer_receipts: incomeInfo.transferReceipts,
        total_income: incomeInfo.totalIncome,
        remaining_income: incomeInfo.remainingIncome,
      };

      console.log("Sending report data:", reportData);

      if (isEditMode && id) {
        await updateReport(id, reportData);
        toast.success(
          saveAsDraft
            ? "Laporan berhasil diperbarui sebagai draft"
            : "Laporan berhasil diperbarui"
        );
      } else {
        await createReport(reportData);
        toast.success(
          saveAsDraft
            ? "Laporan berhasil disimpan sebagai draft"
            : "Laporan berhasil dikirim"
        );
      }

      navigate("/");
    } catch (error) {
      console.error("Error creating/updating report:", error);
      toast.error(
        "Gagal membuat/memperbarui laporan: " + (error as Error).message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubdistrictAdmin = user?.role === "subdistrict_admin";

  // Subdistrict admins can now edit all fields
  const isFieldReadOnly = (field: string): boolean => {
    // No fields should be read-only anymore
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {isEditMode
              ? "Ubah Laporan Penjualan"
              : "Buat Laporan Penjualan Baru"}
          </h1>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Laporan</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Laporan Penjualan Harian"
                    className={cn("mt-1", isFieldReadOnly("title") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("title")}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Tanggal Laporan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                          (isEditMode || isFieldReadOnly("date")) && "bg-gray-100 cursor-not-allowed"
                        )}
                        disabled={isEditMode || isFieldReadOnly("date")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: idLocale })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    {!isEditMode && !isFieldReadOnly("date") && (
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={idLocale}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Ringkasan Laporan</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Berikan ringkasan laporan Anda..."
                  className={cn("mt-1 h-24", isFieldReadOnly("content") && "bg-gray-100")}
                  readOnly={isFieldReadOnly("content")}
                />
              </div>
            </div>

            {/* Block I: Location Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                Blok I: Informasi Lokasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cityName">Nama Kota</Label>
                  <Input
                    id="cityName"
                    value={locationInfo.cityName}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="subdistrictName">Nama Wilayah</Label>
                  <Input
                    id="subdistrictName"
                    value={locationInfo.districtName}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">Nama Cabang</Label>
                  <Input
                    id="branchName"
                    value={locationInfo.branchName}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="branchManager">Penanggung Jawab Cabang</Label>
                  <Input
                    id="branchManager"
                    value={isEditMode ? locationInfo.branchManager : user?.name || ""}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Block II: Product Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                Blok II: Informasi Produk (dalam item)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="initialStock">Stok Awal</Label>
                  <Input
                    id="initialStock"
                    type="number"
                    min="0"
                    value={productInfo.initialStock || ""}
                    onChange={(e) =>
                      handleProductChange(
                        "initialStock",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("initialStock") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("initialStock")}
                  />
                </div>
                <div>
                  <Label htmlFor="remainingStock">Stok Tersedia</Label>
                  <Input
                    id="remainingStock"
                    type="number"
                    min="0"
                    max={productInfo.initialStock}
                    value={productInfo.remainingStock || ""}
                    onChange={(e) =>
                      handleProductChange(
                        "remainingStock",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("remainingStock") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("remainingStock")}
                  />
                </div>
                <div>
                  <Label htmlFor="testers">Jumlah Tester (maksimal 5)</Label>
                  <Input
                    id="testers"
                    type="number"
                    min="0"
                    max="5"
                    value={productInfo.testers || ""}
                    onChange={(e) =>
                      handleProductChange("testers", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("testers") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("testers")}
                  />
                </div>
                <div>
                  <Label htmlFor="rejects">Jumlah Reject</Label>
                  <Input
                    id="rejects"
                    type="number"
                    min="0"
                    value={productInfo.rejects || ""}
                    onChange={(e) =>
                      handleProductChange("rejects", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("rejects") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("rejects")}
                  />
                </div>
                <div>
                  <Label htmlFor="sold">Jumlah Terjual</Label>
                  <div className="mt-1 py-2 px-3 border border-input rounded-md bg-muted/50">
                    {productInfo.sold}
                  </div>
                </div>
              </div>
            </div>

            {/* Block III: Expense Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                Blok III: Informasi Pengeluaran (dalam rupiah)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeSalary">Gaji Karyawan</Label>
                  <Input
                    id="employeeSalary"
                    type="number"
                    min="0"
                    value={expenseInfo.employeeSalary || ""}
                    onChange={(e) =>
                      handleExpenseChange(
                        "employeeSalary",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("employeeSalary") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("employeeSalary")}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeBonus">Bonus Karyawan</Label>
                  <Input
                    id="employeeBonus"
                    type="number"
                    min="0"
                    value={expenseInfo.employeeBonus || ""}
                    onChange={(e) =>
                      handleExpenseChange(
                        "employeeBonus",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("employeeBonus") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("employeeBonus")}
                  />
                </div>
                <div>
                  <Label htmlFor="cookingOil">Minyak Goreng</Label>
                  <Input
                    id="cookingOil"
                    type="number"
                    min="0"
                    value={expenseInfo.cookingOil || ""}
                    onChange={(e) =>
                      handleExpenseChange("cookingOil", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("cookingOil") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("cookingOil")}
                  />
                </div>
                <div>
                  <Label htmlFor="lpgGas">Gas LPG</Label>
                  <Input
                    id="lpgGas"
                    type="number"
                    min="0"
                    value={expenseInfo.lpgGas || ""}
                    onChange={(e) =>
                      handleExpenseChange("lpgGas", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("lpgGas") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("lpgGas")}
                  />
                </div>
                <div>
                  <Label htmlFor="plasticBags">Kantong Plastik</Label>
                  <Input
                    id="plasticBags"
                    type="number"
                    min="0"
                    value={expenseInfo.plasticBags || ""}
                    onChange={(e) =>
                      handleExpenseChange("plasticBags", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("plasticBags") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("plasticBags")}
                  />
                </div>
                <div>
                  <Label htmlFor="tissue">Tisu</Label>
                  <Input
                    id="tissue"
                    type="number"
                    min="0"
                    value={expenseInfo.tissue || ""}
                    onChange={(e) =>
                      handleExpenseChange("tissue", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("tissue") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("tissue")}
                  />
                </div>
                <div>
                  <Label htmlFor="soap">Sabun</Label>
                  <Input
                    id="soap"
                    type="number"
                    min="0"
                    value={expenseInfo.soap || ""}
                    onChange={(e) =>
                      handleExpenseChange("soap", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("soap") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("soap")}
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium mt-4 mb-2">
                Pengeluaran Lainnya
              </h3>
              {expenseInfo.otherExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                >
                  <div>
                    <Label htmlFor={`expense-desc-${expense.id}`}>
                      Deskripsi {index + 1}
                    </Label>
                    <Input
                      id={`expense-desc-${expense.id}`}
                      value={expense.description}
                      onChange={(e) =>
                        handleOtherExpenseChange(
                          expense.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Deskripsi pengeluaran"
                      className={cn("mt-1", isFieldReadOnly(`expense-desc-${index}`) && "bg-gray-100")}
                      readOnly={isFieldReadOnly(`expense-desc-${index}`)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`expense-amount-${expense.id}`}>
                      Jumlah {index + 1}
                    </Label>
                    <Input
                      id={`expense-amount-${expense.id}`}
                      type="number"
                      min="0"
                      value={expense.amount || ""}
                      onChange={(e) =>
                        handleOtherExpenseChange(
                          expense.id,
                          "amount",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      className={cn("mt-1", isFieldReadOnly(`expense-amount-${index}`) && "bg-gray-100")}
                      readOnly={isFieldReadOnly(`expense-amount-${index}`)}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pengeluaran:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(expenseInfo.totalExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Block IV: Income Information */}
            <div className="glass-panel p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                Blok IV: Informasi Pendapatan (dalam rupiah)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cashReceipts">Penerimaan Uang Tunai</Label>
                  <Input
                    id="cashReceipts"
                    type="number"
                    min="0"
                    value={incomeInfo.cashReceipts || ""}
                    onChange={(e) =>
                      handleIncomeChange("cashReceipts", Number(e.target.value))
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("cashReceipts") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("cashReceipts")}
                  />
                </div>
                <div>
                  <Label htmlFor="transferReceipts">
                    Penerimaan Uang Transfer
                  </Label>
                  <Input
                    id="transferReceipts"
                    type="number"
                    min="0"
                    value={incomeInfo.transferReceipts || ""}
                    onChange={(e) =>
                      handleIncomeChange(
                        "transferReceipts",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className={cn("mt-1", isFieldReadOnly("transferReceipts") && "bg-gray-100")}
                    readOnly={isFieldReadOnly("transferReceipts")}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="totalIncome">Total Pendapatan</Label>
                  <div className="mt-1 py-2 px-3 border border-input rounded-md bg-muted/50">
                    {formatCurrency(incomeInfo.totalIncome)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="remainingIncome">Pendapatan Bersih</Label>
                  <div
                    className={cn(
                      "mt-1 py-2 px-3 border rounded-md font-medium",
                      incomeInfo.remainingIncome >= 0
                        ? "bg-status-approved/10 border-status-approved/30 text-status-approved"
                        : "bg-status-rejected/10 border-status-rejected/30 text-status-rejected"
                    )}
                  >
                    {formatCurrency(incomeInfo.remainingIncome)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {/* {user.role === "branch_user" && (
                <Button
                  type="button"
                  variant="outline"
                  className="button-transition flex items-center gap-2"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting && isDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Draf
                </Button>
              )} */}

              <Button
                type="submit"
                className="button-transition button-hover flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && !isDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Kirim Laporan
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
