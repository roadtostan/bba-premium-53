
import { useState, useEffect } from "react";
import { DashboardStatsCard } from "./DashboardStatsCard";
import ReportsTable from "./ReportsTable";
import { getReports } from "@/lib/data";
import { Report } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CalendarDays, CheckCircle, Clock, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subDays } from "date-fns";

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const allReports = await getReports();
        setReports(allReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Calculate statistics
  const totalReports = reports.length;
  const pendingReports = reports.filter(
    r => r.status === "pending_subdistrict" || r.status === "pending_city"
  ).length;
  const approvedReports = reports.filter(r => r.status === "approved").length;
  const rejectedReports = reports.filter(r => r.status === "rejected").length;

  // Calculate daily report count (for trend)
  const today = new Date();
  const reportsToday = reports.filter(
    r => r.created_at && new Date(r.created_at).toDateString() === today.toDateString()
  ).length;

  const yesterday = subDays(today, 1);
  const reportsYesterday = reports.filter(
    r => r.created_at && new Date(r.created_at).toDateString() === yesterday.toDateString()
  ).length;

  // Calculate trend percentage
  const calculateTrend = () => {
    if (reportsYesterday === 0) return { value: 100, isPositive: true };
    const diff = reportsToday - reportsYesterday;
    const percentage = Math.round((diff / reportsYesterday) * 100);
    return { value: Math.abs(percentage), isPositive: percentage >= 0 };
  };

  const trend = calculateTrend();

  // Filter reports based on active tab
  const filteredReports = reports.filter(report => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return report.status === "pending_subdistrict" || report.status === "pending_city";
    if (activeTab === "approved") return report.status === "approved";
    if (activeTab === "rejected") return report.status === "rejected";
    return true;
  });

  // Handle report deletion
  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter(report => report.id !== reportId));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard
          title="Total Laporan"
          value={totalReports}
          description={`${reportsToday} laporan hari ini`}
          icon={BarChart}
          trend={trend}
        />
        <DashboardStatsCard
          title="Menunggu Persetujuan"
          value={pendingReports}
          description="Perlu ditindaklanjuti"
          icon={Clock}
          iconColor="text-amber-500"
        />
        <DashboardStatsCard
          title="Laporan Disetujui"
          value={approvedReports}
          description="Total yang disetujui"
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <DashboardStatsCard
          title="Laporan Ditolak"
          value={rejectedReports}
          description="Perlu perbaikan"
          icon={XCircle}
          iconColor="text-red-500"
        />
      </div>

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

          <TabsContent value={activeTab} className="mt-0">
            <ReportsTable reports={filteredReports} onDelete={handleDeleteReport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
