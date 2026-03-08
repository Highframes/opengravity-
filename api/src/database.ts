import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

dotenv.config({ override: true });

// Configuração SQLite (opcional, para uso local)
let localDb: any = null;
if (process.env.DB_PATH && !process.env.VERCEL) {
  try {
    const { default: Database } = await import('better-sqlite3');
    localDb = new Database(process.env.DB_PATH);
    localDb.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 0
          )
        `);
  } catch (e) {
    console.warn("SQLite não disponível, usando apenas Firestore.");
  }
}

// Configuração Firebase (Cloud Memory)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const cloudDb = getFirestore(app);

export async function saveMessage(role: string, content: string) {
  let localId = null;
  if (localDb) {
    try {
      const stmt = localDb.prepare('INSERT INTO messages (role, content) VALUES (?, ?)');
      const info = stmt.run(role, content);
      localId = info.lastInsertRowid;
    } catch (e) {
      console.error("Erro SQLite:", e);
    }
  }

  // Salva no Firestore (Sempre prioritário na Nuvem)
  try {
    await addDoc(collection(cloudDb, "messages"), {
      role,
      content,
      timestamp: serverTimestamp(),
      localId: localId ? localId.toString() : null
    });

    if (localDb && localId) {
      localDb.prepare('UPDATE messages SET synced = 1 WHERE id = ?').run(localId);
    }
  } catch (error) {
    console.error("Erro ao sincronizar com Firestore:", error);
  }
}

export async function getRecentMessages(limitCount: number = 10) {
  try {
    const q = query(collection(cloudDb, "messages"), orderBy("timestamp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => doc.data()).reverse();
    if (messages.length > 0) return messages;
  } catch (error) {
    console.error("Erro ao buscar do Firestore:", error);
  }

  if (localDb) {
    return localDb.prepare('SELECT role, content FROM messages ORDER BY timestamp DESC LIMIT ?')
      .all(limitCount)
      .reverse();
  }
  return [];
}

export default localDb;
