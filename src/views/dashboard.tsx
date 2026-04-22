import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Shield, Clock, ExternalLink, Activity, Info, Wifi, WifiOff } from 'lucide-react';
import { EmergencyService } from '@/src/services/emergency-service';
import { useAuth } from '@/src/hooks/use-auth';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { offlineService } from '@/src/services/offline-service';

export function Dashboard({ onReportClick }: { onReportClick: () => void }) {
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { profile } = useAuth();

  React.useEffect(() => {
    const unsub = EmergencyService.subscribeToAlerts(setAlerts);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start pt-6 px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hello, {profile?.displayName}</h2>
          <p className="text-gray-500 text-sm italic serif">Stay safe, stay connected.</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isOnline ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Connected' : 'Offline Mode'}
        </div>
      </header>

      {/* Emergency Action */}
      <div className="px-6 pt-6">
        <Card className="bg-[#dc2626] text-white border-0 overflow-hidden relative shadow-lg shadow-red-100 rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <AlertTriangle className="w-32 h-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Shield className="w-5 h-5" />
              SOS Reporting
            </CardTitle>
            <p className="text-red-100 text-xs font-medium">Direct link to KCCA Command</p>
          </CardHeader>
          <CardContent className="pb-6">
            <Button 
              onClick={onReportClick}
              className="w-full bg-white text-[#dc2626] hover:bg-red-50 font-black h-12 shadow-sm uppercase tracking-widest text-sm rounded-xl"
            >
              Emergency Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 space-y-6">
        {/* Latest Alert */}
        {alerts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <Bell className="w-3 h-3" /> Official Broadcast
              </h3>
            </div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div className="bg-red-50 border-l-4 border-[#dc2626] p-4 flex items-start gap-4 rounded-r-xl">
                 <div className="mt-1">
                    <Shield className="w-5 h-5 text-[#dc2626]" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-0.5">CRITICAL ALERT</div>
                    <h4 className="font-bold text-red-900 text-sm mb-1">{alerts[0].title}</h4>
                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                      {alerts[0].message}
                    </p>
                 </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Quick Grid */}
        <section className="grid grid-cols-2 gap-3">
          <QuickAction icon="🚗" label="Accident" color="blue" />
          <QuickAction icon="🚨" label="Crime" color="amber" />
          <QuickAction icon="🌊" label="Flood" color="blue" />
          <QuickAction icon="➕" label="Medical" color="red" />
        </section>

        {/* Service Links */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nearby Support</h3>
          <div className="space-y-2">
            <ServiceListItem icon="🏥" name="Mulago Hospital" dist="0.8km" status="Open 24h" />
            <ServiceListItem icon="👮" name="Central Police Post" dist="1.2km" status="Open 24h" />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: any) {
  return (
    <Card className="border border-gray-100 shadow-sm hover:border-blue-200 cursor-pointer transition-colors active:scale-95 rounded-xl">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a]">{label}</div>
      </CardContent>
    </Card>
  );
}

function ServiceListItem({ icon, name, dist, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
          {icon}
        </div>
        <div className="text-xs">
          <div className="font-bold text-[#1e3a8a]">{name}</div>
          <div className="text-gray-500 font-medium">{dist} away • {status}</div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
}
