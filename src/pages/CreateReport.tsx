
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
import { createReport, getBranches, getSubdistricts, getCities } from "@/lib/data";
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
    city_name: user?.city || "",
    subdistrict_name: user?.subdistrict || "",
    branch_name: user?.branch || "",
    branch_manager: user?.name || "",
  });

  // Block II: Product Information
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    initial_stock: 0,
    remaining_stock: 0,
    testers: 0,
    rejects: 0,
    sold: 0,
  });

  // Block III: Expense Information
  const [expenseInfo, setExpenseInfo] = useState<ExpenseInfo>({
    employee_salary: 0,
    employee_bonus: 0,
    cooking_oil: 0,
    lpg_gas: 0,
    plastic_bags: 0,
    tissue: 0,
    soap: 0,
    other_expenses: [
      { id: "1", description: "", amount: 0 },
      { id: "2", description: "", amount: 0 },
      { id: "3", description: "", amount: 0 },
    ],
    total_expenses: 0,
  });

  // Block IV: Income Information
  const [incomeInfo, setIncomeInfo] = useState<IncomeInfo>({
    cash_receipts: 0,
    transfer_receipts: 0,
    remaining_income: 0,
    total_income: 0,
  });

  // Fetch branch, subdistrict, and city data for the user
  useEffect(() => {
    const fetchUserLocationData = async () => {
      try {
        if (user && user.branch) {
          // Get branches to find the branch ID
          const branches = await getBranches();
          const userBranch = branches.find(b => b.name === user.branch);
          
          if (userBranch) {
            setBranchId(userBranch.id);
            setSubdistrictId(userBranch.subdistrict_id);
            
            // Get subdistrict to find the city ID
            const subdistricts = await getSubdistricts();
            const userSubdistrict = subdistricts.find(s => s.id === userBranch.subdistrict_id);
            
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
    // Calculate total expenses
    const totalExpenses =
      expenseInfo.employee_salary +
      expenseInfo.employee_bonus +
      expenseInfo.cooking_oil +
      expenseInfo.lpg_gas +
      expenseInfo.plastic_bags +
      expenseInfo.tissue +
      expenseInfo.soap +
      expenseInfo.other_expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    // Calculate total income
    const totalIncome = incomeInfo.cash_receipts + incomeInfo.transfer_receipts;

    // Calculate remaining income (net)
    const remainingIncome = totalIncome - totalExpenses;

    setExpenseInfo((prev) => ({ ...prev, total_expenses: totalExpenses }));
    setIncomeInfo((prev) => ({
      ...prev,
      total_income: totalIncome,
      remaining_income: remainingIncome,
    }));
  }, [
    expenseInfo.employee_salary,
    expenseInfo.employee_bonus,
    expenseInfo.cooking_oil,
    expenseInfo.lpg_gas,
    expenseInfo.plastic_bags,
    expenseInfo.tissue,
    expenseInfo.soap,
    expenseInfo.other_expenses,
    incomeInfo.cash_receipts,
    incomeInfo.transfer_receipts,
  ]);

  // Calculate sales based on stock
  useEffect(() => {
    if (productInfo.initial_stock >= productInfo.remaining_stock) {
      const sold =
        productInfo.initial_stock -
        productInfo.remaining_stock -
        productInfo.testers -
        productInfo.rejects;
      setProductInfo((prev) => ({ ...prev, sold: sold >= 0 ? sold : 0 }));
    }
  }, [
    productInfo.initial_stock,
    productInfo.remaining_stock,
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
    field: keyof Omit<ExpenseInfo, "other_expenses" | "total_expenses">,
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
      other_expenses: prev.other_expenses.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleIncomeChange = (
    field: keyof Omit<IncomeInfo, "remaining_income" | "total_income">,
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
    if (productInfo.initial_stock < 0 || productInfo.testers > 5) {
      toast.error(
        "Informasi produk tidak valid. Catatan: Tester tidak boleh melebihi 5"
      );
      return false;
    }

    // Ensure we have branch, subdistrict, and city IDs
    if (!branchId || !subdistrictId || !cityId) {
      toast.error("Data lokasi tidak lengkap. Harap hubungi administrator.");
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
      // Prepare report data with the correct IDs for foreign keys
      const reportData = {
        title,
        content,
        date: date?.toISOString(),
        status: (saveAsDraft ? "draft" : "pending_subdistrict") as ReportStatus,

        // Data lokasi dengan ID untuk foreign key
        branch_id: branchId,
        subdistrict_id: subdistrictId,
        city_id: cityId,
        
        // Data lokasi nama untuk tampilan
        branch_name: locationInfo.branch_name,
        subdistrict_name: locationInfo.subdistrict_name,
        city_name: locationInfo.city_name,
        branch_manager: locationInfo.branch_manager,

        // Data produk
        initial_stock: productInfo.initial_stock,
        remaining_stock: productInfo.remaining_stock,
        testers: productInfo.testers,
        rejects: productInfo.rejects,
        sold: productInfo.sold,

        // Data pengeluaran
        employee_salary: expenseInfo.employee_salary,
        employee_bonus: expenseInfo.employee_bonus,
        cooking_oil: expenseInfo.cooking_oil,
        lpg_gas: expenseInfo.lpg_gas,
        plastic_bags: expenseInfo.plastic_bags,
        tissue: expenseInfo.tissue,
        soap: expenseInfo.soap,
        other_expenses: expenseInfo.other_expenses,
        total_expenses: expenseInfo.total_expenses,

        // Data pendapatan
        cash_receipts: incomeInfo.cash_receipts,
        transfer_receipts: incomeInfo.transfer_receipts,
        total_income: incomeInfo.total_income,
        remaining_income: incomeInfo.remaining_income,
      };

      await createReport(reportData);

      toast.success(
        saveAsDraft
          ? "Laporan berhasil disimpan sebagai draft"
          : "Laporan berhasil dikirim"
      );
      navigate("/");
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Gagal membuat laporan: " + (error as Error).message);
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
                    value={locationInfo.city_name}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="subdistrictName">Nama Wilayah</Label>
                  <Input
                    id="subdistrictName"
                    value={locationInfo.subdistrict_name}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">Nama Cabang</Label>
                  <Input
                    id="branchName"
                    value={locationInfo.branch_name}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="branchManager">Penanggung Jawab Cabang</Label>
                  <Input
                    id="branchManager"
                    value={locationInfo.branch_manager}
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
                    value={productInfo.initial_stock || ""}
                    onChange={(e) =>
                      handleProductChange(
                        "initial_stock",
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
                    max={productInfo.initial_stock}
                    value={productInfo.remaining_stock || ""}
                    onChange={(e) =>
                      handleProductChange(
                        "remaining_stock",
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
                    id="employee_salary"
                    type="number"
                    min="0"
                    value={expenseInfo.employee_salary || ""}
                    onChange={(e) =>
                      handleExpenseChange(
                        "employee_salary",
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
                    id="employee_bonus"
                    type="number"
                    min="0"
                    value={expenseInfo.employee_bonus || ""}
                    onChange={(e) =>
                      handleExpenseChange(
                        "employee_bonus",
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
                    id="cooking_oil"
                    type="number"
                    min="0"
                    value={expenseInfo.cooking_oil || ""}
                    onChange={(e) =>
                      handleExpenseChange("cooking_oil", Number(e.target.value))
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lpgGas">Gas LPG</Label>
                  <Input
                    id="lpg_gas"
                    type="number"
                    min="0"
                    value={expenseInfo.lpg_gas || ""}
                    onChange={(e) =>
                      handleExpenseChange("lpg_gas", Number(e.target.value))
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plastic_bags">Kantong Plastik</Label>
                  <Input
                    id="plastic_bags"
                    type="number"
                    min="0"
                    value={expenseInfo.plastic_bags || ""}
                    onChange={(e) =>
                      handleExpenseChange(
                        "plastic_bags",
                        Number(e.target.value)
                      )
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
              {expenseInfo.other_expenses.map((expense, index) => (
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
                    {formatCurrency(expenseInfo.total_expenses)}
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
                    id="cash_receipts"
                    type="number"
                    min="0"
                    value={incomeInfo.cash_receipts || ""}
                    onChange={(e) =>
                      handleIncomeChange(
                        "cash_receipts",
                        Number(e.target.value)
                      )
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
                    id="transfer_receipts"
                    type="number"
                    min="0"
                    value={incomeInfo.transfer_receipts || ""}
                    onChange={(e) =>
                      handleIncomeChange(
                        "transfer_receipts",
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
                    {formatCurrency(incomeInfo.total_income)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="remainingIncome">Pendapatan Bersih</Label>
                  <div
                    className={cn(
                      "mt-1 py-2 px-3 border rounded-md font-medium",
                      incomeInfo.remaining_income >= 0
                        ? "bg-status-approved/10 border-status-approved/30 text-status-approved"
                        : "bg-status-rejected/10 border-status-rejected/30 text-status-rejected"
                    )}
                  >
                    {formatCurrency(incomeInfo.remaining_income)}
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
