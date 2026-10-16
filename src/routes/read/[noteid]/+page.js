import { db } from '$lib/db.js';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  // Guard: Only run database queries in the browser
  if (!browser) {
    // On the server, return a placeholder. The page will re-load on the client.
    return { note: null, missing: false };
  }

  const note = await db.notes.where({ noteid: params.noteid }).first();

  // A missing note (deleted, or a stale link) gets a friendly in-app message
  // rather than SvelteKit's bare 404 page.
  return { note: note ?? null, missing: !note };
}
