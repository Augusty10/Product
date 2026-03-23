import { openDB, IDBPDatabase } from 'idb';
import { EncryptedNote } from '../types';

const DB_NAME = 'cryptnote_db';
const STORE_NAME = 'notes';
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase>;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const storage = {
  async getAll(): Promise<EncryptedNote[]> {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async save(note: EncryptedNote): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, note);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }
};
