import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Shield, AlertCircle, CheckCircle2, Navigation2, Info, Navigation, X, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyService } from '@/src/services/emergency-service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ReportChat } from '@/src/components/report-chat';

export function MapView() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [selectedReport, setSelectedReport] = React.useState<any | null>(null);
  const [showChat, setShowChat] = React.useState(false);
  const prevStatuses = React.useRef<Record<string, string>>({});

  const services = [
    { name: "Central Police Station", type: "Police", contact: "+256 414 254561", distance: "0.8km" },
    { name: "Mulago Hospital", type: "Health", contact: "911 / +256 414 531477", distance: "2.4km" },
    { name: "Fire Brigade HQ", type: "Fire", contact: "112 / 999", distance: "1.2km" },
  ];

  React.useEffect(() => {
    const unsubscribe = EmergencyService.subscribeToReports((updatedReports) => {
      setReports(updatedReports);
      
      // Check for status changes
      updatedReports.forEach(report => {
        const oldStatus = prevStatuses.current[report.id];
        if (oldStatus && oldStatus !== report.status) {
          const statusVerb = report.status === 'responding' ? 'is now being handled' : 
                            report.status === 'resolved' ? 'has been resolved' : 
                            `status updated to ${report.status}`;
          
          toast.success(`Incident Update`, {
            description: `Report ...${report.id.slice(-4)} ${statusVerb}.`,
            icon: report.status === 'resolved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-blue-500" />,
          });
        }
        prevStatuses.current[report.id] = report.status;
      });
    });
    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'responding': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'responding': return <Navigation2 className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const handleNavigate = (report: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <header>
        <h2 className="text-xl font-bold tracking-tight text-[#1e3a8a]">Crisis Map</h2>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Real-time incident tracking</p>
      </header>

      {/* Visual Map Placeholder */}
      <div className="relative aspect-[4/3] bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 overflow-hidden shadow-inner flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 20 L100 20 M0 50 L100 50 M0 80 L100 80 M20 0 L20 100 M50 0 L50 100 M80 0 L80 100" stroke="currentColor" fill="none" />
          </svg>
        </div>

        <AnimatePresence>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute cursor-pointer group"
              style={{ 
                left: `${(report.location.lng % 1 + 1) * 40}%`, 
                top: `${(report.location.lat % 1 + 1) * 30}%` 
              }}
              onClick={() => {
                setSelectedReport(report);
                setShowChat(false);
              }}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-lg ${getStatusColor(report.status)} text-white transition-colors duration-500`}>
                {getStatusIcon(report.status)}
                {report.status === 'responding' && (
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-50" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-2 text-blue-300">
           <Navigation2 className="w-8 h-8" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Map Visualization Active</span>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a]">Active Responders</h3>
        {services.map((service, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
               </div>
               <div>
                  <h4 className="font-bold text-[#1e3a8a] text-sm leading-tight">{service.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{service.distance} • {service.type}</p>
               </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50 text-[10px] uppercase font-black tracking-widest">
              Call
            </Button>
          </div>
        ))}
      </div>

      {/* Bottom Sheet Detail View */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 z-[60] backdrop-blur-[1px]"
              onClick={() => setSelectedReport(null)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] p-6 pb-12"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-black text-white ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                      <span className="text-gray-400 text-[10px] font-mono">#{selectedReport.id.slice(-6)}</span>
                   </div>
                   <h3 className="text-xl font-display font-black text-[#1e3a8a] uppercase">{selectedReport.type}</h3>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                  setSelectedReport(null);
                  setShowChat(false);
                }}>
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-4">
                  <Button 
                    variant={showChat ? 'ghost' : 'secondary'} 
                    className={`flex-1 h-9 text-[10px] font-black uppercase tracking-widest rounded-lg ${!showChat ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setShowChat(false)}
                  >
                    Information
                  </Button>
                  <Button 
                    variant={showChat ? 'secondary' : 'ghost'} 
                    className={`flex-1 h-9 text-[10px] font-black uppercase tracking-widest rounded-lg ${showChat ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setShowChat(true)}
                  >
                    Chat Log
                  </Button>
                </div>

                {!showChat ? (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedReport.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Reporter</h4>
                        <p className="text-sm font-bold text-gray-900">{selectedReport.reporterName || 'Citizen'}</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-[#1e3a8a] hover:bg-black text-white h-12 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
                      onClick={() => handleNavigate(selectedReport)}
                    >
                      <Navigation className="w-5 h-5" />
                      Navigate To Site
                    </Button>
                  </>
                ) : (
                  <ReportChat reportId={selectedReport.id} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
