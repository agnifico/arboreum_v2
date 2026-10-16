// Writes files into the Origin Private File System. It runs as a worker
// because the sync access handle (the one write path every browser has had
// since Safari 15.2) only exists in workers.
self.onmessage = async ({ data: { id, path, buffer } }) => {
  try {
    const parts = path.split("/");
    const name = parts.pop();
    let dir = await navigator.storage.getDirectory();
    for (const p of parts) dir = await dir.getDirectoryHandle(p, { create: true });
    const file = await dir.getFileHandle(name, { create: true });
    const handle = await file.createSyncAccessHandle();
    try {
      handle.truncate(0);
      handle.write(new Uint8Array(buffer), { at: 0 });
      handle.flush();
    } finally {
      handle.close();
    }
    self.postMessage({ id, ok: true });
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error) });
  }
};
