import { db } from '$lib/db.js';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  // Guard: Only run database queries in the browser
  if (!browser) {
    // On the server, return a placeholder. The page will re-load on the client.
    return { note: null };
  }

  const note = await db.notes.where({ noteid: params.noteid }).first();

  if (note) {
    return { note };
  }

  throw error(404, 'Not found');
}