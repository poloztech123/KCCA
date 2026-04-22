import * as React from 'react';
import { EmergencyService } from '@/src/services/emergency-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';

export function OfficialDashboard() {
  const [reports, setReports] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsub = EmergencyService.subscribeToReports(setReports);
    return unsub;
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold tracking-tight">Command Centre</h2>
        <p className="text-gray-500 text-sm">Managing active emergency reports in Kampala</p>
      </header>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No active reports.</p>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="border-gray-100 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-900 uppercase text-xs">{report.type}</span>
                         <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'} className="text-[9px]">
                           {report.status}
                         </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium pt-2 border-t border-gray-50 mt-2">
                   <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
                   </div>
                   <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.createdAt?.toDate ? format(report.createdAt.toDate(), 'HH:mm') : 'Recently'}
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                   {report.status === 'pending' ? (
                     <Button 
                       size="sm" 
                       className="flex-1 h-8 text-[10px] uppercase font-bold" 
                       variant="outline"
                       onClick={() => EmergencyService.updateReportStatus(report.id, 'responding')}
                     >
                        Dispatch
                     </Button>
                   ) : (
                     <div className="flex-1 h-8 flex items-center justify-center text-[8px] font-black uppercase text-blue-600 bg-blue-50 rounded">
                        Active Response
                     </div>
                   )}
                   {report.status !== 'resolved' && (
                     <Button 
                       size="sm" 
                       className="flex-1 h-8 text-[10px] uppercase font-bold bg-green-600 text-white hover:bg-green-700"
                       onClick={() => EmergencyService.updateReportStatus(report.id, 'resolved')}
                     >
                        Resolve
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
