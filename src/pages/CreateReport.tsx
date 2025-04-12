
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import NavBar from "@/components/NavBar";
import { canCreateNewReport, getReportById, canEditReport } from "@/lib/data";
import { toast } from "sonner";
import ReportForm from "@/components/ReportForm";

export default function CreateReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [checkPerformed, setCheckPerformed] = useState(false);

  // Check if user can edit this report or create new one
  useEffect(() => {
    async function checkPermissions() {
      // Only perform this check once
      if (checkPerformed) return;
      
      try {
        setIsLoading(true);
        
        if (id) {
          // Edit mode
          if (!user) return;
          
          const report = await getReportById(id);
          if (!report) {
            toast.error("Laporan tidak ditemukan");
            navigate("/");
            return;
          }
          
          const hasEditPermission = await canEditReport(user.id, id);
          if (!hasEditPermission) {
            toast.error("Anda tidak memiliki izin untuk mengedit laporan ini");
            navigate("/");
            return;
          }
          
          setCanEdit(true);
        } else {
          // Create mode - only for branch users
          if (!user || user.role !== 'branch_user') {
            toast.error("Hanya user cabang yang dapat membuat laporan");
            navigate("/");
            return;
          }
          
          const canCreateReport = await canCreateNewReport(user.id);
          if (!canCreateReport) {
            toast.error("Anda masih memiliki laporan yang belum disetujui");
            navigate("/");
            return;
          }
          
          setCanEdit(true);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        toast.error("Terjadi kesalahan saat memeriksa izin");
        navigate("/");
      } finally {
        setCheckPerformed(true);
        setIsLoading(false);
      }
    }
    
    checkPermissions();
  }, [id, user, navigate, checkPerformed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <NavBar />
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <NavBar />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">
          {id ? "Edit Laporan" : "Buat Laporan Baru"}
        </h1>
        {canEdit && <ReportForm reportId={id} />}
      </main>
    </div>
  );
}
