import React, { useState, useEffect } from 'react';
import { AppData, WishlistItem, SyncStatus } from '../types';
import { MailboxSection } from './MailboxSection';
import { LogOut, LayoutDashboard, Mail, Heart, Loader2, CheckCircle, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';

interface AdminViewProps {
  data: AppData;
  syncStatus: SyncStatus;
  onLogout: () => void;
  onResetData: () => void;
  mailboxHandlers: {
    send: (text: string) => void;
    markRead: (id: string) => void;
  };
}

export const AdminView: React.FC<AdminViewProps> = ({
  data,
  syncStatus,
  onLogout,
  onResetData,
  mailboxHandlers
}) => {
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const unreadCount = data.mailbox.filter(m => !m.read && m.sender === 'libertad').length;

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (deleteConfirm) {
        const timer = setTimeout(() => setDeleteConfirm(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  const handleDeleteClick = () => {
      if (deleteConfirm) {
          onResetData();
          setDeleteConfirm(false);
      } else {
          setDeleteConfirm(true);
      }
  };

  const groupedWishes = data.wishlist.reduce((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      
      {/* Admin Sidebar */}
      <aside className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-8 justify-between">
        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl">D</div>
        
        <div className="flex flex-col gap-6 w-full px-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`relative p-3 rounded-xl transition-all ${view === 'chat' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Mail size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 items-center w-full px-2">
           {/* Sync Status */}
           <div title={`Status: ${syncStatus}`} className="mb-2">
              {syncStatus === 'syncing' && <Loader2 size={16} className="text-yellow-500 animate-spin" />}
              {syncStatus === 'saved' && <CheckCircle size={16} className="text-emerald-500" />}
              {syncStatus === 'error' && <AlertCircle size={16} className="text-red-500" />}
           </div>

            {/* Danger Zone Button */}
           <button 
             onClick={handleDeleteClick} 
             className={`p-2 rounded-lg transition-all duration-200 ${
                 deleteConfirm 
                 ? 'bg-red-500 text-white animate-pulse' 
                 : 'text-slate-600 hover:bg-red-500/10 hover:text-red-500'
             }`}
             title="Borrar todos los datos (Nube y Local)"
           >
             {deleteConfirm ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
           </button>

           <div className="h-px w-8 bg-slate-800 my-1"></div>

           <button onClick={onLogout} className="text-slate-500 hover:text-slate-300 transition-colors p-2" title="Cerrar Sesión">
             <LogOut size={20} />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {view === 'dashboard' && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <header className="mb-10 flex justify-between items-center">
              <div>
                 <h1 className="text-3xl font-serif font-bold text-white">Dashboard</h1>
                 <p className="text-slate-500">Resumen de actividad de Libertad</p>
              </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 text-slate-400 mb-2 text-sm uppercase font-bold tracking-wider">
                  <Heart size={16} /> Total Deseos
                </div>
                <div className="text-4xl font-mono text-white">{data.wishlist.length}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 text-slate-400 mb-2 text-sm uppercase font-bold tracking-wider">
                  <Mail size={16} /> Mensajes
                </div>
                <div className="text-4xl font-mono text-white">{data.mailbox.length}</div>
              </div>
            </div>

            {/* Wishlist Overview */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Lista de Deseos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(groupedWishes).map(([catId, items]) => (
                  <div key={catId} className="space-y-3">
                    <h3 className="text-emerald-400 font-bold uppercase text-sm tracking-wider">{catId}</h3>
                    <div className="space-y-2">
                      {(items as WishlistItem[]).map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border border-slate-800 bg-slate-900/50 ${item.isCompleted ? 'opacity-50' : ''}`}>
                          <div className="font-medium text-slate-200">{item.title}</div>
                          {item.description && <div className="text-sm text-slate-500 mt-1">{item.description}</div>}
                          {item.isCompleted && <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><CheckCircle size={10} /> Completado</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <MailboxSection 
              messages={data.mailbox}
              currentUser="admin"
              onSendMessage={mailboxHandlers.send}
              onMarkAsRead={mailboxHandlers.markRead}
            />
          </div>
        )}

      </main>
    </div>
  );
};