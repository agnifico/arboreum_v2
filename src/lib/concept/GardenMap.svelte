<script>
  // A pixel window onto the garden. It shows `cols × rows` tiles around the
  // cursor (like a handheld's screen following the player) with every note's
  // tree on its plot. Used by the Map viewer module and the drawer.
  import { onMount, untrack } from "svelte";
  import { COLS, ROWS, TILES, tileSrc, image } from "./garden.js";

  let {
    cursor = null, // { x, y } or null
    plots = [], // [{ x, y, icon, mine }]
    cols = 12,
    rows = 9,
    blink = true,
    onpick = null, // ({ x, y }) when a tile is tapped
    onaccept = null, // when the cursor's own tile is tapped again (e.g. plant here)
    acceptable = true, // false: the cursor's tile can't be accepted (taken)
  } = $props();

  // Mouse: tap a tile to put the cursor there, tap it again to accept.
  let hover = $state(null); // the tile under the pointer
  let tapped = false; // the cursor was moved by a tap: don't scroll under the pointer
  const tileAt = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((e.clientX - r.left) / r.width) * cols) + cam.x,
      y: Math.floor(((e.clientY - r.top) / r.height) * rows) + cam.y,
    };
  };
  const same = (a, b) => a && b && a.x === b.x && a.y === b.y;
  let onCursor = $derived(!!onaccept && same(hover, cursor));

  function tap(e) {
    const t = tileAt(e);
    if (onaccept && same(t, cursor)) return onaccept();
    if (!onpick) return;
    tapped = true;
    onpick(t);
  }

  let canvas = $state();
  let ready = $state(false);
  let on = $state(true); // cursor blink phase
  const T = 16; // tile size in canvas pixels; CSS scales it up crisply

  // Camera: centres on the cursor when it lands out of view; while the D-pad
  // walks it, scrolls only at the edges (one tile of look-ahead); never after
  // a tap, so the tile you pointed at stays under the pointer.
  let cam = $state({ x: 0, y: 0 });
  let placed = false;
  $effect(() => {
    const c = cursor ?? { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    const fit = (v, n, max) => Math.max(0, Math.min(max - n, v));
    let { x, y } = untrack(() => cam);
    const inView = c.x >= x && c.x < x + cols && c.y >= y && c.y < y + rows;
    if (!placed || !inView) {
      x = c.x - Math.floor(cols / 2);
      y = c.y - Math.floor(rows / 2);
    } else if (!tapped) {
      x = Math.min(Math.max(x, c.x - cols + 2), c.x - 1);
      y = Math.min(Math.max(y, c.y - rows + 2), c.y - 1);
    }
    placed = true;
    tapped = false;
    x = fit(x, cols, COLS);
    y = fit(y, rows, ROWS);
    if (x !== untrack(() => cam.x) || y !== untrack(() => cam.y)) cam = { x, y };
  });

  let tiles = {};
  let trees = {};

  async function loadAll() {
    const keys = [...new Set(TILES)];
    await Promise.all(keys.map(async (k) => (tiles[k] = await image(tileSrc(k)))));
    ready = true;
  }

  async function loadTrees(list) {
    const missing = [...new Set(list.map((p) => p.icon).filter((s) => s && !(s in trees)))];
    if (!missing.length) return;
    await Promise.all(missing.map(async (s) => (trees[s] = await image(s))));
    draw();
  }

  function draw() {
    if (!canvas || !ready) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const img = tiles[TILES[(cam.y + y) * COLS + cam.x + x]];
        if (img) ctx.drawImage(img, x * T, y * T, T, T);
      }
    }
    for (const p of plots) {
      const img = trees[p.icon];
      const x = p.x - cam.x;
      const y = p.y - cam.y;
      if (!img || x < 0 || y < 0 || x >= cols || y >= rows) continue;
      // Trees stand on their tile and stick up a little, like the classic map.
      // A ghost is where the open note will be planted on save.
      ctx.globalAlpha = p.ghost ? 0.5 : 1;
      ctx.drawImage(img, x * T - 2, y * T - 6, T + 4, T + 4);
      ctx.globalAlpha = 1;
    }
    // Hover: a faint outline on the tile you'd move to
    if (onpick && hover && !same(hover, cursor)) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1;
      ctx.strokeRect((hover.x - cam.x) * T + 0.5, (hover.y - cam.y) * T + 0.5, T - 1, T - 1);
    }
    // The cursor holds still while you point at it (about to accept)
    if (cursor && (on || !blink || onCursor)) {
      const x = (cursor.x - cam.x) * T;
      const y = (cursor.y - cam.y) * T;
      ctx.strokeStyle = "#ff6a1a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
    }
  }

  $effect(() => {
    // Redraw whenever what's shown changes.
    cursor; plots; cam; on; ready; hover; onCursor; cols; rows;
    draw();
  });
  $effect(() => {
    loadTrees(plots);
  });

  onMount(() => {
    loadAll();
    const t = setInterval(() => (on = !on), 550);
    return () => clearInterval(t);
  });
</script>

<canvas
  bind:this={canvas}
  width={cols * T}
  height={rows * T}
  style="aspect-ratio: {cols} / {rows};"
  class:tappable={!!onpick}
  class:accept={onCursor && acceptable}
  class:refuse={onCursor && !acceptable}
  aria-hidden="true"
  onclick={tap}
  onpointermove={(e) => (onpick || onaccept) && (hover = tileAt(e))}
  onpointerleave={() => (hover = null)}
></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: auto;
    image-rendering: pixelated;
    border-radius: 3px;
  }
  .tappable {
    cursor: crosshair;
  }
  /* On the cursor's own tile the crosshair becomes a green cross: click to accept */
  .accept {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z' fill='%2394d36a' stroke='%23142010' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, copy;
  }
  .refuse {
    cursor: not-allowed;
  }
</style>
