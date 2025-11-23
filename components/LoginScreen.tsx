import React from 'react';
import { UserMode } from '../types';
import { Heart, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: UserMode) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Bienvenido</h1>
        <p className="text-slate-500">Selecciona tu perfil para acceder</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Libertad Button */}
        <button
          onClick={() => onLogin('libertad')}
          className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-rose-100 shadow-xl hover:shadow-2xl shadow-rose-100/50 transition-all duration-300 transform hover:-translate-y-1 text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart size={32} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Libertad</h2>
            <p className="text-slate-400 text-sm">Acceso a Wishlist, Beauty Studio y Consultoría.</p>
          </div>
        </button>

        {/* David Button */}
        <button
          onClick={() => onLogin('admin')}
          className="group relative overflow-hidden bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-xl hover:shadow-2xl shadow-blue-100/50 transition-all duration-300 transform hover:-translate-y-1 text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-200">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-blue-900 mb-2">David</h2>
            <p className="text-blue-600/70 text-sm">Panel de Administración y Gestión.</p>
          </div>
        </button>
      </div>
      
      <footer className="fixed bottom-8 text-slate-300 text-xs font-mono">
        Secure Access v3.1
      </footer>
    </div>
  );
};