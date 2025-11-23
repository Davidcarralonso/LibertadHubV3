import React, { useState } from 'react';
import { Category, CategoryId, WishlistItem } from '../types';
import { WishlistCard } from './WishlistCard';
import { AddModal } from './AddModal';
import { 
  Heart, 
  Flower, 
  Utensils, 
  ShoppingBag, 
  Plus, 
  Settings
} from 'lucide-react';

interface WishlistSectionProps {
  items: WishlistItem[];
  onAddItem: (title: string, description: string, categoryId: CategoryId) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onOpenSettings: () => void;
}

const CATEGORIES: Category[] = [
  { 
    id: 'plans', 
    label: 'Planes', 
    icon: 'heart', 
    color: 'bg-pink-100 text-pink-600',
    description: 'Citas, viajes y aventuras juntos'
  },
  { 
    id: 'flowers', 
    label: 'Flores', 
    icon: 'flower', 
    color: 'bg-rose-100 text-rose-600',
    description: 'Sus flores y arreglos favoritos'
  },
  { 
    id: 'restaurants', 
    label: 'Restaurantes', 
    icon: 'utensils', 
    color: 'bg-orange-100 text-orange-600',
    description: 'Lugares para probar y disfrutar'
  },
  { 
    id: 'products', 
    label: 'Wishlist', 
    icon: 'bag', 
    color: 'bg-purple-100 text-purple-600',
    description: 'Ropa, accesorios y regalitos'
  },
];

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<CategoryId>('plans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const activeCategoryData = CATEGORIES.find(c => c.id === activeTab)!;

  const filteredItems = items.filter(item => item.categoryId === activeTab);

  // Icon helper
  const renderIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case 'heart': return <Heart size={size} />;
      case 'flower': return <Flower size={size} />;
      case 'utensils': return <Utensils size={size} />;
      case 'bag': return <ShoppingBag size={size} />;
      default: return <Heart size={size} />;
    }
  };

  return (
    <div className="pb-24 md:pb-0 animate-fadeIn">
      
      {/* Header for Wishlist Section */}
      <header className="flex justify-between items-center mb-8 pt-4 md:pt-0">
         <div>
             <h1 className="text-2xl font-serif font-bold text-rose-900">Wishlist</h1>
             <p className="text-slate-500 text-sm">Tus deseos y planes favoritos</p>
         </div>
         <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-full border border-slate-100 shadow-sm"
          >
            <Settings size={20} />
          </button>
      </header>

      {/* Internal Category Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
              ${activeTab === cat.id 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-rose-50'}`}
          >
            {renderIcon(cat.icon, 16)}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category Summary */}
      <div className="bg-rose-50/50 rounded-2xl p-6 mb-6 border border-rose-100">
          <h2 className="text-2xl font-serif text-rose-900 mb-1">{activeCategoryData.label}</h2>
          <p className="text-rose-500 text-sm">{activeCategoryData.description}</p>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-rose-200 rounded-2xl text-rose-400 font-medium hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
        >
          <div className="bg-rose-100 text-rose-500 p-1.5 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="font-serif text-lg">Agregar nuevo deseo</span>
        </button>
      </div>

      {/* Grid of Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <WishlistCard 
              key={item.id} 
              item={item} 
              onToggle={onToggleItem} 
              onDelete={onDeleteItem} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 opacity-50">
          <p className="text-slate-500 font-medium">
            Aún no hay deseos en {activeCategoryData.label}
          </p>
        </div>
      )}

      {/* Modals */}
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        activeCategory={activeTab}
        categories={CATEGORIES}
        onAdd={onAddItem}
      />
    </div>
  );
};