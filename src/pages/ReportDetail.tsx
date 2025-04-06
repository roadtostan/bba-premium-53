import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import NavBar from "@/components/NavBar";
import {
  getReportById,
  addReportComment,
  approveReport,
  rejectReport,
  getUserById,
  deleteReport,
  canEditReport,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Report, ReportStatus, ReportComment } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  CheckCheck,
  X,
  MessageSquare,
  Send,
  FileEdit,
  Loader2,
  MapPin,
  Package,
  Receipt,
  DollarSign,
} from "lucide-react";
import RejectDialog from "@/components/RejectDialog";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [branchManagerName, setBranchManagerName] = useState<string>("");
  const [canEdit, setCanEdit] = useState(false);

  const canComment = user && ["subdistrict_admin", "city_admin", "super_admin"].includes(user.role);

  useEffect(() => {
    async function loadReport() {
      try {
        const reportData = await getReportById(id as string);
        setReport(reportData);

        if (reportData?.branchManager) {
          try {
            const managerData = await getUserById(reportData.branchManager);
            if (managerData) {
              setBranchManagerName(managerData.name);
            }
          } catch (error) {
            console.error("Failed to load branch manager data", error);
          }
        }

        if (user) {
          console.log("Checking edit permissions for report:", id, "for user:", user.id);
          const hasEditPermission = await canEditReport(user.id, id as string);
          console.log("Edit permission result:", hasEditPermission);
          setCanEdit(hasEditPermission);
        }
      } catch (error) {
        toast.error("Failed to load report");
      }
    }
    loadReport();
  }, [id, user]);

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!report) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Laporan Tidak Ditemukan</h1>
          <p className="mt-4">
            Laporan yang Anda cari tidak ada atau Anda tidak memiliki izin untuk
            melihatnya.
          </p>
          <Link to="/">
            <Button className="mt-4">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "pending_subdistrict":
        return (
          <Badge variant="outline" className="status-badge status-pending">
            Menunggu Wilayah
          </Badge>
        );
      case "pending_city":
        return (
          <Badge variant="outline" className="status-badge status-pending">
            Menunggu Kota
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="status-badge status-approved">
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="status-badge status-rejected">
            Ditolak
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "pending_subdistrict":
      case "pending_city":
        return <Clock className="h-5 w-5 text-status-pending" />;
      case "approved":
        return <CheckCheck className="h-5 w-5 text-status-approved" />;
      case "rejected":
        return <X className="h-5 w-5 text-status-rejected" />;
      default:
        return null;
    }
  };

  const canReject = 
    user && user.role === "city_admin" && 
    report.status === "pending_city" &&
    report.cityName === user.city;
  
  const canApprove =
    user &&
    ((user.role === "subdistrict_admin" &&
      report.status === "pending_subdistrict" &&
      report.subdistrictName === user.subdistrict) ||
      (user.role === "city_admin" &&
        report.status === "pending_city" &&
        report.cityName === user.city));

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const updatedReportData = await approveReport(report.id, report.status);

      setReport((prev) => {
        if (!prev) return null;

        const newStatus =
          prev.status === "pending_subdistrict" ? "pending_city" : "approved";

        return {
          ...prev,
          status: newStatus,
        };
      });

      if (report.status === "pending_subdistrict") {
        toast.success(`Laporan disetujui dan dikirim ke Admin Kota`);
      } else {
        toast.success(`Laporan berhasil disetujui`);
      }
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error("Gagal menyetujui laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await rejectReport(report.id, reason || "Tidak ada alasan");

      setReport((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "rejected",
          rejection_reason: reason || "Tidak ada alasan",
        };
      });

      toast.info(`Laporan telah ditolak`);
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Gagal menolak laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = await addReportComment(report.id, user.id, comment);

      setReport((prevReport) => {
        if (!prevReport) return null;
        return {
          ...prevReport,
          comments: [
            ...(prevReport.comments || []),
            {
              ...newComment,
              user_name: user.name,
              created_at: new Date().toISOString(),
            },
          ],
        };
      });

      setComment("");
      toast.success("Komentar ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString("id-ID")}`;
  };

  const filteredOtherExpenses = report.expenseInfo.otherExpenses.filter(
    (expense) =>
      expense.description &&
      expense.description.trim() !== "" &&
      expense.amount > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2 text-muted-foreground button-transition"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold">{report.title}</h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                {getStatusBadge(report.status)}
              </div>
            </div>

            <div className="mt-2 text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>Cabang: {report.branchName}</span>
              <span>•</span>
              <span>
                Tanggal:{" "}
                {format(new Date(report.date), "PPP", { locale: idLocale })}
              </span>
              <span>•</span>
              <span>
                Dibuat:{" "}
                {format(new Date(report.created_at), "PPP", {
                  locale: idLocale,
                })}
              </span>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detail Laporan</CardTitle>
              <CardDescription>
                Informasi penjualan untuk {report.branchName}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Ringkasan
                </h3>
                <p className="whitespace-pre-line">{report.content}</p>
              </div>

              <div>
                <h3 className="text-base font-medium flex items-center gap-2 mb-3 pt-2">
                  <MapPin className="h-5 w-5" />
                  Informasi Lokasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kota:</span>
                      <span className="font-medium">
                        {report.locationInfo.cityName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wilayah:</span>
                      <span className="font-medium">
                        {report.locationInfo.districtName}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cabang:</span>
                      <span className="font-medium">
                        {report.locationInfo.branchName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Manajer Cabang:
                      </span>
                      <span className="font-medium">
                        {branchManagerName || "Tidak ada data"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium flex items-center gap-2 mb-3 pt-2">
                  <Package className="h-5 w-5" />
                  Informasi Produk
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Stok Awal</TableCell>
                      <TableCell className="text-right">
                        {report.productInfo.initialStock}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sisa Stok</TableCell>
                      <TableCell className="text-right">
                        {report.productInfo.remainingStock}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tester</TableCell>
                      <TableCell className="text-right">
                        {report.productInfo.testers}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Reject</TableCell>
                      <TableCell className="text-right">
                        {report.productInfo.rejects}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Terjual</TableCell>
                      <TableCell className="text-right font-medium">
                        {report.productInfo.sold}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-base font-medium flex items-center gap-2 mb-3 pt-2">
                  <Receipt className="h-5 w-5" />
                  Informasi Pengeluaran
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Gaji Karyawan</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.employeeSalary)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bonus Karyawan</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.employeeBonus)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Minyak Goreng</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.cookingOil)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gas LPG</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.lpgGas)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kantong Plastik</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.plasticBags)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tissue</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.tissue)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sabun</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.expenseInfo.soap)}
                      </TableCell>
                    </TableRow>

                    {filteredOtherExpenses.length > 0 && (
                      <>
                        {filteredOtherExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(expense.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    <TableRow>
                      <TableCell className="font-medium">
                        Total Pengeluaran
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(report.expenseInfo.totalExpenses)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-base font-medium flex items-center gap-2 mb-3 pt-2">
                  <DollarSign className="h-5 w-5" />
                  Informasi Pendapatan
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Penerimaan Tunai</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.incomeInfo.cashReceipts)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Penerimaan Transfer</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.incomeInfo.transferReceipts)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sisa Penghasilan</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.incomeInfo.remainingIncome)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Total Pendapatan
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(report.incomeInfo.totalIncome)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {report.status === "rejected" && report.rejection_reason && (
                <div className="p-4 bg-status-rejected/5 rounded-md border border-status-rejected/20">
                  <h3 className="text-sm font-medium text-status-rejected mb-2">
                    Alasan Penolakan
                  </h3>
                  <p>{report.rejection_reason}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              {canEdit && (
                <Link to={`/edit-report/${report.id}`}>
                  <Button
                    variant="outline"
                    className="button-transition flex items-center gap-2"
                  >
                    <FileEdit className="h-4 w-4" />
                    Edit Laporan
                  </Button>
                </Link>
              )}

              {canApprove && (
                <>
                  {canReject && (
                    <Button
                      variant="outline"
                      onClick={() => setIsRejectDialogOpen(true)}
                      disabled={isSubmitting}
                      className="button-transition text-status-rejected border-status-rejected/20 hover:bg-status-rejected/10"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="button-transition text-status-approved border-status-approved/20 hover:bg-status-approved/10"
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Setujui
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>

          {canComment && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Komentar
              </h2>

              <div className="space-y-4 mb-6">
                {!report.comments || report.comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    Belum ada komentar
                  </p>
                ) : (
                  report.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 glass-panel rounded-lg border"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{comment.user_name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {comment.created_at
                              ? format(new Date(comment.created_at), "PPP", {
                                  locale: idLocale,
                                })
                              : "Tanggal tidak tersedia"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSubmitComment}
                className="glass-panel p-4 rounded-lg border"
              >
                <h3 className="font-medium mb-2">Tambah Komentar</h3>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tulis komentar Anda di sini..."
                  className="mb-3 min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="button-transition flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Kirim Komentar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {canReject && (
        <RejectDialog
          isOpen={isRejectDialogOpen}
          onClose={() => setIsRejectDialogOpen(false)}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
}
