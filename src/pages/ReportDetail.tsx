
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import NavBar from '@/components/NavBar';
import { getReportById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Report, ReportStatus } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Clock, CheckCheck, X, MessageSquare, Send, FileEdit } from 'lucide-react';
import { canEditReport } from '@/lib/data';

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
        toast.error('Failed to load report');
      }
    }
    loadReport();
  }, [id]);
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  if (!report) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Report Not Found</h1>
          <p className="mt-4">The report you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/">
            <Button className="mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="status-badge bg-secondary text-secondary-foreground">Draft</Badge>;
      case 'pending_subdistrict':
        return <Badge variant="outline" className="status-badge status-pending">Pending Sub-district</Badge>;
      case 'pending_city':
        return <Badge variant="outline" className="status-badge status-pending">Pending City</Badge>;
      case 'approved':
        return <Badge variant="outline" className="status-badge status-approved">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="status-badge status-rejected">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'pending_subdistrict':
      case 'pending_city':
        return <Clock className="h-5 w-5 text-status-pending" />;
      case 'approved':
        return <CheckCheck className="h-5 w-5 text-status-approved" />;
      case 'rejected':
        return <X className="h-5 w-5 text-status-rejected" />;
      default:
        return null;
    }
  };
  
  const canApprove = user && (
    (user.role === 'subdistrict_admin' && report.status === 'pending_subdistrict' && report.subdistrictName === user.subdistrict) ||
    (user.role === 'city_admin' && report.status === 'pending_city' && report.cityName === user.city)
  );
  
  const isEditable = user && canEditReport(user.id, report.id);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const updatedReport = { ...report };
      
      if (user.role === 'subdistrict_admin' && report.status === 'pending_subdistrict') {
        updatedReport.status = 'pending_city';
        toast.success(`Report approved and sent to City Admin`);
      } else if (user.role === 'city_admin' && report.status === 'pending_city') {
        updatedReport.status = 'approved';
        toast.success(`Report approved successfully`);
      }
      
      setReport(updatedReport);
    } catch (error) {
      toast.error("Failed to approve report");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return; // User canceled
    
    setIsSubmitting(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const updatedReport = { ...report };
      updatedReport.status = 'rejected';
      updatedReport.rejectionReason = reason || 'No reason provided';
      
      setReport(updatedReport);
      toast.info(`Report has been rejected`);
    } catch (error) {
      toast.error("Failed to reject report");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const newComment = {
        id: `c${Date.now()}`,
        text: comment,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString()
      };
      
      const updatedReport = { ...report };
      updatedReport.comments = [...(updatedReport.comments || []), newComment];
      
      setReport(updatedReport);
      setComment('');
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
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
              Back
            </Button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold">{report.title}</h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                {getStatusBadge(report.status)}
              </div>
            </div>
            
            <div className="mt-2 text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>Branch: {report.branchName}</span>
              <span>•</span>
              <span>Date: {format(new Date(report.date), 'PPP')}</span>
              <span>•</span>
              <span>Created: {format(new Date(report.createdAt), 'PPP')}</span>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                Sales information for {report.branchName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
                <p className="whitespace-pre-line">{report.content}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Sales</h3>
                <p className="text-xl font-bold">${report.totalSales.toLocaleString()}</p>
              </div>
              
              {report.status === 'rejected' && report.rejectionReason && (
                <div className="p-4 bg-status-rejected/5 rounded-md border border-status-rejected/20">
                  <h3 className="text-sm font-medium text-status-rejected mb-2">Rejection Reason</h3>
                  <p>{report.rejectionReason}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-4">
              {isEditable && (
                <Link to={`/edit-report/${report.id}`}>
                  <Button variant="outline" className="button-transition flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    Edit Report
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
                    Reject
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="button-transition text-status-approved border-status-approved/20 hover:bg-status-approved/10"
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </h2>
            
            <div className="space-y-4 mb-6">
              {(!report.comments || report.comments.length === 0) ? (
                <p className="text-muted-foreground text-center py-6">No comments yet</p>
              ) : (
                report.comments.map(comment => (
                  <div key={comment.id} className="p-4 glass-panel rounded-lg border">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{comment.userName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSubmitComment} className="glass-panel p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Add a Comment</h3>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment here..."
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !comment.trim()}
                  className="button-transition flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
