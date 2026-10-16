<script>
  // A note's images at its edge (CONCEPT.md, "Images"):
  //   book:  top / bottom, a scrapbook of justified rows that fill the width;
  //   strip: left / right, thumbnails set beside lines (one line is the unit).
  // Tap an image to give it the D-pad; drag it to move it.
  import { useDevice } from "./device.svelte.js";
  // gutter: the editor's measured lines ([{ top }]); onmeasure: images changed size.
  let { mode = "book", side = "left", gutter = [], thumb = 92, rowHeight = 120, onmeasure = () => {} } = $props();
  const device = useDevice();
  const GAP = 6;

  let images = $derived(device.media.images);
  let width = $state(0);

  // Scrapbook: fill each row to the width; the last row keeps the usual height.
  let rows = $derived.by(() => {
    const out = [];
    let row = [];
    let sum = 0;
    for (const img of images) {
      row.push(img);
      sum += img.w / img.h;
      const h = (width - GAP * (row.length - 1)) / sum;
      if (h <= rowHeight) {
        out.push({ items: row, h });
        row = [];
        sum = 0;
      }
    }
    if (row.length) out.push({ items: row, h: Math.min(rowHeight, (width - GAP * (row.length - 1)) / sum) });
    return out;
  });

  // Strip: each thumbnail sits at its line; if that would overlap the one
  // above, it's pushed down (its line stays what it was).
  let placed = $derived.by(() => {
    let bottom = -Infinity;
    return [...images]
      .sort((a, b) => a.line - b.line)
      .map((img) => {
        const g = gutter[Math.min(img.line, gutter.length) - 1];
        const top = Math.max(g ? g.top : 0, bottom + GAP);
        const h = (thumb * img.h) / img.w;
        bottom = top + h;
        return { img, top, h };
      });
  });

  // --- Pointer: tap selects, drag moves -------------------------------
  let drag = null; // { id, y0, top0, moved }
  function down(e, img, top = 0) {
    if (e.button !== 0) return;
    e.preventDefault(); // no text selection, and typing focus stays put
    if (!device.editing && device.note) device.open();
    device.selectImage(img.id);
    drag = { id: img.id, y0: e.clientY, top0: top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!drag) return;
    const dy = e.clientY - drag.y0;
    if (Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved || mode !== "strip" || !gutter.length) return;
    // The device is scaled; gutter tops are in its own (unscaled) pixels.
    const scale = e.currentTarget.getBoundingClientRect().width / e.currentTarget.offsetWidth || 1;
    const y = drag.top0 + dy / scale;
    let best = 0;
    gutter.forEach((g, i) => Math.abs(g.top - y) < Math.abs(gutter[best].top - y) && (best = i));
    device.setImageLine(drag.id, best + 1);
  }
  function up(e) {
    if (!drag) return;
    const { id, moved } = drag;
    drag = null;
    if (!moved) return; // a tap: the image keeps the D-pad
    if (mode === "book") {
      // Dropped on another image: take its place in the order.
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-img]")?.dataset.img;
      const to = images.findIndex((x) => x.id === over);
      if (to >= 0) device.setImageIndex(id, to);
    }
    device.placeImages();
  }
</script>

{#if images.length}
  {#if mode === "book"}
    <div class="book" bind:clientWidth={width} role="group" aria-label="Images">
      {#each rows as row}
        <div class="row" style="height:{row.h}px">
          {#each row.items as img (img.id)}
            <button
              class="nimg"
              class:sel={device.focus === "image" && device.imageSel === img.id}
              data-img={img.id}
              style="width:{row.h * (img.w / img.h)}px"
              aria-label="Image"
              onpointerdown={(e) => down(e, img)}
              onpointermove={move}
              onpointerup={up}
            ><img src={device.mediaUrls[img.id]} alt="" draggable="false" onload={onmeasure} /></button>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="strip {side}" role="group" aria-label="Images">
      {#each placed as p (p.img.id)}
        <button
          class="nimg thumb"
          class:sel={device.focus === "image" && device.imageSel === p.img.id}
          style="top:{p.top}px; width:{thumb}px; height:{p.h}px"
          aria-label="Image beside line {p.img.line}"
          onpointerdown={(e) => down(e, p.img, p.top)}
          onpointermove={move}
          onpointerup={up}
        ><img src={device.mediaUrls[p.img.id]} alt="" draggable="false" /></button>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .book {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 6px 0;
  }
  .row {
    display: flex;
    gap: 6px;
  }
  .nimg {
    position: relative;
    flex: none;
    height: 100%;
    padding: 0;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(213, 228, 198, 0.06);
    box-shadow: 0 0 0 1px rgba(213, 228, 198, 0.12);
    cursor: grab;
    touch-action: none;
  }
  .nimg img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .nimg.sel {
    box-shadow: 0 0 0 2px var(--signal), 0 0 12px rgba(255, 106, 26, 0.4);
  }
  .strip {
    position: absolute;
    top: 0;
    pointer-events: none;
  }
  .strip.left {
    left: 8px;
  }
  .strip.right {
    right: calc(var(--thumb) + 12px); /* its thumbs hang off to the right */
  }
  .thumb {
    position: absolute;
    left: 0;
    pointer-events: auto;
  }
</style>
