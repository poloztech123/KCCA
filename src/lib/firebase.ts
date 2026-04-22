import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as required by guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'official' | 'responder';
  createdAt: any;
  lastLocation?: { lat: number; lng: number };
}

export type EmergencyType = 'accident' | 'crime' | 'flooding' | 'fire' | 'medical';
export type ReportStatus = 'pending' | 'verified' | 'responding' | 'resolved';

export interface Report {
  id: string;
  reporterId: string;
  type: EmergencyType;
  description: string;
  location: { lat: number; lng: number; address?: string };
  mediaUrls: string[];
  status: ReportStatus;
  createdAt: any;
  updatedAt?: any;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  category: 'weather' | 'security' | 'traffic' | 'health';
  severity: 'low' | 'medium' | 'critical';
  createdAt: any;
}
