import { UserTier } from './utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UserData {
  tier: UserTier;
  imagesUsed: number;
  conversationHistory: Conversation[];
  lastPurchase?: number;
}

const STORAGE_KEY = 'ai-assistant-user';
const CONVERSATIONS_KEY = 'ai-assistant-conversations';

export function getUserData(): UserData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultUserData();
  } catch {
    return getDefaultUserData();
  }
}

function getDefaultUserData(): UserData {
  return {
    tier: 'free',
    imagesUsed: 0,
    conversationHistory: [],
    lastPurchase: undefined,
  };
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function upgradeTier(newTier: 'pro' | 'max'): void {
  const userData = getUserData();
  userData.tier = newTier;
  userData.lastPurchase = Date.now();
  saveUserData(userData);
}

export function incrementImageUsage(): void {
  const userData = getUserData();
  userData.imagesUsed++;
  saveUserData(userData);
}

export function resetImageUsageMonthly(): void {
  const userData = getUserData();
  const lastPurchase = userData.lastPurchase || 0;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  if (lastPurchase < monthAgo) {
    userData.imagesUsed = 0;
    saveUserData(userData);
  }
}

export function getConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === conversation.id);
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function deleteConversation(id: string): void {
  const conversations = getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered));
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
  });
}
