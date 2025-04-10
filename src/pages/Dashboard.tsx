
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import NavBar from "@/components/NavBar";
import ReportCard from "@/components/ReportCard";
import {
  getReportsByUser,
  getPendingActionReports,
  canCreateNewReport,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, FileCheck, FileX, Clock } from "lucide-react";
import { Report, ReportStatus } from "@/types";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import RejectDialog from "@/components/RejectDialog";
import AdminDashboard from "@/components/AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingActionReports, setPendingActionReports] = useState<Report[]>(
    []
  );
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadData() {
      if (user) {
        // If user is super_admin, the data will be loaded directly in AdminDashboard component
        if (user.role === "super_admin") {
          return;
        }

        const [reportsData, pendingData] = await Promise.all([
          getReportsByUser(user.id),
          getPendingActionReports(user.id),
        ]);

        let filteredReports = reportsData;

        if (user.role === "subdistrict_admin") {
          filteredReports = reportsData.filter(
            (report) => report.status !== "draft"
          );
        }

        if (user.role === "city_admin") {
          filteredReports = reportsData.filter(
            (report) =>
              report.status !== "draft" &&
              report.status !== "pending_subdistrict"
          );
        }

        setReports(filteredReports);
        setPendingActionReports(pendingData);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Render the admin dashboard for super_admin
  if (user.role === "super_admin") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Selamat datang, {user.name}
            </p>
          </div>
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // Branch users are now redirected directly to create report page in App.tsx
  // This dashboard should only be shown to admins

  const canCreate = user.role === "branch_user" && canCreateNewReport(user.id);

  const filteredReports = () => {
    if (activeTab === "all") {
      return reports;
    }
    return reports.filter((report) => {
      switch (activeTab) {
        case "pending":
          return (
            report.status === "pending_subdistrict" ||
            report.status === "pending_city"
          );
        case "approved":
          return report.status === "approved";
        case "rejected":
          return report.status === "rejected";
        case "draft":
          return report.status === "draft";
        default:
          return true;
      }
    });
  };

  const handleApprove = (reportId: string) => {
    const updatedReports = [...reports];
    const reportIndex = updatedReports.findIndex((r) => r.id === reportId);

    if (reportIndex !== -1) {
      const report = updatedReports[reportIndex];

      if (
        user.role === "subdistrict_admin" &&
        report.status === "pending_subdistrict"
      ) {
        report.status = "pending_city";
        toast.success(
          `Report "${report.title}" approved and sent to City Admin`
        );
      } else if (
        user.role === "city_admin" &&
        report.status === "pending_city"
      ) {
        report.status = "approved";
        toast.success(`Report "${report.title}" approved successfully`);
      }

      setReports(updatedReports);
      setPendingActionReports(
        pendingActionReports.filter((r) => r.id !== reportId)
      );
    }
  };

  const handleReject = (reportId: string) => {
    // Only city_admin can reject
    if (user.role !== "city_admin") return;
    
    setSelectedReportId(reportId);
    setIsRejectDialogOpen(true);
  };

  const handleRejectSubmit = (reason: string) => {
    if (!selectedReportId) return;

    const updatedReports = [...reports];
    const reportIndex = updatedReports.findIndex(
      (r) => r.id === selectedReportId
    );

    if (reportIndex !== -1) {
      updatedReports[reportIndex].status = "rejected";
      updatedReports[reportIndex].rejection_reason =
        reason || "Tidak ada alasan";

      setReports(updatedReports);
      setPendingActionReports(
        pendingActionReports.filter((r) => r.id !== selectedReportId)
      );

      toast.info(
        `Laporan "${updatedReports[reportIndex].title}" telah ditolak`
      );
    }
  };

  const getRoleDashboardTitle = () => {
    switch (user.role) {
      case "branch_user":
        return `Laporan ${user.branch}`;
      case "subdistrict_admin":
        return `Laporan ${user.subdistrict}`;
      case "city_admin":
        return `Laporan ${user.city}`;
      default:
        return "Dasbor";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{getRoleDashboardTitle()}</h1>
            <p className="text-muted-foreground">
              Selamat datang lagi, {user.name}
            </p>
          </div>
          {user.role === "branch_user" && (
            <Link to="/create-report">
              <Button
                disabled={!canCreate}
                className="button-transition button-hover flex items-center gap-2"
              >
                <FilePlus className="h-4 w-4" />
                Buat Laporan Baru
              </Button>
            </Link>
          )}
        </div>

        {(user.role === "subdistrict_admin" || user.role === "city_admin") &&
          pendingActionReports.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-status-pending" />
                Laporan Menunggu Persetujuan
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingActionReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onUpdate={(updatedReport) => {
                      setPendingActionReports(
                        pendingActionReports.filter(
                          (r) => r.id !== updatedReport.id
                        )
                      );
                      setReports(
                        reports.map((r) =>
                          r.id === updatedReport.id ? updatedReport : r
                        )
                      );
                    }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </div>
          )}

        {user.role === "branch_user" && !canCreate && (
          <div className="mb-8 p-4 border rounded-lg bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <p className="text-sm">
              Anda memiliki laporan yang menunggu persetujuan. Anda dapat
              membuat laporan baru setelah semua laporan yang tertunda diproses.
            </p>
          </div>
        )}

        <div>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b mb-4 w-full overflow-hidden">
              <ScrollArea className="w-full pb-2">
                <div className="min-w-full inline-block pb-2">
                  <TabsList className="inline-flex w-max justify-start">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
                    >
                      Semua
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
                    >
                      Menunggu
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
                    >
                      Disetujui
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
                    >
                      Ditolak
                    </TabsTrigger>
                  </TabsList>
                </div>
              </ScrollArea>
            </div>

            <TabsContent value="all" className="mt-0">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Tidak ada laporan</p>
                  {user.role === "branch_user" && canCreate && (
                    <Link to="/create-report">
                      <Button variant="outline" className="mt-4">
                        Buat Laporan Pertama
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReports().map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {["draft", "pending", "approved", "rejected"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {filteredReports().length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Tidak ada laporan{" "}
                      {tab === "draft"
                        ? "draf"
                        : tab === "pending"
                        ? "menunggu"
                        : tab === "approved"
                        ? "disetujui"
                        : "ditolak"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReports().map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {/* Only city admins can reject */}
      {user.role === "city_admin" && (
        <RejectDialog
          isOpen={isRejectDialogOpen}
          onClose={() => {
            setIsRejectDialogOpen(false);
            setSelectedReportId(null);
          }}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}
