
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { createReport, updateReport, getReportById } from '@/lib/data';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface ReportFormProps {
  reportId?: string;
}

const ReportForm: React.FC<ReportFormProps> = ({ reportId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If editing an existing report, fetch its details
    const fetchReportDetails = async () => {
      if (reportId) {
        try {
          const report = await getReportById(reportId);
          if (report) {
            setTitle(report.title || '');
            setContent(report.content || '');
          }
        } catch (error) {
          console.error('Error fetching report details:', error);
          toast.error('Gagal memuat detail laporan');
        }
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Anda harus login');
      return;
    }

    setIsLoading(true);

    try {
      const reportData = {
        title,
        content,
        // Add other necessary fields
      };

      if (reportId) {
        // Update existing report
        await updateReport(reportId, reportData);
        toast.success('Laporan berhasil diperbarui');
      } else {
        // Create new report
        await createReport(reportData);
        toast.success('Laporan berhasil dibuat');
      }

      navigate('/');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(reportId ? 'Gagal memperbarui laporan' : 'Gagal membuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2">Judul Laporan</label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Masukkan judul laporan"
        />
      </div>

      <div>
        <label htmlFor="content" className="block mb-2">Isi Laporan</label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis detail laporan"
          rows={5}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {reportId ? 'Perbarui Laporan' : 'Buat Laporan'}
      </Button>
    </form>
  );
};

export default ReportForm;
