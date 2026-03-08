import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();
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
export async function saveMessage(role, content) {
    try {
        await addDoc(collection(cloudDb, "messages"), {
            role,
            content,
            timestamp: serverTimestamp()
        });
    }
    catch (error) {
        console.error("Erro ao salvar no Firestore:", error);
    }
}
export async function getRecentMessages(limitCount = 10) {
    try {
        const q = query(collection(cloudDb, "messages"), orderBy("timestamp", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data()).reverse();
    }
    catch (error) {
        console.error("Erro ao buscar do Firestore:", error);
        return [];
    }
}
//# sourceMappingURL=database.js.map