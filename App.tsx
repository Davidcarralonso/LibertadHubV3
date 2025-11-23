import React, { useState, useEffect } from 'react';
import { WishlistItem, MakeupProduct, Message, CategoryId, SyncConfig, SyncStatus, AppData, UserMode } from './types';
import { fetchFromCloud, saveToCloud, mergeData } from './services/sync';
import { LoginScreen } from './components/LoginScreen';
import { LibertadView } from './components/LibertadView';
import { AdminView } from './components/AdminView';

const LOCAL_STORAGE_KEY = 'libertad-app-data-v4'; // Version bump for sender field
const AUTH_KEY = 'libertad-app-auth-mode';

const HARDCODED_CONFIG: SyncConfig = {
  binId: '692264b643b1c97be9bee2c6',
  apiKey: '$2a$10$lTyhosMp53x76D4m9KoO9uUzfYIvno76BauYKuFoSCkziegfM8MbO'
};

const App: React.FC = () => {
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  
  // --- GLOBAL STATE ---
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [makeupProducts, setMakeupProducts] = useState<MakeupProduct[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // --- SYNC STATE ---
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  // INITIAL AUTH CHECK
  useEffect(() => {
    const savedMode = localStorage.getItem(AUTH_KEY) as UserMode | null;
    if (savedMode) setUserMode(savedMode);
  }, []);

  // LOGIN HANDLER
  const handleLogin = (mode: UserMode) => {
    setUserMode(mode);
    localStorage.setItem(AUTH_KEY, mode);
  };

  const handleLogout = () => {
    setUserMode(null);
    localStorage.removeItem(AUTH_KEY);
  };

  // 1. INITIAL LOAD (Local)
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: Partial<AppData> = JSON.parse(savedData);
        setWishlistItems(parsed.wishlist || []);
        setMakeupProducts(parsed.makeup || []);
        
        // Migration for old messages (default to 'libertad' sender if missing)
        const migratedMessages = (parsed.mailbox || []).map(m => ({
          ...m,
          sender: m.sender || 'libertad'
        }));
        setMessages(migratedMessages);
      } catch (e) { console.error("Data parse error", e); }
    }
  }, []);

  // 2. INITIAL LOAD (Cloud)
  useEffect(() => {
    const performInitialSync = async () => {
      setSyncStatus('syncing');
      const cloudData = await fetchFromCloud(HARDCODED_CONFIG);
      
      if (cloudData) {
        const localData: AppData = { 
          wishlist: wishlistItems, 
          makeup: makeupProducts, 
          mailbox: messages,
          lastUpdated: Date.now() 
        };
        
        const merged = mergeData(localData, cloudData);
        
        setWishlistItems(merged.wishlist);
        setMakeupProducts(merged.makeup);
        setMessages(merged.mailbox);
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        setSyncStatus('saved');
      } else {
        setSyncStatus('error');
      }
    };
    performInitialSync();
  }, []); // Run once on mount

  // 3. AUTO SAVE LOGIC (Debounced)
  useEffect(() => {
    const currentData: AppData = {
      wishlist: wishlistItems,
      makeup: makeupProducts,
      mailbox: messages,
      lastUpdated: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentData));

    setSyncStatus('syncing');
    const timeoutId = setTimeout(async () => {
      const success = await saveToCloud(HARDCODED_CONFIG, currentData);
      setSyncStatus(success ? 'saved' : 'error');
    }, 2000); 

    return () => clearTimeout(timeoutId);
  }, [wishlistItems, makeupProducts, messages]);


  // --- HANDLERS ---

  const wishlistHandlers = {
    add: (title: string, description: string, categoryId: CategoryId) => {
      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
        title, description, categoryId, isCompleted: false, createdAt: Date.now()
      };
      setWishlistItems(prev => [newItem, ...prev]);
    },
    toggle: (id: string) => {
      setWishlistItems(prev => prev.map(i => i.id === id ? {...i, isCompleted: !i.isCompleted} : i));
    },
    delete: (id: string) => {
      setWishlistItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const makeupHandlers = {
    add: (product: MakeupProduct) => setMakeupProducts(prev => [product, ...prev]),
    remove: (id: string) => setMakeupProducts(prev => prev.filter(p => p.id !== id))
  };

  const mailboxHandlers = {
    send: (text: string) => {
      if (!userMode) return;
      const newMsg: Message = {
        id: crypto.randomUUID(),
        text,
        date: Date.now(),
        read: false,
        sender: userMode // Sender is determined by current login
      };
      setMessages(prev => [newMsg, ...prev]);
    },
    markRead: (id: string) => {
      setMessages(prev => prev.map(m => m.id === id ? {...m, read: true} : m));
    }
  };

  // DANGER: Reset Data
  const handleResetData = async () => {
    setSyncStatus('syncing');
    
    const emptyData: AppData = {
      wishlist: [],
      makeup: [],
      mailbox: [],
      lastUpdated: Date.now()
    };

    // 1. Clear local
    setWishlistItems([]);
    setMakeupProducts([]);
    setMessages([]);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyData));

    // 2. Overwrite cloud
    const success = await saveToCloud(HARDCODED_CONFIG, emptyData);
    setSyncStatus(success ? 'saved' : 'error');
  };

  // --- RENDER ---

  if (!userMode) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const appData: AppData = {
    wishlist: wishlistItems,
    makeup: makeupProducts,
    mailbox: messages,
    lastUpdated: Date.now()
  };

  if (userMode === 'admin') {
    return (
      <AdminView 
        data={appData}
        syncStatus={syncStatus}
        onLogout={handleLogout}
        onResetData={handleResetData}
        mailboxHandlers={mailboxHandlers}
      />
    );
  }

  return (
    <LibertadView 
      data={appData}
      syncStatus={syncStatus}
      onLogout={handleLogout}
      wishlistHandlers={wishlistHandlers}
      makeupHandlers={makeupHandlers}
      mailboxHandlers={mailboxHandlers}
    />
  );
};

export default App;