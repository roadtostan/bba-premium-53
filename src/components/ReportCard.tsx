
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCheck, X, FileText, Edit } from 'lucide-react';
import { Report, ReportStatus } from '@/types';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { canEditReport } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReportCardProps {
  report: Report;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function ReportCard({ report, onApprove, onReject }: ReportCardProps) {
  const { user } = useAuth();
  
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
      case 'draft':
        return <FileText className="h-4 w-4 text-secondary-foreground" />;
      case 'pending_subdistrict':
      case 'pending_city':
        return <Clock className="h-4 w-4 text-status-pending" />;
      case 'approved':
        return <CheckCheck className="h-4 w-4 text-status-approved" />;
      case 'rejected':
        return <X className="h-4 w-4 text-status-rejected" />;
      default:
        return null;
    }
  };

  // Determine if the current user can take action on this report
  const canApprove = user && (
    (user.role === 'subdistrict_admin' && report.status === 'pending_subdistrict' && report.subdistrictName === user.subdistrict) ||
    (user.role === 'city_admin' && report.status === 'pending_city' && report.cityName === user.city)
  );

  const isEditable = user && canEditReport(user.id, report.id);

  return (
    <Card className={cn(
      "w-full card-transition",
      "hover:shadow-md",
      report.status === 'rejected' && "border-status-rejected/20",
      report.status === 'approved' && "border-status-approved/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription>{report.branchName} • {format(new Date(report.date), 'MMM dd, yyyy')}</CardDescription>
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
        {report.status === 'rejected' && report.rejectionReason && (
          <div className="mt-2 p-2 bg-status-rejected/5 rounded-md border border-status-rejected/20">
            <p className="text-xs font-medium text-status-rejected">Rejection reason:</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">{report.rejectionReason}</p>
          </div>
        )}
        <div className="mt-2">
          <p className="text-sm font-semibold">
            Total Sales: ${report.totalSales.toLocaleString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Link to={`/report/${report.id}`}>
          <Button variant="ghost" size="sm" className="button-transition">
            View Details
          </Button>
        </Link>
        <div className="flex gap-2">
          {isEditable && (
            <Link to={`/edit-report/${report.id}`}>
              <Button variant="outline" size="sm" className="button-transition flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </Link>
          )}
          {canApprove && onApprove && onReject && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onReject(report.id)}
                className="button-transition text-status-rejected border-status-rejected/20 hover:bg-status-rejected/10"
              >
                Reject
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onApprove(report.id)}
                className="button-transition text-status-approved border-status-approved/20 hover:bg-status-approved/10"
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
