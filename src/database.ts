import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

dotenv.config({ override: true });

// Configuração SQLite (Local Cache)
const localDb = new Database(process.env.DB_PATH || './memory.db');
localDb.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0
  )
`);

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
  // Salva no SQLite primeiro (Fast)
  const stmt = localDb.prepare('INSERT INTO messages (role, content) VALUES (?, ?)');
  const info = stmt.run(role, content);
  const localId = info.lastInsertRowid;

  // Salva no Firestore (Persistence)
  try {
    await addDoc(collection(cloudDb, "messages"), {
      role,
      content,
      timestamp: serverTimestamp(),
      localId: localId.toString()
    });

    // Marca como sincronizado no SQLite
    localDb.prepare('UPDATE messages SET synced = 1 WHERE id = ?').run(localId);
  } catch (error) {
    console.error("Erro ao sincronizar com Firestore:", error);
  }
}

export async function getRecentMessages(limitCount: number = 10) {
  // Tenta pegar do Firestore para ter o estado mais atual
  try {
    const q = query(collection(cloudDb, "messages"), orderBy("timestamp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => doc.data()).reverse();
    if (messages.length > 0) return messages;
  } catch (error) {
    console.error("Erro ao buscar do Firestore, usando cache local:", error);
  }

  // Fallback para SQLite
  return localDb.prepare('SELECT role, content FROM messages ORDER BY timestamp DESC LIMIT ?')
    .all(limitCount)
    .reverse();
}

export default localDb;
