import React, { useState } from 'react';
import { SectionId, WishlistItem, MakeupProduct, Message, AppData, SyncStatus, CategoryId } from '../types';
import { WishlistSection } from './WishlistSection';
import { LegalSection } from './LegalSection';
import { MakeupSection } from './MakeupSection';
import { MailboxSection } from './MailboxSection';
import { SettingsModal } from './SettingsModal';
import { Heart, Scale, Brush, Mail, Cloud, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';

interface LibertadViewProps {
  data: AppData;
  syncStatus: SyncStatus;
  onLogout: () => void;
  
  // Handlers
  wishlistHandlers: {
    add: (t: string, d: string, c: CategoryId) => void;
    toggle: (id: string) => void;
    delete: (id: string) => void;
  };
  makeupHandlers: {
    add: (p: MakeupProduct) => void;
    remove: (id: string) => void;
  };
  mailboxHandlers: {
    send: (text: string) => void;
    markRead: (id: string) => void;
  };
}

export const LibertadView: React.FC<LibertadViewProps> = ({
  data,
  syncStatus,
  onLogout,
  wishlistHandlers,
  makeupHandlers,
  mailboxHandlers
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('wishlist');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const unreadCount = data.mailbox.filter(m => !m.read && m.sender === 'admin').length;

  const renderSection = () => {
    switch (activeSection) {
      case 'wishlist': 
        return <WishlistSection 
          items={data.wishlist} 
          onAddItem={wishlistHandlers.add} 
          onToggleItem={wishlistHandlers.toggle} 
          onDeleteItem={wishlistHandlers.delete}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />;
      case 'legal': return <LegalSection />;
      case 'makeup': 
        return <MakeupSection 
          products={data.makeup} 
          onAddProduct={makeupHandlers.add} 
          onRemoveProduct={makeupHandlers.remove}
        />;
      case 'mailbox':
        return <MailboxSection 
          messages={data.mailbox}
          currentUser="libertad"
          onSendMessage={mailboxHandlers.send}
          onMarkAsRead={mailboxHandlers.markRead}
        />;
      default: return null;
    }
  };

  const getThemeColors = () => {
    switch (activeSection) {
      case 'wishlist': return 'bg-rose-50 text-rose-900 border-rose-200 selection:bg-rose-200';
      case 'legal': return 'bg-slate-50 text-slate-900 border-slate-200 selection:bg-blue-200';
      case 'makeup': return 'bg-purple-50 text-purple-900 border-purple-200 selection:bg-purple-200';
      case 'mailbox': return 'bg-amber-50 text-amber-900 border-amber-200 selection:bg-amber-200';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getThemeColors()} md:pl-24`}>
      
      {/* Desktop Sidebar */}
      <nav className="fixed hidden md:flex flex-col left-0 top-0 bottom-0 w-24 bg-white border-r z-50 items-center py-8 justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <button onClick={onLogout} className="font-serif text-2xl font-bold tracking-tighter hover:text-rose-500 transition-colors" title="Cerrar Sesión">L.</button>
        
        <div className="flex flex-col gap-6 w-full px-4">
          <NavButton 
            id="wishlist" active={activeSection} onClick={setActiveSection} 
            icon={<Heart size={22} />} label="Deseos" color="text-rose-500" bg="bg-rose-50"
          />
          <NavButton 
            id="legal" active={activeSection} onClick={setActiveSection} 
            icon={<Scale size={22} />} label="Legal" color="text-slate-700" bg="bg-slate-100"
          />
          <NavButton 
            id="makeup" active={activeSection} onClick={setActiveSection} 
            icon={<Brush size={22} />} label="Beauty" color="text-purple-500" bg="bg-purple-50"
          />
          <NavButton 
            id="mailbox" active={activeSection} onClick={setActiveSection} 
            icon={<Mail size={22} />} label="Buzón" color="text-amber-600" bg="bg-amber-50"
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-4">
           <button onClick={onLogout} className="text-slate-300 hover:text-slate-600"><LogOut size={16} /></button>
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="relative group"
             title={syncStatus === 'idle' ? 'Sin sincronizar' : syncStatus === 'saved' ? 'Sincronizado' : 'Guardando...'}
           >
              {syncStatus === 'syncing' && <Loader2 size={16} className="text-yellow-400 animate-spin" />}
              {syncStatus === 'saved' && <CheckCircle size={16} className="text-emerald-400" />}
              {syncStatus === 'error' && <AlertCircle size={16} className="text-red-400" />}
              {syncStatus === 'idle' && <Cloud size={16} className="text-slate-300" />}
           </button>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
          <MobileNavButton id="wishlist" active={activeSection} onClick={setActiveSection} icon={<Heart size={24} />} label="Deseos" activeColor="text-rose-500" />
          <MobileNavButton id="legal" active={activeSection} onClick={setActiveSection} icon={<Scale size={24} />} label="Legal" activeColor="text-slate-800" />
          <MobileNavButton id="makeup" active={activeSection} onClick={setActiveSection} icon={<Brush size={24} />} label="Beauty" activeColor="text-purple-500" />
          <MobileNavButton 
            id="mailbox" active={activeSection} onClick={setActiveSection} 
            icon={<Mail size={24} />} label="Buzón" activeColor="text-amber-600" 
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 pt-8 md:pt-12 min-h-[calc(100vh-80px)]">
        {renderSection()}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

// Components helpers for Nav
interface NavBtnProps { id: SectionId; active: SectionId; onClick: (id: SectionId) => void; icon: React.ReactNode; label: string; color: string; bg: string; badge?: number; }
const NavButton: React.FC<NavBtnProps> = ({ id, active, onClick, icon, label, color, bg, badge }) => {
  const isActive = active === id;
  return (
    <button onClick={() => onClick(id)} className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group w-full ${isActive ? `${bg} ${color} shadow-sm` : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
      {icon}
      {badge && <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold shadow-sm">{badge}</span>}
      <span className={`absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap`}>{label}</span>
    </button>
  );
};

const MobileNavButton: React.FC<{ id: SectionId, active: SectionId, onClick: (id: SectionId) => void, icon: React.ReactNode, label: string, activeColor: string, badge?: number }> = ({ id, active, onClick, icon, label, activeColor, badge }) => {
  const isActive = active === id;
  return (
    <button onClick={() => onClick(id)} className={`relative flex flex-col items-center justify-center w-full py-2 transition-colors ${isActive ? activeColor : 'text-slate-300'}`}>
      <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
        {icon}
        {badge && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold shadow-sm border border-white">{badge}</span>}
      </div>
      <span className={`text-[10px] font-medium mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
};