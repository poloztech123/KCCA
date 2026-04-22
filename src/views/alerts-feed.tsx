import * as React from 'react';
import { EmergencyService } from '@/src/services/emergency-service';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Clock, Info, AlertTriangle, CloudSun, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export function AlertsFeed() {
  const [alerts, setAlerts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsub = EmergencyService.subscribeToAlerts(setAlerts);
    return unsub;
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'weather': return <CloudSun className="w-5 h-5 text-blue-500" />;
      case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'traffic': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold tracking-tight">Official Alerts</h2>
        <p className="text-gray-500 text-sm">Verified broadcasts from KCCA Authorities</p>
      </header>

      {alerts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
           <Info className="w-12 h-12 text-gray-200 mx-auto" />
           <p className="text-gray-400 font-medium">No active alerts for your area.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {getIcon(alert.category)}
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 leading-tight">{alert.title}</h4>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed">
                         {alert.message}
                       </p>
                       <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium pt-2">
                         <Clock className="w-3 h-3" />
                         {alert.createdAt?.toDate ? format(alert.createdAt.toDate(), 'PPpp') : 'Recent'}
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
