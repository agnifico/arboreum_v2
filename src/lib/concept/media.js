// A note's images, kept out of the notes database: each note gets a folder
// in the Origin Private File System, notes/<noteid>/, holding the image
// files and layout.json (edge, order, line positions). See CONCEPT.md, "Images".
import { v4 as uuidv4 } from "uuid";

export const EDGES = ["bottom", "top", "left", "right"];
const MAX_SIDE = 1600; // images are downscaled to this on import

export const emptyLayout = () => ({ edge: "bottom", images: [] });

export const supported = () => typeof navigator !== "undefined" && !!navigator.storage?.getDirectory;

let worker;
let seq = 0;
const pending = new Map();
/** Write bytes to a path under the OPFS root (through the writer worker). */
async function write(path, data) {
  if (!worker) {
    worker = new Worker(new URL("./opfs-writer.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data: { id, ok, error } }) => {
      const p = pending.get(id);
      pending.delete(id);
      ok ? p.resolve() : p.reject(new Error(error));
    };
  }
  const buffer = typeof data === "string" ? new TextEncoder().encode(data).buffer : await data.arrayBuffer();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, path, buffer }, [buffer]);
  });
}

async function noteDir(noteid) {
  const root = await navigator.storage.getDirectory();
  try {
    const notes = await root.getDirectoryHandle("notes");
    return await notes.getDirectoryHandle(noteid);
  } catch {
    return null; // no images yet
  }
}

/** The note's layout plus an object URL per image. Call revoke() with the
    urls when they're no longer shown. */
export async function load(noteid) {
  const layout = emptyLayout();
  const urls = {};
  if (!supported() || !noteid) return { layout, urls };
  const dir = await noteDir(noteid);
  if (!dir) return { layout, urls };
  try {
    const file = await (await dir.getFileHandle("layout.json")).getFile();
    Object.assign(layout, JSON.parse(await file.text()));
  } catch {
    return { layout, urls };
  }
  const kept = [];
  for (const img of layout.images) {
    try {
      const f = await (await dir.getFileHandle(img.file)).getFile();
      urls[img.id] = URL.createObjectURL(f);
      kept.push(img);
    } catch {
      // the file has gone missing: drop it from the layout
    }
  }
  layout.images = kept;
  return { layout, urls };
}

export const revoke = (urls) => Object.values(urls).forEach((u) => URL.revokeObjectURL(u));

export const saveLayout = (noteid, layout) => write(`notes/${noteid}/layout.json`, JSON.stringify(layout));

/** Downscale (if large) and store an image. Returns its layout entry and a URL. */
export async function add(noteid, file, line = 1) {
  navigator.storage.persist?.(); // ask the browser to keep this storage
  const bitmap = await createImageBitmap(file);
  let { width: w, height: h } = bitmap;
  let blob = file;
  let ext = (file.name?.split(".").pop() || "img").toLowerCase();
  if (Math.max(w, h) > MAX_SIDE || file.size > 1.5e6) {
    const k = Math.min(1, MAX_SIDE / Math.max(w, h));
    w = Math.round(w * k);
    h = Math.round(h * k);
    const canvas = Object.assign(document.createElement("canvas"), { width: w, height: h });
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    ext = "jpg";
  }
  bitmap.close?.();
  const id = uuidv4();
  const entry = { id, file: `${id}.${ext}`, w, h, line };
  await write(`notes/${noteid}/${entry.file}`, blob);
  return { entry, url: URL.createObjectURL(blob) };
}

/** Delete one image's file (the caller saves the layout without it). */
export async function removeFile(noteid, entry) {
  const dir = await noteDir(noteid);
  await dir?.removeEntry(entry.file).catch(() => {});
}

/** Delete a note's whole image folder (when the note is deleted). */
export async function dropNote(noteid) {
  if (!supported()) return;
  try {
    const root = await navigator.storage.getDirectory();
    const notes = await root.getDirectoryHandle("notes");
    await notes.removeEntry(noteid, { recursive: true });
  } catch {
    // nothing stored for this note
  }
}
