import { AppData, SyncConfig, WishlistItem, MakeupProduct, Message } from '../types';

const BASE_URL = 'https://api.jsonbin.io/v3/b';

// Helper to headers
const getHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'X-Master-Key': apiKey
});

/**
 * Merges local data with cloud data.
 */
export const mergeData = (local: AppData, cloud: AppData): AppData => {
  // Merge Wishlist
  const wishlistMap = new Map<string, WishlistItem>();
  cloud.wishlist.forEach(item => wishlistMap.set(item.id, item));
  local.wishlist.forEach(item => wishlistMap.set(item.id, item));

  // Merge Makeup
  const makeupMap = new Map<string, MakeupProduct>();
  cloud.makeup.forEach(item => makeupMap.set(item.id, item));
  local.makeup.forEach(item => makeupMap.set(item.id, item));

  // Merge Mailbox
  // Critical: We want to keep ALL messages ever sent.
  const messageMap = new Map<string, Message>();
  (cloud.mailbox || []).forEach(msg => messageMap.set(msg.id, msg));
  (local.mailbox || []).forEach(msg => {
    // If local has a read status change, we want to preserve it
    // But generally, we just union them.
    if (messageMap.has(msg.id)) {
      const cloudMsg = messageMap.get(msg.id)!;
      // If either is read, mark as read (logic: once read, always read)
      messageMap.set(msg.id, { ...msg, read: msg.read || cloudMsg.read });
    } else {
      messageMap.set(msg.id, msg);
    }
  });

  return {
    wishlist: Array.from(wishlistMap.values()),
    makeup: Array.from(makeupMap.values()),
    mailbox: Array.from(messageMap.values()).sort((a, b) => b.date - a.date), // Sort new to old
    lastUpdated: Date.now()
  };
};

export const fetchFromCloud = async (config: SyncConfig): Promise<AppData | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${config.binId}/latest`, {
      method: 'GET',
      headers: getHeaders(config.apiKey)
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    // JSONBin returns data wrapped in 'record'
    return data.record as AppData;
  } catch (error) {
    console.error("Cloud Fetch Error:", error);
    return null;
  }
};

export const saveToCloud = async (config: SyncConfig, data: AppData): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${config.binId}`, {
      method: 'PUT',
      headers: getHeaders(config.apiKey),
      body: JSON.stringify(data)
    });

    return response.ok;
  } catch (error) {
    console.error("Cloud Save Error:", error);
    return false;
  }
};