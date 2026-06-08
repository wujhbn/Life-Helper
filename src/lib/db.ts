import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AppEvent, TaskCard, ScheduleItem, EmergencyContact } from '../types';

interface LifeHelperDB extends DBSchema {
  events: {
    key: number;
    value: AppEvent;
    indexes: { 'by-date': string };
  };
  taskCards: {
    key: number;
    value: TaskCard;
  };
  schedule: {
    key: number;
    value: ScheduleItem;
    indexes: { 'by-date': string };
  };
  contacts: {
    key: number;
    value: EmergencyContact;
  };
}

let dbPromise: Promise<IDBPDatabase<LifeHelperDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<LifeHelperDB>('life-helper-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('taskCards')) {
          db.createObjectStore('taskCards', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('schedule')) {
          const store = db.createObjectStore('schedule', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

// Example usage wrappers could go here, or we can use initDB directly in components.
