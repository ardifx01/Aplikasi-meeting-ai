export type HistoryStatus = 'Selesai' | 'Dibatalkan';

export interface HistoryEntry {
  id: string | number;
  roomName: string;
  topic: string;
  date: string;
  time: string;
  participants: number;
  status: HistoryStatus;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'booking_history';

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) return list as HistoryEntry[];
    return [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'savedAt'>) {
  const list = getHistory();
  const saved: HistoryEntry = { ...entry, savedAt: new Date().toISOString() };
  list.unshift(saved);
  // Keep last 200
  const trimmed = list.slice(0, 200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}



