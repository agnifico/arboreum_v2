import Dexie from 'dexie';
import { browser } from '$app/environment';

// Create a placeholder for the db
let db;

// Only initialize Dexie in the browser
if (browser) {
  db = new Dexie('arboreum');
  db.version(2).stores({
    notes: '++id, noteid, title, text, icon, createdAt, mapX, mapY'
  });
}

// Export the db. It will be undefined on the server and a Dexie instance in the browser.
export { db };