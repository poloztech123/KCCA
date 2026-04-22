import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'kcca_citizenlink_db';
const STORE_PENDING = 'pending_reports';
const STORE_CACHE = 'cache';

export interface OfflineReport {
  id?: string;
  type: string;
  description: string;
  location: { lat: number; lng: number; address?: string };
  mediaUrls: string[];
  createdAt: number;
}

class OfflineService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'tempId', autoIncrement: true });
        db.createObjectStore(STORE_CACHE);
      },
    });
  }

  async queueReport(report: Omit<OfflineReport, 'id'>) {
    const db = await this.db;
    return db.add(STORE_PENDING, { ...report, tempId: Date.now() });
  }

  async getPendingReports() {
    const db = await this.db;
    return db.getAll(STORE_PENDING);
  }

  async removePendingReport(tempId: number) {
    const db = await this.db;
    return db.delete(STORE_PENDING, tempId);
  }

  async cacheData(key: string, data: any) {
    const db = await this.db;
    return db.put(STORE_CACHE, data, key);
  }

  async getCachedData(key: string) {
    const db = await this.db;
    return db.get(STORE_CACHE, key);
  }

  isOnline() {
    return navigator.onLine;
  }
}

export const offlineService = new OfflineService();
