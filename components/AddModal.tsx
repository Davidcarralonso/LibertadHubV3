import React, { useState, useEffect } from 'react';
import { Category, CategoryId } from '../types';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { getWishlistSuggestions } from '../services/gemini';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: CategoryId;
  categories: Category[];
  onAdd: (title: string, description: string, categoryId: CategoryId) => void;
}

export const AddModal: React.FC<AddModalProps> = ({ 
  isOpen, 
  onClose, 
  activeCategory, 
  categories, 
  onAdd 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>(activeCategory);
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  
  // Reset state when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      setCategoryId(activeCategory);
      setTextSuggestions([]);
      setTitle('');
      setDescription('');
    }
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, description, categoryId);
      onClose();
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTextSuggestions([]);

    try {
      const categoryLabel = categories.find(c => c.id === categoryId)?.label || 'General';
      const ideas = await getWishlistSuggestions(categoryLabel);
      setTextSuggestions(ideas);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectTextSuggestion = (text: string) => {
    setTitle(text);
    setTextSuggestions([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/30 flex-shrink-0">
          <h2 className="text-xl font-serif font-bold text-slate-800">
            Agregar Deseo
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto scrollbar-hide">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Categoría
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    categoryId === cat.id
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Input Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ¿Qué deseas?
              </label>
              
              {/* Contextual AI Action */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isGenerating ? 'Pensando...' : 'Inspírame'}
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Vestido rojo, Cena en la playa..."
                className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 focus:outline-none transition-all placeholder:text-slate-300"
                autoFocus
              />
            </div>

            {/* Text Suggestions (Chips) */}
            {textSuggestions.length > 0 && (
              <div className="mt-3 space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <p className="text-xs text-rose-400 font-medium mb-1">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                  {textSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectTextSuggestion(s)}
                      className="text-left text-sm bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, talla, ubicación..."
              rows={3}
              className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 focus:outline-none transition-all placeholder:text-slate-300 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-rose-200 transition-all transform active:scale-95 flex justify-center items-center gap-2"
          >
            <Plus size={20} />
            Agregar a la lista
          </button>

        </div>
      </div>
    </div>
  );
};