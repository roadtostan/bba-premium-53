import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import NavBar from "@/components/NavBar";
import { getReportById } from "@/lib/data";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Report, ReportComment, ReportStatus } from "@/types";
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
} from "lucide-react";
import { canEditReport } from "@/lib/data";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const reportData = await getReportById(id as string);
        setReport(reportData);
      } catch (error) {
        toast.error("Failed to load report");
      }
    }
    loadReport();
  }, [id]);

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
      case "draft":
        return (
          <Badge
            variant="outline"
            className="status-badge bg-secondary text-secondary-foreground"
          >
            Draf
          </Badge>
        );
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

  const canApprove =
    user &&
    ((user.role === "subdistrict_admin" &&
      report.status === "pending_subdistrict" &&
      report.subdistrict_name === user.subdistrict) ||
      (user.role === "city_admin" &&
        report.status === "pending_city" &&
        report.city_name === user.city));

  const isEditable = user && canEditReport(user.id, report.id);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedReport = { ...report };

      if (
        user.role === "subdistrict_admin" &&
        report.status === "pending_subdistrict"
      ) {
        updatedReport.status = "pending_city";
        toast.success(`Laporan disetujui dan dikirim ke Admin Kota`);
      } else if (
        user.role === "city_admin" &&
        report.status === "pending_city"
      ) {
        updatedReport.status = "approved";
        toast.success(`Laporan berhasil disetujui`);
      }

      setReport(updatedReport);
    } catch (error) {
      toast.error("Gagal menyetujui laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (reason === null) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedReport = { ...report };
      updatedReport.status = "rejected";
      updatedReport.rejection_reason = reason || "Tidak ada alasan";

      setReport(updatedReport);
      toast.info(`Laporan telah ditolak`);
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newComment = {
        id: `c${Date.now()}`,
        text: comment,
        user_id: user.id,
        user_name: user.name,
        created_at: new Date().toISOString(),
      };

      const updatedReport = { ...report };
      updatedReport.comments = [...(updatedReport.comments || []), newComment];

      setReport(updatedReport);
      setComment("");
      toast.success("Komentar ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span>Cabang: {report.branch_name}</span>
              <span>•</span>
              <span>Tanggal: {format(new Date(report.date), "PPP", { locale: idLocale })}</span>
              <span>•</span>
              <span>Dibuat: {format(new Date(report.created_at), "PPP", { locale: idLocale })}</span>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detail Laporan</CardTitle>
              <CardDescription>
                Informasi penjualan untuk {report.branch_name}
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Total Penjualan
                </h3>
                <p className="text-xl font-bold">
                  Rp{report.total_sales.toLocaleString()}
                </p>
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
              {isEditable && (
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
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="button-transition text-status-rejected border-status-rejected/20 hover:bg-status-rejected/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>

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
                      <h3 className="font-medium">{comment.user_name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "PPP")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{comment.text}</p>
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
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="button-transition flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Kirim Komentar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
