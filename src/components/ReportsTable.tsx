
import { useState } from "react";
import { Report, ReportStatus } from "@/types";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { canEditReport, canDeleteReport, deleteReport } from "@/lib/data";
import { toast } from "sonner";

// Helper function to get status badge
const getStatusBadge = (status: ReportStatus) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "pending_subdistrict":
      return <Badge variant="secondary">Menunggu Subdistrict</Badge>;
    case "pending_city":
      return <Badge variant="warning">Menunggu City</Badge>;
    case "approved":
      return <Badge variant="success">Disetujui</Badge>;
    case "rejected":
      return <Badge variant="destructive">Ditolak</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

interface ReportsTableProps {
  reports: Report[];
  onDelete?: (reportId: string) => void;
}

export default function ReportsTable({ reports, onDelete }: ReportsTableProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Handle report deletion
  const handleDelete = async (reportId: string, userId: string) => {
    if (!window.confirm("Yakin ingin menghapus laporan ini?")) {
      return;
    }

    setLoading((prev) => ({ ...prev, [reportId]: true }));
    try {
      // Check if user can delete this report
      const canDelete = await canDeleteReport(userId, reportId);
      if (!canDelete) {
        toast.error("Anda tidak memiliki izin untuk menghapus laporan ini");
        return;
      }

      await deleteReport(reportId);
      toast.success("Laporan berhasil dihapus");
      if (onDelete) onDelete(reportId);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Gagal menghapus laporan");
    } finally {
      setLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>Daftar Laporan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Cabang</TableHead>
            <TableHead>Kecamatan</TableHead>
            <TableHead>Kota</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Penjualan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                Tidak ada laporan yang tersedia
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {report.date
                    ? format(new Date(report.date), "dd MMM yyyy", {
                        locale: indonesianLocale,
                      })
                    : "-"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {report.title}
                </TableCell>
                <TableCell>{report.branchName || "-"}</TableCell>
                <TableCell>{report.subdistrictName || "-"}</TableCell>
                <TableCell>{report.cityName || "-"}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(report.totalSales || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/report/${report.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>

                    {canEditReport(report.createdBy || "", report.id) && (
                      <Link to={`/edit-report/${report.id}`}>
                        <Button size="sm" variant="outline">
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(report.id, report.createdBy || "")}
                      disabled={loading[report.id]}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
