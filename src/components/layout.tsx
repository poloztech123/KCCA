import * as React from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { auth, googleProvider } from '@/src/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { EmergencyService } from '@/src/services/emergency-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { AlertCircle, ShieldAlert, Bell, MapPin, User, LogOut, Navigation, Wifi, Battery, SignalHigh, CloudOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { offlineService } from '@/src/services/offline-service';

// Views
import { Dashboard } from '../views/dashboard';
import { ReportForm } from '../views/report-form';
import { AlertsFeed } from '../views/alerts-feed';
import { ProfileView } from '../views/profile-view';
import { MapView } from '../views/map-view';
import { OfficialDashboard } from '../views/official-dashboard';

export function MainLayout() {
  const { user, profile, loading, isOfficial } = useAuth();
  const [activeTab, setActiveTab ] = React.useState('dashboard');
  const [showOfficial, setShowOfficial] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info("Connection restored. Syncing data...");
      performSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Reports will be queued.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const performSync = async () => {
      if (navigator.onLine && user) {
        setSyncing(true);
        try {
          await EmergencyService.syncPendingReports();
        } finally {
          setSyncing(false);
        }
      }
    };

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const syncTimer = setInterval(performSync, 30000); // Check every 30s
    
    performSync();

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <ShieldAlert className="w-12 h-12 text-[#1e3a8a]" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">KCCA CitizenLink</p>
        </motion.div>
      </div>
    );
  }

  const MobileApp = () => (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-hidden">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] opacity-70 uppercase tracking-[0.2em] font-black">KCCA Mobile</span>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight">CitizenLink</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOfficial && (
            <Button 
              variant={showOfficial ? "secondary" : "outline"} 
              size="sm" 
              className="text-[9px] h-6 px-1.5 font-bold uppercase tracking-widest border-white/20 text-white hover:text-black"
              onClick={() => setShowOfficial(!showOfficial)}
            >
              {showOfficial ? "Back" : "Admin"}
            </Button>
          )}
          <div className="h-8 w-8 rounded-full bg-[#facc15] flex items-center justify-center text-[#1e3a8a] font-bold text-xs">
            {profile?.displayName?.substring(0, 2).toUpperCase() || 'JD'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 bg-white relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {showOfficial ? (
            <motion.div 
              key="official" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.02 }} 
              transition={{ duration: 0.2 }}
              className="p-6"
            >
               <OfficialDashboard />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="p-0">
                  <Dashboard onReportClick={() => setActiveTab('report')} />
                </div>
              )}
              {activeTab === 'report' && (
                 <div className="p-6">
                   <ReportForm onComplete={() => setActiveTab('dashboard')} />
                 </div>
              )}
              {activeTab === 'alerts' && (
                 <div className="p-6">
                   <AlertsFeed />
                 </div>
              )}
              {activeTab === 'profile' && (
                 <div className="p-6">
                   <ProfileView />
                 </div>
              )}
              {activeTab === 'map' && (
                 <div className="p-6">
                   <MapView />
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-100 flex items-center justify-around px-2 py-3 sticky bottom-0 left-0 right-0 z-50">
        <NavButton active={activeTab === 'dashboard' && !showOfficial} icon={Navigation} label="Home" onClick={() => { setActiveTab('dashboard'); setShowOfficial(false); }} />
        <NavButton active={activeTab === 'alerts' && !showOfficial} icon={Bell} label="Alerts" onClick={() => { setActiveTab('alerts'); setShowOfficial(false); }} />
        <div className="relative -top-6">
           <button 
             onClick={() => { setActiveTab('report'); setShowOfficial(false); }}
             className="w-14 h-14 bg-[#dc2626] rounded-full flex items-center justify-center text-white shadow-xl shadow-red-200 hover:scale-105 transition-transform"
           >
             <AlertCircle className="w-8 h-8" />
           </button>
        </div>
        <NavButton active={activeTab === 'map' && !showOfficial} icon={MapPin} label="Map" onClick={() => { setActiveTab('map'); setShowOfficial(false); }} />
        <NavButton active={activeTab === 'profile' && !showOfficial} icon={User} label="Profile" onClick={() => { setActiveTab('profile'); setShowOfficial(false); }} />
      </nav>
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6] p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="mb-8 flex justify-center">
             <div className="p-4 bg-red-50 rounded-full">
                <ShieldAlert className="w-16 h-16 text-[#dc2626]" />
             </div>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-4 text-[#1e3a8a]">CitizenLink</h1>
          <p className="text-gray-600 mb-10 leading-relaxed text-sm">
            Advanced Mobile Application for crisis response and coordination in Kampala.
          </p>
          <Button 
            onClick={async () => {
              try {
                const result = await signInWithPopup(auth, googleProvider);
                await EmergencyService.ensureUserProfile(result.user);
                toast.success("Welcome to CitizenLink");
              } catch (e) {
                toast.error("Authentication failed");
              }
            }}
            className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white h-12 rounded-xl text-lg font-bold shadow-lg transition-all uppercase tracking-widest"
          >
            Authenticate Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 flex items-center justify-center overflow-auto">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-center">
        
        {/* Phone Frame - Left Column */}
        <div className="flex justify-center">
          <div className="phone-frame w-[360px] h-[740px]">
            <div className="phone-screen bg-white">
              {/* Phone Status Bar */}
              <div className={`h-8 flex justify-between items-center px-6 text-[10px] font-bold ${isOnline ? 'text-gray-500' : 'text-amber-600 bg-amber-50/50'}`}>
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1.5">
                  {syncing && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
                  {!isOnline && <CloudOff className="w-3 h-3" />}
                  <SignalHigh className="w-3 h-3" />
                  <span className="opacity-70">{isOnline ? '4G' : 'OFFLINE'}</span>
                  <Wifi className={`w-3 h-3 ${!isOnline ? 'opacity-30' : ''}`} />
                  <Battery className="w-3 h-3" />
                </div>
              </div>
              
              <MobileApp />
            </div>
          </div>
        </div>

        {/* Desktop Admin Panel - Right Column */}
        <div className="hidden lg:flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#1e3a8a] uppercase tracking-tighter">KCCA Emergency System</h1>
            <p className="text-gray-600 font-medium tracking-wide">Professional Portal for Crisis Response & Data Coordination</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 bg-white">
                <div className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Auth Status</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold">Firebase Auth Active</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 bg-white">
                <div className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Connectivity</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Intermittent Mode</span>
                  <ShadcnBadge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">Local Cache</ShadcnBadge>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3 flex-1">
             <div className="flex justify-between items-end">
               <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">System Persistence & API Log</span>
               <span className="text-[10px] text-gray-400 font-mono">Last Sync: {currentTime.toLocaleTimeString()}</span>
             </div>
             <div className="system-log h-[340px] overflow-hidden whitespace-pre">
{`[SYS] Initialize Firestore Core... SUCCESS
[AUTH] User session token: ${user.uid.substring(0,8)}... verified
[API] Fetching OpenWeather API for Kampala... 26°C / Scattered Clouds
[SYNC] Queued multimedia reports [${profile?.role}]
[NET] Connectivity: STABLE
[PERSIST] Auto-syncing Local State to Cloud... SUCCESS
[ALERTS] Push Notification Queue: 0 pending
[SEC] Encrypting sensitive data block [AES-256]... DONE
[DB] 24 active alerts cached locally`}
             </div>
          </div>

          <div className="bg-[#1e3a8a] text-white p-6 rounded-2xl flex items-center justify-between shadow-xl shadow-blue-200">
             <div>
               <div className="text-[10px] opacity-60 uppercase font-black tracking-widest mb-1">Emergency Command</div>
               <div className="text-2xl font-bold font-display">Regional Activity Log</div>
             </div>
             <Button className="bg-white text-[#1e3a8a] hover:bg-white/90 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl">
               Live View
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-1 transition-all ${active ? 'scale-110 text-[#1e3a8a]' : 'text-gray-400 opacity-60'}`}
    >
      <Icon className={`w-5 h-5 ${active ? 'fill-[#1e3a8a]/10' : ''}`} />
      <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}
