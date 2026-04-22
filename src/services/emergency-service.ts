import { db, auth } from '@/src/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { offlineService } from './offline-service';

export const EmergencyService = {
  async ensureUserProfile(user: any) {
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role: 'citizen',
        createdAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error("Profile creation error", e);
    }
  },

  async createReport(data: {
    type: string;
    description: string;
    location: { lat: number; lng: number; address?: string };
    mediaUrls: string[];
  }) {
    if (!auth.currentUser) throw new Error("Authentication required");
    
    const reportData = {
      ...data,
      reporterId: auth.currentUser.uid,
      reporterName: auth.currentUser.displayName || 'Citizen',
      status: 'pending',
      createdAt: Date.now(), // Use local time for offline, will be replaced or supplemented
    };

    if (offlineService.isOnline()) {
      try {
        return await addDoc(collection(db, 'reports'), {
          ...reportData,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn("Fast online check failed, queueing report...", e);
        return await offlineService.queueReport(reportData);
      }
    } else {
      return await offlineService.queueReport(reportData);
    }
  },

  async syncPendingReports() {
    if (!offlineService.isOnline() || !auth.currentUser) return;

    const pending = await offlineService.getPendingReports();
    for (const report of pending) {
      try {
        const { tempId, ...cleanData } = report;
        await addDoc(collection(db, 'reports'), {
          ...cleanData,
          createdAt: serverTimestamp(),
        });
        await offlineService.removePendingReport(tempId);
      } catch (e) {
        console.error("Sync failed for report", report.tempId, e);
      }
    }
  },

  subscribeToReports(callback: (reports: any[]) => void) {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    // First, try to load from cache
    offlineService.getCachedData('reports').then(cached => {
      if (cached) callback(cached);
    });

    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      offlineService.cacheData('reports', reports);
      callback(reports);
    });
  },

  subscribeToAlerts(callback: (alerts: any[]) => void) {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    
    offlineService.getCachedData('alerts').then(cached => {
      if (cached) callback(cached);
    });

    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      offlineService.cacheData('alerts', alerts);
      callback(alerts);
    });
  },

  async createAlert(title: string, message: string, category: string, severity: string) {
    return addDoc(collection(db, 'alerts'), {
      title,
      message,
      category,
      severity,
      createdAt: serverTimestamp(),
    });
  },

  async updateReportStatus(reportId: string, status: string) {
    const reportRef = doc(db, 'reports', reportId);
    return setDoc(reportRef, { status, updatedAt: serverTimestamp() }, { merge: true });
  },

  async updateProfile(uid: string, data: { displayName?: string; lastLocation?: string }) {
    const userRef = doc(db, 'users', uid);
    return setDoc(userRef, { 
      ...data, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  },

  async sendMessage(reportId: string, text: string) {
    if (!auth.currentUser) throw new Error("Authentication required");
    const messagesRef = collection(db, 'reports', reportId, 'messages');
    return addDoc(messagesRef, {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Citizen',
      text,
      createdAt: serverTimestamp(),
    });
  },

  subscribeToMessages(reportId: string, callback: (messages: any[]) => void) {
    const q = query(
      collection(db, 'reports', reportId, 'messages'), 
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  }
};
