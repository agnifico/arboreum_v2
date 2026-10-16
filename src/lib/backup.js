import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ICON = '/Tree2.png';

function toDate(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toCoord(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Turn a parsed backup file into notes ready for db.notes.bulkAdd.
 *
 * Export writes Dates as ISO strings; they are turned back into Dates here so
 * export -> import -> export round-trips exactly. Original ids are kept when
 * they are all valid and unique (the table is cleared before import), so the
 * restored notes are identical, not copies.
 *
 * Returns { notes, skipped } where skipped counts entries that weren't notes.
 */
export function normalizeBackup(data) {
  if (!Array.isArray(data)) return { notes: [], skipped: 0 };

  const entries = data.filter((n) => n && typeof n === 'object' && !Array.isArray(n));
  const skipped = data.length - entries.length;

  const ids = entries.map((n) => n.id);
  const keepIds =
    ids.every((id) => Number.isInteger(id) && id > 0) && new Set(ids).size === ids.length;

  const seenNoteids = new Set();
  const notes = entries.map(({ id, ...rest }) => {
    let noteid = typeof rest.noteid === 'string' && rest.noteid ? rest.noteid : uuidv4();
    if (seenNoteids.has(noteid)) noteid = uuidv4();
    seenNoteids.add(noteid);

    const note = {
      ...rest,
      noteid,
      title: typeof rest.title === 'string' ? rest.title : String(rest.title ?? ''),
      text: typeof rest.text === 'string' ? rest.text : '',
      icon: typeof rest.icon === 'string' && rest.icon ? rest.icon : DEFAULT_ICON,
      createdAt: toDate(rest.createdAt) ?? new Date(),
      mapX: toCoord(rest.mapX),
      mapY: toCoord(rest.mapY),
    };
    const updatedAt = toDate(rest.updatedAt);
    if (updatedAt) note.updatedAt = updatedAt;
    else delete note.updatedAt;
    if (keepIds) note.id = id;
    return note;
  });

  return { notes, skipped };
}
