import { db } from '$lib/db.js';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
  if (!browser) {
    return { note: null };
  }

  const noteid = url.searchParams.get('noteid');

  if (noteid) {
    const note = await db.notes.where({ noteid: noteid }).first();
    return { note: note || null };
  }

  return { note: null };
}
