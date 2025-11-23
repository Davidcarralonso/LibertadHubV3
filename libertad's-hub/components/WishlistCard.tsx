import React from 'react';
import { WishlistItem } from '../types';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

interface WishlistCardProps {
  item: WishlistItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ item, onToggle, onDelete }) => {
  return (
    <div 
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ease-in-out shadow-sm hover:shadow-md
      ${item.isCompleted 
        ? 'bg-rose-50/50 border-rose-100 opacity-75' 
        : 'bg-white border-white shadow-rose-100/50'
      }`}
    >
      <div className="flex items-start gap-3 mb-1">
        <button 
          onClick={() => onToggle(item.id)}
          className={`mt-0.5 flex-shrink-0 transition-colors duration-200 ${
            item.isCompleted ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
          }`}
        >
          {item.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
        </button>

        <div className="flex-grow min-w-0">
          <h3 className={`font-medium text-lg font-serif leading-tight break-words ${
            item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}>
            {item.title}
          </h3>
          
          {item.description && (
            <p className={`mt-2 text-sm leading-relaxed ${
              item.isCompleted ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {item.description}
            </p>
          )}
        </div>

        <button 
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-300 hover:text-red-400 p-1 -mr-2 -mt-2"
          aria-label="Delete item"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* Footer Metadata */}
      <div className="flex items-center justify-end mt-2 pt-2 border-t border-transparent group-hover:border-slate-50 transition-colors">
        <div className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};