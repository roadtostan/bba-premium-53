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
import { Report } from "@/types";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingActionReports, setPendingActionReports] = useState<Report[]>(
    []
  );

  useEffect(() => {
    async function loadData() {
      if (user) {
        const [reportsData, pendingData] = await Promise.all([
          getReportsByUser(user.id),
          getPendingActionReports(user.id),
        ]);
        setReports(reportsData);
        setPendingActionReports(pendingData);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

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
    // In a real app, this would call an API
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
    // In a real app, this would open a dialog to enter rejection reason and then call an API
    const reason = prompt("Please enter a reason for rejection:");
    if (reason === null) return; // User canceled

    const updatedReports = [...reports];
    const reportIndex = updatedReports.findIndex((r) => r.id === reportId);

    if (reportIndex !== -1) {
      updatedReports[reportIndex].status = "rejected";
      updatedReports[reportIndex].rejection_reason =
        reason || "No reason provided";

      setReports(updatedReports);
      setPendingActionReports(
        pendingActionReports.filter((r) => r.id !== reportId)
      );

      toast.info(
        `Report "${updatedReports[reportIndex].title}" has been rejected`
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
              Selamat datang kembali, {user.name}
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

        {/* Laporan yang membutuhkan tindakan (untuk admin) */}
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
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Pesan tidak bisa membuat laporan baru */}
        {user.role === "branch_user" && !canCreate && (
          <div className="mb-8 p-4 border rounded-lg bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            <p className="text-sm">
              Anda memiliki laporan yang menunggu persetujuan. Anda dapat
              membuat laporan baru setelah semua laporan yang tertunda diproses.
            </p>
          </div>
        )}

        {/* Semua Laporan */}
        <div>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b mb-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Semua Laporan
                </TabsTrigger>
                {user.role === "branch_user" && (
                  <TabsTrigger
                    value="draft"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    Draf
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Menunggu
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Disetujui
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Ditolak
                </TabsTrigger>
              </TabsList>
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
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Struktur yang sama untuk tab lainnya */}
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
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
