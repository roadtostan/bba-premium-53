import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Loader2, Save, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar
} from "@/components/ui/calendar";
import {
  getCities,
  getSubdistricts,
  getBranches,
  canCreateNewReport,
  getReportById,
  createReport,
  updateReport,
  canEditReport,
  getReportLocationData,
  deleteReport,
  canDeleteReport,
} from "@/lib/data";
import { id as idLocale } from "date-fns/locale";

// Define types for product and expense items
type ProductItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
};

const CreateReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  // Location states
  const [cities, setCities] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [cityId, setCityId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [branchId, setBranchId] = useState("");

  // Product states
  const [initialStock, setInitialStock] = useState(0);
  const [remainingStock, setRemainingStock] = useState(0);
  const [testers, setTesters] = useState(0);
  const [rejects, setRejects] = useState(0);
  const [sold, setSold] = useState(0);

  // Expense states
  const [employeeSalary, setEmployeeSalary] = useState(0);
  const [employeeBonus, setEmployeeBonus] = useState(0);
  const [cookingOil, setCookingOil] = useState(0);
  const [lpgGas, setLpgGas] = useState(0);
  const [plasticBags, setPlasticBags] = useState(0);
  const [tissue, setTissue] = useState(0);
  const [soap, setSoap] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState<ExpenseItem[]>([]);

  // Income states
  const [cashReceipts, setCashReceipts] = useState(0);
  const [transferReceipts, setTransferReceipts] = useState(0);

  // Function to check if user can delete the report
  const checkDeletePermission = async (userId: string, reportId: string) => {
    try {
      const canDelete = await canDeleteReport(userId, reportId);
      setCanDelete(canDelete);
      console.log("Can delete report:", canDelete);
    } catch (error) {
      console.error("Error checking delete permission:", error);
      setCanDelete(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);

        const loadSubdistricts = async (cityId: string) => {
          if (cityId) {
            const subdistrictsData = await getSubdistricts(cityId);
            setSubdistricts(subdistrictsData);
          } else {
            setSubdistricts([]);
          }
        };

        const loadBranches = async (subdistrictId: string) => {
          if (subdistrictId) {
            const branchesData = await getBranches(subdistrictId);
            setBranches(branchesData);
          } else {
            setBranches([]);
          }
        };

        if (isEditMode && id && user) {
          const canUserEdit = await canEditReport(user.id, id);
          setCanEdit(canUserEdit);

          if (!canUserEdit) {
            toast.error("Anda tidak memiliki izin untuk mengedit laporan ini");
            navigate("/");
            return;
          }

          // Check delete permission
          await checkDeletePermission(user.id, id);

          const report = await getReportById(id);
          if (!report) {
            toast.error("Laporan tidak ditemukan");
            navigate("/");
            return;
          }
          
          setTitle(report.title || "");
          setContent(report.content || "");
          setDate(report.date ? new Date(report.date) : new Date());
          
          // Set product info
          setInitialStock(report.productInfo.initialStock);
          setRemainingStock(report.productInfo.remainingStock);
          setTesters(report.productInfo.testers);
          setRejects(report.productInfo.rejects);
          setSold(report.productInfo.sold);
          
          // Set expense info
          setEmployeeSalary(report.expenseInfo.employeeSalary);
          setEmployeeBonus(report.expenseInfo.employeeBonus);
          setCookingOil(report.expenseInfo.cookingOil);
          setLpgGas(report.expenseInfo.lpgGas);
          setPlasticBags(report.expenseInfo.plasticBags);
          setTissue(report.expenseInfo.tissue);
          setSoap(report.expenseInfo.soap);
          setOtherExpenses(report.expenseInfo.otherExpenses || []);
          
          // Set income info
          setCashReceipts(report.incomeInfo.cashReceipts);
          setTransferReceipts(report.incomeInfo.transferReceipts);
          
          // Handle location data
          if (report.branch_id && report.subdistrict_id && report.city_id) {
            setCityId(report.city_id);
            setSubdistrictId(report.subdistrict_id);
            setBranchId(report.branch_id);
          } else if (report.branchId && report.subdistrictId && report.cityId) {
            setCityId(report.cityId);
            setSubdistrictId(report.subdistrictId);
            setBranchId(report.branchId);
          } else {
            const locationData = await getReportLocationData(id);
            if (locationData) {
              setCityId(locationData.city_id);
              await loadSubdistricts(locationData.city_id);
              setSubdistrictId(locationData.subdistrict_id);
              await loadBranches(locationData.subdistrict_id);
              setBranchId(locationData.branch_id);
            }
          }
          
          if (report.city_id) {
            setCityId(report.city_id);
            await loadSubdistricts(report.city_id);
          }
      
          if (report.subdistrict_id) {
            setSubdistrictId(report.subdistrict_id);
            await loadBranches(report.subdistrict_id);
          }
      
          if (report.branch_id) {
            setBranchId(report.branch_id);
          }
        } else {
          if (user) {
            const canCreate = await canCreateNewReport(user.id);
            if (!canCreate) {
              toast.error("Anda masih memiliki laporan yang belum disetujui");
              navigate("/");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [id, user, isEditMode, navigate]);

  const validateForm = () => {
    if (!title || !content || !date || !cityId || !subdistrictId || !branchId) {
      toast.error("Harap isi semua bidang yang wajib diisi.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    saveAsDraft = false
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsDraft(saveAsDraft);

    try {
      const reportData = {
        title,
        content,
        date: format(date!, "yyyy-MM-dd"),
        status: saveAsDraft ? "draft" : "pending_subdistrict",
        branch_id: branchId,
        subdistrict_id: subdistrictId,
        city_id: cityId,
        branch_manager: user?.id,
        initial_stock: initialStock,
        remaining_stock: remainingStock,
        testers: testers,
        rejects: rejects,
        sold: sold,
        employee_salary: employeeSalary,
        employee_bonus: employeeBonus,
        cooking_oil: cookingOil,
        lpg_gas: lpgGas,
        plastic_bags: plasticBags,
        tissue: tissue,
        soap: soap,
        other_expenses: otherExpenses,
        total_expenses:
          employeeSalary +
          employeeBonus +
          cookingOil +
          lpgGas +
          plasticBags +
          tissue +
          soap +
          otherExpenses.reduce((acc, curr) => acc + curr.amount, 0),
        cash_receipts: cashReceipts,
        transfer_receipts: transferReceipts,
        total_income: cashReceipts + transferReceipts,
        remaining_income: cashReceipts + transferReceipts,
      };

      if (isEditMode && id) {
        await updateReport(id, reportData);
        toast.success("Laporan berhasil diperbarui");
      } else {
        await createReport(reportData);
        toast.success("Laporan berhasil dibuat");
      }

      navigate("/");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(
        "Gagal mengirim laporan: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteReport(id);
      toast.success("Laporan berhasil dihapus");
      navigate("/");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Gagal menghapus laporan: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCityChange = async (cityId: string) => {
    setCityId(cityId);
    setSubdistrictId("");
    setBranchId("");
    await loadSubdistricts(cityId);
  };

  const handleSubdistrictChange = async (subdistrictId: string) => {
    setSubdistrictId(subdistrictId);
    setBranchId("");
    await loadBranches(subdistrictId);
  };

  const loadSubdistricts = async (cityId: string) => {
    if (cityId) {
      const subdistrictsData = await getSubdistricts(cityId);
      setSubdistricts(subdistrictsData);
    } else {
      setSubdistricts([]);
    }
  };

  const loadBranches = async (subdistrictId: string) => {
    if (subdistrictId) {
      const branchesData = await getBranches(subdistrictId);
      setBranches(branchesData);
    } else {
      setBranches([]);
    }
  };

  const calculateTotalExpenses = () => {
    return (
      employeeSalary +
      employeeBonus +
      cookingOil +
      lpgGas +
      plasticBags +
      tissue +
      soap +
      otherExpenses.reduce((acc, curr) => acc + curr.amount, 0)
    );
  };

  const calculateTotalIncome = () => {
    return cashReceipts + transferReceipts;
  };

  const calculateRemainingIncome = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {isEditMode ? "Edit Laporan" : "Buat Laporan Baru"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Laporan</CardTitle>
              <CardDescription>
                Isi informasi dasar laporan Anda di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Laporan</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Isi Laporan</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Laporan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
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
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    side="bottom"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2020-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Lokasi</CardTitle>
              <CardDescription>
                Pilih lokasi yang sesuai untuk laporan ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Kota</Label>
                <Select
                  value={cityId}
                  onValueChange={handleCityChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdistrict">Kecamatan</Label>
                <Select
                  value={subdistrictId}
                  onValueChange={handleSubdistrictChange}
                  disabled={!cityId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistricts.map((subdistrict: any) => (
                      <SelectItem key={subdistrict.id} value={subdistrict.id}>
                        {subdistrict.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch">Cabang</Label>
                <Select
                  value={branchId}
                  onValueChange={(value) => setBranchId(value)}
                  disabled={!subdistrictId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
              <CardDescription>
                Isi informasi terkait produk di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="initialStock">Stok Awal</Label>
                <Input
                  type="number"
                  id="initialStock"
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remainingStock">Sisa Stok</Label>
                <Input
                  type="number"
                  id="remainingStock"
                  value={remainingStock}
                  onChange={(e) => setRemainingStock(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="testers">Jumlah Tester</Label>
                <Input
                  type="number"
                  id="testers"
                  value={testers}
                  onChange={(e) => setTesters(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rejects">Jumlah Reject</Label>
                <Input
                  type="number"
                  id="rejects"
                  value={rejects}
                  onChange={(e) => setRejects(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sold">Jumlah Terjual</Label>
                <Input
                  type="number"
                  id="sold"
                  value={sold}
                  onChange={(e) => setSold(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengeluaran</CardTitle>
              <CardDescription>
                Isi informasi terkait pengeluaran di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeSalary">Gaji Karyawan</Label>
                <Input
                  type="number"
                  id="employeeSalary"
                  value={employeeSalary}
                  onChange={(e) => setEmployeeSalary(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeBonus">Bonus Karyawan</Label>
                <Input
                  type="number"
                  id="employeeBonus"
                  value={employeeBonus}
                  onChange={(e) => setEmployeeBonus(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cookingOil">Minyak Goreng</Label>
                <Input
                  type="number"
                  id="cookingOil"
                  value={cookingOil}
                  onChange={(e) => setCookingOil(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lpgGas">Gas LPG</Label>
                <Input
                  type="number"
                  id="lpgGas"
                  value={lpgGas}
                  onChange={(e) => setLpgGas(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plasticBags">Kantong Plastik</Label>
                <Input
                  type="number"
                  id="plasticBags"
                  value={plasticBags}
                  onChange={(e) => setPlasticBags(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tissue">Tisu</Label>
                <Input
                  type="number"
                  id="tissue"
                  value={tissue}
                  onChange={(e) => setTissue(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="soap">Sabun</Label>
                <Input
                  type="number"
                  id="soap"
                  value={soap}
                  onChange={(e) => setSoap(Number(e.target.value))}
                />
              </div>
              {/* Implementasi untuk pengeluaran lainnya bisa ditambahkan di sini */}
            </CardContent>
            <CardFooter>
              Total Pengeluaran: {calculateTotalExpenses()}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pemasukan</CardTitle>
              <CardDescription>
                Isi informasi terkait pemasukan di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cashReceipts">Pemasukan Tunai</Label>
                <Input
                  type="number"
                  id="cashReceipts"
                  value={cashReceipts}
                  onChange={(e) => setCashReceipts(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transferReceipts">Pemasukan Transfer</Label>
                <Input
                  type="number"
                  id="transferReceipts"
                  value={transferReceipts}
                  onChange={(e) => setTransferReceipts(Number(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter>
              Total Pemasukan: {calculateTotalIncome()}
            </CardFooter>
          </Card>
          
          {/* Form actions at the bottom */}
            <div className="flex justify-between">
              {isEditMode && canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      className="button-transition flex items-center gap-2"
                      disabled={isDeleting || isSubmitting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleDeleteReport}
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className={isEditMode && canDelete ? "" : "ml-auto"}>
                <Button
                  type="submit"
                  className="button-transition button-hover flex items-center gap-2"
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting && !isDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isEditMode ? "Update Laporan" : "Kirim Laporan"}
                </Button>
              </div>
            </div>
          </form>
      </div>
    </Layout>
  );
};

export default CreateReport;
