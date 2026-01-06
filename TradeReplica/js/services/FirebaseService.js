import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

/**
 * Service for handling Firebase initialization and interactions.
 * Centralizes configuration and provides access to Firebase services.
 */
export class FirebaseService {
  constructor() {
    this.config = {
        apiKey: "AIzaSyDcmm2JfZhTw1M_4vqkV58RByvA-EW0wF0",
        authDomain: "tradereplica.firebaseapp.com",
        projectId: "tradereplica",
        storageBucket: "tradereplica.firebasestorage.app",
        messagingSenderId: "74992486144",
        appId: "1:574992486144:web:ebc2b5c3ed6dee4570ede5",
        measurementId: "G-TMJQ1525FG"
    };
    
    this.app = initializeApp(this.config);
    this.db = getFirestore(this.app);
    this.analytics = getAnalytics(this.app);
    console.log("FirebaseService initialized");
  }

  /**
   * Returns the Firestore database instance.
   */
  getDb() {
    return this.db;
  }
}

// Export a singleton instance for global use
export const firebaseService = new FirebaseService();
