import * as React from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { EmergencyService } from '@/src/services/emergency-service';
import { Button } from '@/components/ui/button';
import { Send, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export function ReportChat({ reportId }: { reportId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const unsub = EmergencyService.subscribeToMessages(reportId, setMessages);
    return unsub;
  }, [reportId]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await EmergencyService.sendMessage(reportId, inputText.trim());
      setInputText('');
    } catch (e) {
      console.error("Message send failed", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[300px] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Communication Log</h4>
        <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-40">
              <ShieldCheck className="w-8 h-8 text-blue-300" />
              <p className="text-[10px] font-medium leading-relaxed">
                Start a secure conversation with responders. All messages are logged for safety.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.uid;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${
                    isMine 
                      ? 'bg-[#1e3a8a] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">
                      {isMine ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[8px] text-gray-300">•</span>
                    <span className="text-[8px] text-gray-300">
                      {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-2 bg-white border-t border-gray-100 flex gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-xs font-medium outline-none border-0 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputText.trim() || sending}
          className="rounded-xl bg-[#1e3a8a] hover:bg-black transition-colors h-9 w-9 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
