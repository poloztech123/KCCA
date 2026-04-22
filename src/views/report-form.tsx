import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EmergencyService } from '@/src/services/emergency-service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type EmergencyType = 'accident' | 'crime' | 'flooding' | 'fire' | 'medical';

const reportSchema = z.object({
  type: z.enum(['accident', 'crime', 'flooding', 'fire', 'medical']),
  description: z.string().min(10, 'Please provide more detail (at least 10 chars)'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm({ onComplete }: { onComplete: () => void }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: 'accident',
      description: '',
    }
  });

  const getPosition = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
          toast.success("Location captured");
        },
        (err) => {
          setLocating(false);
          toast.error("Could not get location. Please enable GPS.");
        }
      );
    } else {
      setLocating(false);
      toast.error("Geolocation not supported by this browser");
    }
  };

  const onSubmit = async (data: any) => {
    if (!location) {
      toast.error("Please provide your location");
      return;
    }
    setSubmitting(true);
    try {
      await EmergencyService.createReport({
        ...data,
        location,
        mediaUrls: [],
      });
      toast.success("Report submitted to KCCA");
      onComplete();
    } catch (e) {
      toast.error("Failed to submit report. It will be synced when you're online.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">New Report</h2>
        <Button variant="ghost" size="icon" onClick={onComplete}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Type of Emergency</Label>
          <Select onValueChange={(v) => setValue('type', v as any)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accident">Road Accident</SelectItem>
              <SelectItem value="crime">Criminal Activity</SelectItem>
              <SelectItem value="flooding">Flooding / Drainage</SelectItem>
              <SelectItem value="fire">Fire Emergency</SelectItem>
              <SelectItem value="medical">Medical / Ambulance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            {...register('description')}
            placeholder="Describe what is happening..."
            className="bg-white min-h-[120px]"
          />
          {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex gap-2">
            <Button 
                type="button" 
                variant="outline" 
                onClick={getPosition}
                disabled={locating}
                className="flex-1 bg-white border-gray-200 h-10"
              >
              {locating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2 text-red-600" />}
              {location ? 'Location Captured' : 'Get My Location'}
            </Button>
          </div>
          {location && (
            <p className="text-[10px] text-gray-400 font-mono">
              GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Multimedia Evidence (Optional)</Label>
          <div className="flex gap-2">
            <Button variant="outline" type="button" className="flex-1 bg-white border-gray-200 border-dashed py-8">
              <Camera className="w-6 h-6 text-gray-400" />
            </Button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-black text-white h-12 rounded-xl text-lg font-bold shadow-lg mt-4"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Report <Send className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>
    </div>
  );
}
