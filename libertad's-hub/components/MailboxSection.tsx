import React, { useState, useRef, useEffect } from 'react';
import { Message, UserMode } from '../types';
import { Send } from 'lucide-react';

interface MailboxSectionProps {
  messages: Message[];
  currentUser: UserMode;
  onSendMessage: (text: string) => void;
  onMarkAsRead: (id: string) => void;
}

export const MailboxSection: React.FC<MailboxSectionProps> = ({
  messages,
  currentUser,
  onSendMessage,
  onMarkAsRead
}) => {
  const [newMessage, setNewMessage] = useState('');
  
  // Mark messages from the OTHER person as read when viewed
  useEffect(() => {
    const unreadMessages = messages.filter(m => m.sender !== currentUser && !m.read);
    
    // Small delay to allow the "New" badge to be seen briefly or ensuring logic doesn't race
    const timer = setTimeout(() => {
        if (unreadMessages.length > 0) {
            unreadMessages.forEach(m => onMarkAsRead(m.id));
        }
    }, 2000); // Mark as read after 2 seconds of viewing

    return () => clearTimeout(timer);
  }, [messages, currentUser, onMarkAsRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper to generate random rotation for sticky note effect based on ID
  const getRotation = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const deg = (sum % 6) - 3; // between -3 and 3 degrees
    return deg;
  };

  // Sort Newest First
  const sortedMessages = [...messages].sort((a, b) => b.date - a.date);

  return (
    <div className="animate-fadeIn h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col relative">
      
      {/* Header */}
      <header className="flex-shrink-0 mb-6 flex items-center justify-between px-2">
        <div>
          <h1 className={`text-2xl font-serif font-bold ${currentUser === 'admin' ? 'text-slate-100' : 'text-rose-900'}`}>
            Tablón de Mensajes
          </h1>
          <p className={`text-sm font-serif italic ${currentUser === 'admin' ? 'text-slate-400' : 'text-rose-500'}`}>
            Notas dejadas con amor
          </p>
        </div>
      </header>

      {/* Input Area - styled as a note paper (Now at Top for easy access) */}
      <div className="flex-shrink-0 relative z-30 pb-6">
        <form onSubmit={handleSend} className="relative max-w-2xl mx-auto">
           {/* Paper look */}
           <div className={`relative rounded-lg shadow-xl overflow-hidden transform transition-all focus-within:-translate-y-1 focus-within:shadow-2xl border-b-4 border-r-4 ${
               currentUser === 'admin' ? 'bg-slate-800 border-slate-950' : 'bg-white border-slate-200'
           }`}>
               <textarea
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 placeholder="Escribe una nota nueva..."
                 rows={2}
                 className={`w-full p-6 font-serif text-lg outline-none resize-none ${
                    currentUser === 'admin' 
                        ? 'bg-slate-800 text-white placeholder:text-slate-600' 
                        : 'bg-white text-slate-800 placeholder:text-slate-300'
                 }`}
               />
               <div className="flex justify-between items-center px-4 pb-4 bg-inherit">
                  <span className={`text-xs font-serif italic ${currentUser === 'admin' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Se pegará al principio
                  </span>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-full transition-all shadow-md ${
                      !newMessage.trim() 
                        ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400' 
                        : 'hover:scale-110 active:scale-95 bg-rose-500 text-white shadow-rose-200'
                    }`}
                  >
                    <Send size={20} />
                  </button>
               </div>
           </div>
        </form>
      </div>

      {/* Corkboard / Wall Area */}
      <div className={`flex-grow overflow-y-auto p-4 md:p-8 rounded-3xl mb-4 scrollbar-hide border-2 border-dashed ${
        currentUser === 'admin' ? 'bg-slate-900/50 border-slate-800' : 'bg-amber-50/50 border-amber-200/50'
      }`}>
        
        {sortedMessages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-8">
              <div className="rotate-3 bg-yellow-100 p-6 shadow-lg mb-4 max-w-xs relative">
                  <div className="w-8 h-3 bg-white/40 absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
                  <p className="font-serif text-slate-700 text-lg">¡El tablón está vacío!</p>
                  <p className="font-serif text-slate-500 text-sm mt-2">Escribe la primera notita...</p>
              </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {sortedMessages.map((msg) => {
              const isMe = msg.sender === currentUser;
              const isLibertadSender = msg.sender === 'libertad';
              
              // Colors based on sender
              // Libertad -> Rose/Pink
              // David -> Blue (Requested update)
              const bgColor = isLibertadSender 
                ? 'bg-rose-100 text-rose-900 shadow-rose-200/50' 
                : 'bg-blue-100 text-blue-900 shadow-blue-200/50';

              const rotation = getRotation(msg.id);

              return (
                <div 
                  key={msg.id}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className={`relative p-6 shadow-lg transition-transform hover:scale-105 hover:z-10 group ${bgColor} min-h-[180px] flex flex-col justify-between`}
                >
                   {/* New Message Indicator */}
                   {!isMe && !msg.read && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold font-serif shadow-md animate-bounce z-20 border-2 border-white">
                        !
                      </div>
                   )}

                   {/* Tape Visual */}
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 backdrop-blur-sm shadow-sm rotate-1"></div>

                   <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap mb-4">
                     {msg.text}
                   </p>
                   
                   <div className="pt-3 border-t border-black/5 flex justify-between items-end select-none">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                        {msg.sender === 'admin' ? 'David' : 'Libertad'}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono opacity-50">{formatTime(msg.date)}</span>
                        {isMe && (
                            <span className="text-[9px] opacity-40 mt-0.5 font-bold">
                                {msg.read ? 'LEÍDO' : 'ENVIADO'}
                            </span>
                        )}
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};