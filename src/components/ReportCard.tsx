
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCheck, X, FileText, Edit } from "lucide-react";
import { Report, ReportStatus } from "@/types";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import { approveReport, rejectReport, canEditReport } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import RejectDialog from "./RejectDialog";

interface ReportCardProps {
  report: Report;
  onUpdate?: (updatedReport: Report) => void;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string) => void;
}

export default function ReportCard({
  report,
  onUpdate,
  onApprove,
  onReject,
}: ReportCardProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    // Check if user can edit this report
    const checkEditPermission = async () => {
      if (user) {
        const hasEditPermission = await canEditReport(user.id, report.id);
        setCanEdit(hasEditPermission);
      }
    };
    
    checkEditPermission();
  }, [user, report.id]);

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
        return <Clock className="h-4 w-4 text-status-pending" />;
      case "approved":
        return <CheckCheck className="h-4 w-4 text-status-approved" />;
      case "rejected":
        return <X className="h-4 w-4 text-status-rejected" />;
      default:
        return null;
    }
  };

  // Only city_admin can reject reports
  const canReject = 
    user && user.role === "city_admin" && 
    report.status === "pending_city" &&
    report.cityName === user.city;

  // Subdistrict_admin can only approve
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

      if (onUpdate) {
        onUpdate(updatedReportData);
      }

      if (onApprove) {
        onApprove(report.id);
      }

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
      const updatedReportData = await rejectReport(
        report.id,
        reason || "Tidak ada alasan"
      );

      if (onUpdate) {
        onUpdate(updatedReportData);
      }

      if (onReject) {
        onReject(report.id);
      }

      toast.info(`Laporan telah ditolak`);
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Gagal menolak laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full card-transition",
          "hover:shadow-md",
          report.status === "rejected" && "border-status-rejected/20",
          report.status === "approved" && "border-status-approved/20"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>
                {report.branchName} •{" "}
                {format(new Date(report.date), "dd MMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(report.status)}
              {getStatusBadge(report.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {report.content}
          </p>
          {report.status === "rejected" && report.rejection_reason && (
            <div className="mt-2 p-2 bg-status-rejected/5 rounded-md border border-status-rejected/20">
              <p className="text-xs font-medium text-status-rejected">
                Alasan Penolakan:
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {report.rejection_reason}
              </p>
            </div>
          )}
          <div className="mt-2">
            <p className="text-sm font-semibold">
              Total Penjualan: Rp{report.total_sales.toLocaleString('id-ID')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex justify-between">
          <Link to={`/report/${report.id}`}>
            <Button variant="ghost" size="sm" className="button-transition">
              Lihat Detail
            </Button>
          </Link>
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/edit-report/${report.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="button-transition flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </Link>
            )}
            {canApprove && (
              <>
                {canReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejectDialogOpen(true)}
                    disabled={isSubmitting}
                    className="button-transition text-status-rejected border-status-rejected/20 hover:bg-status-rejected/10"
                  >
                    Tolak
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="button-transition text-status-approved border-status-approved/20 hover:bg-status-approved/10"
                >
                  Setujui
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {canReject && (
        <RejectDialog
          isOpen={isRejectDialogOpen}
          onClose={() => setIsRejectDialogOpen(false)}
          onSubmit={handleReject}
        />
      )}
    </>
  );
}
