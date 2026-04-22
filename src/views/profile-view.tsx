import * as React from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, MapPin, Mail, Settings, BadgeCheck, LogOut, Edit2, Save, X as CloseIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { EmergencyService } from '@/src/services/emergency-service';
import { toast } from 'sonner';

export function ProfileView() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [lastLocation, setLastLocation] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setLastLocation(profile.lastLocation || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await EmergencyService.updateProfile(user.uid, {
        displayName,
        lastLocation
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="relative flex flex-col items-center pt-8 pb-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-xl mx-auto overflow-hidden">
             {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
                <User className="w-12 h-12 text-gray-300" />
             )}
          </div>
          {profile?.role === 'official' && (
            <div className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full border-2 border-white text-white">
               <BadgeCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {isEditing ? (
           <div className="mt-4 w-full max-w-xs space-y-2">
              <input 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-center text-xl font-bold border-b border-blue-200 focus:border-blue-500 outline-none bg-transparent"
                placeholder="Display Name"
              />
              <p className="text-gray-400 text-xs text-center flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" /> {profile?.email}
              </p>
           </div>
        ) : (
          <div className="text-center mt-4">
            <h2 className="text-2xl font-black tracking-tight text-[#1e3a8a]">{profile?.displayName}</h2>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1 mt-1 font-medium italic">
              <Mail className="w-3 h-3" /> {profile?.email}
            </p>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full"
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
        >
           {isEditing ? <CloseIcon className="w-5 h-5 text-gray-400" /> : <Edit2 className="w-5 h-5 text-gray-400" />}
        </Button>
      </header>

      <div className="space-y-4">
         <Card className="border-gray-100 bg-white shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-4">
               <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                     <Shield className="w-4 h-4 text-blue-500" />
                     <span className="text-xs font-black uppercase tracking-widest text-gray-400">Account Role</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                     {profile?.role}
                  </span>
               </div>
               
               <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                     <MapPin className="w-4 h-4 text-blue-500" />
                     <span className="text-xs font-black uppercase tracking-widest text-gray-400">Current Location</span>
                  </div>
                  {isEditing ? (
                    <input 
                      value={lastLocation}
                      onChange={(e) => setLastLocation(e.target.value)}
                      className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="e.g. City Square, Kampala"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                      {profile?.lastLocation || 'Not specified'}
                    </div>
                  )}
               </div>
            </CardContent>
         </Card>

         {isEditing && (
            <Button 
              className="w-full bg-[#1e3a8a] h-12 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
         )}

         <Card className="border-gray-100 bg-white shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Settings className="w-3 h-3" /> System Control
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-1">
               <Button variant="ghost" className="w-full justify-start text-xs h-12 px-0 font-bold text-gray-600">
                  Notification Prefrences
               </Button>
               <Button variant="ghost" className="w-full justify-start text-xs h-12 px-0 text-red-600 font-bold hover:bg-red-50" onClick={() => signOut(auth)}>
                  <LogOut className="w-4 h-4 mr-2" /> Terminate Session
               </Button>
            </CardContent>
         </Card>
      </div>

      <div className="text-center pt-8">
         <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">KCCA CITIZENLINK v1.0.0</p>
      </div>
    </div>
  );
}
