import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const db = new Database(process.env.DB_PATH || './memory.db');

// Tabela simples para memória de curto/longo prazo
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
