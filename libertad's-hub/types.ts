export type CategoryId = 'plans' | 'flowers' | 'restaurants' | 'products';
export type SectionId = 'wishlist' | 'legal' | 'makeup' | 'mailbox';
export type UserMode = 'libertad' | 'admin';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface WishlistItem {
  id: string;
  categoryId: CategoryId;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface LegalResponse {
  text: string;
  sources: GroundingSource[];
}

export interface MakeupProduct {
  id: string;
  brand: string;
  name: string;
  category: 'face' | 'eyes' | 'lips' | 'skincare';
  paoMonths: number; // Period After Opening in months
  dateOpened: number; // Timestamp
  imageUrl?: string; // New field for the product photo
}

export interface MakeupRecommendation {
  category: string;
  productName: string;
  reason: string; // Why this matches the tone
  hexColorEstimate?: string;
}

// --- MAILBOX TYPES ---

export interface Message {
  id: string;
  text: string;
  date: number;
  read: boolean; // If the receiver has read it
  sender: UserMode; // 'libertad' or 'admin'
}

// --- SYNC & GLOBAL STATE TYPES ---

export interface SyncConfig {
  binId: string;
  apiKey: string;
}

export interface AppData {
  wishlist: WishlistItem[];
  makeup: MakeupProduct[];
  mailbox: Message[]; // Added mailbox messages
  lastUpdated: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';