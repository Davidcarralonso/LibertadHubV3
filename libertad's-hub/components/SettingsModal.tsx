import React from 'react';
import { X, Cloud, CheckCircle, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
            <Cloud size={18} className="text-slate-500" />
            Estado de la Nube
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 text-center">
          
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>

          <div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Sincronización Activa</h3>
             <p className="text-sm text-slate-500 leading-relaxed">
               Tus deseos y productos se están guardando automáticamente en la nube de Libertad.
             </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
             <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={20} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Conexión Segura</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-400">ID de Caja:</span>
                   <span className="font-mono text-slate-600">...be2c6</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-slate-400">Servidor:</span>
                   <span className="font-mono text-slate-600">JSONBin.io V3</span>
                </div>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            Entendido
          </button>

        </div>
      </div>
    </div>
  );
};