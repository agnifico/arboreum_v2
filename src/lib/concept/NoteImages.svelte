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

  // --- The picked image's own keys, for the mouse and touch -----------
  // REPLACE picks a new file for it. ✕ asks first, in place: the first
  // press turns it into CONFIRM, a second press removes the image.
  const picked = (img) => device.focus === "image" && device.imageSel === img.id;
  let armed = $state(null);
  let disarm;
  function del(id) {
    clearTimeout(disarm);
    if (armed === id) {
      armed = null;
      return device.removeImage(id);
    }
    armed = id;
    disarm = setTimeout(() => (armed = null), 3000);
  }
  // Picking another image, leaving, or a menu or box opening disarms it.
  $effect(() => {
    if (armed && (device.overlay || !(device.focus === "image" && device.imageSel === armed))) armed = null;
  });
  const keepFocus = (e) => e.preventDefault();
</script>

{#snippet tools(img)}
  {#if picked(img) && !device.overlay}
    <span class="tools">
      {#if armed !== img.id}
        <button class="tool" aria-label="Replace this image" onmousedown={keepFocus} onclick={() => device.replaceImage(img.id)}>REPLACE</button>
      {/if}
      <button
        class="tool del"
        class:armed={armed === img.id}
        aria-label={armed === img.id ? "Press again to remove this image" : "Remove this image"}
        onmousedown={keepFocus}
        onclick={() => del(img.id)}>✕{#if armed === img.id}<span>CONFIRM</span>{/if}</button>
    </span>
  {/if}
{/snippet}

{#if images.length}
  {#if mode === "book"}
    <div class="book" bind:clientWidth={width} role="group" aria-label="Images">
      {#each rows as row}
        <div class="row" style="height:{row.h}px">
          {#each row.items as img (img.id)}
            <div class="nimg" class:sel={picked(img)} data-img={img.id} style="width:{row.h * (img.w / img.h)}px">
              <button
                class="hit"
                aria-label="Image"
                onpointerdown={(e) => down(e, img)}
                onpointermove={move}
                onpointerup={up}
              ><img src={device.mediaUrls[img.id]} alt="" draggable="false" onload={onmeasure} /></button>
              {@render tools(img)}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="strip {side}" role="group" aria-label="Images">
      {#each placed as p (p.img.id)}
        <div class="nimg thumb" class:sel={picked(p.img)} style="top:{p.top}px; width:{thumb}px; height:{p.h}px">
          <button
            class="hit"
            aria-label="Image beside line {p.img.line}"
            onpointerdown={(e) => down(e, p.img, p.top)}
            onpointermove={move}
            onpointerup={up}
          ><img src={device.mediaUrls[p.img.id]} alt="" draggable="false" /></button>
          {@render tools(p.img)}
        </div>
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
    border-radius: 3px;
    background: color-mix(in srgb, var(--phosphor) 6%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--phosphor) 12%, transparent);
  }
  /* The image clips, not the cell: its keys may hang over the text */
  .hit {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: inherit;
    overflow: hidden;
    background: none;
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
    box-shadow: 0 0 0 2px var(--signal), 0 0 12px color-mix(in srgb, var(--signal) 40%, transparent);
  }
  .strip {
    position: absolute;
    top: 0;
    pointer-events: none;
  }
  .strip.left {
    left: calc(var(--gut) + 2px); /* just past the line numbers */
  }
  .strip.right {
    right: calc(var(--thumb) + 12px); /* its thumbs hang off to the right */
  }
  .thumb {
    position: absolute;
    left: 0;
    pointer-events: auto;
  }
  /* The picked image's keys: small glass pills in its top-right corner */
  .tools {
    position: absolute;
    z-index: 1;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 3px;
  }
  /* A narrow thumb: on the left strip they grow toward the text, not the numbers */
  .strip.left .tools {
    right: auto;
    left: 4px;
  }
  .tool {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 18px;
    padding: 0 6px;
    border-radius: 9px;
    font-family: var(--label);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor);
    background: color-mix(in srgb, var(--glass) 78%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--phosphor) 20%, transparent);
    cursor: pointer;
  }
  .tool.del {
    width: 18px;
    padding: 0;
    justify-content: center;
    color: #ff8a8f;
    transition: width 0.15s ease;
  }
  /* Armed: the ✕ grows into CONFIRM, solid red */
  .tool.del.armed {
    width: auto;
    padding: 0 7px 0 6px;
    color: #fff;
    background: var(--alert);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25), 0 0 10px rgba(229, 50, 59, 0.5);
  }
  @media (hover: hover) {
    .tool:hover {
      box-shadow: 0 0 0 1px var(--phosphor);
    }
  }
</style>
