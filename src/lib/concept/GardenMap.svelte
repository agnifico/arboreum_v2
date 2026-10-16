<script>
  // A pixel window onto the garden. It shows `cols × rows` tiles around the
  // cursor (like a handheld's screen following the player) with every note's
  // tree on its plot. Used by the Map viewer module and the drawer.
  import { onMount } from "svelte";
  import { COLS, ROWS, TILES, tileSrc, image } from "./garden.js";

  let {
    cursor = null, // { x, y } or null
    plots = [], // [{ x, y, icon, mine }]
    cols = 12,
    rows = 9,
    blink = true,
    onpick = null, // ({ x, y }) when a tile is tapped
  } = $props();

  function tap(e) {
    if (!onpick) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * cols) + cam.x;
    const y = Math.floor(((e.clientY - r.top) / r.height) * rows) + cam.y;
    onpick({ x, y });
  }

  let canvas = $state();
  let ready = $state(false);
  let on = $state(true); // cursor blink phase
  const T = 16; // tile size in canvas pixels; CSS scales it up crisply

  // Camera: keep the cursor in view, clamped to the map's edges.
  let cam = $derived.by(() => {
    const c = cursor ?? { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    return {
      x: Math.max(0, Math.min(COLS - cols, c.x - Math.floor(cols / 2))),
      y: Math.max(0, Math.min(ROWS - rows, c.y - Math.floor(rows / 2))),
    };
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
    if (cursor && (on || !blink)) {
      const x = (cursor.x - cam.x) * T;
      const y = (cursor.y - cam.y) * T;
      ctx.strokeStyle = "#ff6a1a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
    }
  }

  $effect(() => {
    // Redraw whenever what's shown changes.
    cursor; plots; cam; on; ready;
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
  aria-hidden="true"
  onclick={tap}
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
</style>
