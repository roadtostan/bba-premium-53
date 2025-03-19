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
  Report,
} from "@/types";
import {
  createReport,
  getBranches,
  getSubdistricts,
  getCities,
  getReportById,
  updateReport,
} from "@/lib/data";
import { id as idLocale } from "date-fns/locale";

export default function CreateReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [title, setTitle] = useState("Daily Sales Report");
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

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

  useEffect(() => {
    const fetchReportData = async () => {
      if (isEditMode && id) {
        try {
          const reportData = await getReportById(id);
          console.log("Report data received:", reportData);

          // Set form data from report
          setTitle(reportData?.title ?? "Daily Sales Report");
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

          // Set location IDs
          setBranchId(reportData?.branchId ?? "");
          setSubdistrictId(reportData?.subdistrictId ?? "");
          setCityId(reportData?.cityId ?? "");
        } catch (error) {
          console.error("Error fetching report data:", error);
          toast.error("Gagal mengambil data laporan");
        }
      }
    };

    fetchReportData();
  }, [isEditMode, id, user]);

  useEffect(() => {
    // Calculate total expenses
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

    // Calculate total income
    const totalIncome = incomeInfo.cashReceipts + incomeInfo.transferReceipts;

    // Calculate remaining income (net)
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

  // Calculate sales based on stock
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

  if (!user || user.role !== "branch_user") {
    navigate("/");
    return null;
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
      // Pastikan kita memiliki branch_id dan subdistrict_id
      if (!branchId || !subdistrictId || !cityId) {
        // Jika belum ada, coba ambil dari data user
        if (user?.branch) {
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
      }

      // Prepare report data with the correct structure matching database columns
      const reportData = {
        title,
        content,
        date: date?.toISOString().split("T")[0], // Format as YYYY-MM-DD
        status: (saveAsDraft ? "draft" : "pending_subdistrict") as ReportStatus,

        // Location IDs - pastikan menggunakan nilai yang sudah diupdate
        branch_id: branchId,
        subdistrict_id: subdistrictId,
        city_id: cityId,

        // Branch manager info - Use user ID for submission to database, but display name in UI
        branch_manager: user?.id || "",

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
                    className="mt-1"
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
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: idLocale })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
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
                  className="mt-1 h-24"
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
                    value={user?.name || ""}
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                      className="mt-1"
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
                      className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
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
                Simpan sebagai Draft
              </Button>

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
