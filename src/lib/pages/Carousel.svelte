<script>
  // The story's carousel: one slide per chapter, side by side, snapping into
  // place. The deck sits under the slides: ◀ is a B key, ▶ an A key, the LCD
  // names the chapter and its pips jump. ← and →, a swipe, a mouse drag
  // (anywhere on a slide but its links and keys; the text isn't selectable,
  // so a drag is always a drag) and a click on a neighbour's peeking edge
  // all move too.
  //
  // Fit, as on the console: the page fits the window with no scrolling.
  // Every slide (Slide.svelte) is laid out at least at the design width
  // (1180) and its panels scaled, all by the same amount, into the room
  // between the header and the deck. The scale never takes body text under
  // about 13px: a window too short for that scrolls a little instead.
  // Phones stack the chapters: long text reads better scrolled than swiped.
  import { onMount } from "svelte";
  let { titles, children } = $props();
  let track = $state();
  let index = $state(0);

  const DESIGN_W = 1180;
  const MIN_ZOOM = 0.82; // body text is 16px: no smaller than ~13
  const slides = () => [...track.children];
  const inner = (s) => s.firstElementChild;
  const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft);
  const sideways = () => getComputedStyle(track).overflowX === "auto"; // false when stacked

  // While a move is under way, the chapter is where it's going (quick
  // presses add up), not wherever the slides are passing.
  let target = null;
  let settle = 0;
  function go(i, behavior = "smooth") {
    const list = slides();
    i = Math.max(0, Math.min(list.length - 1, i));
    target = i;
    clearTimeout(settle);
    settle = setTimeout(() => (target = null), 900); // in case it never quite lands
    track.scrollTo({ left: leftOf(list[i]), behavior });
    index = i;
  }

  // Where a slide starts, in the track's scroll coordinates (snapped to the gutter).
  const leftOf = (s) => s.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - padLeft();

  let raf = 0;
  function onScroll() {
    if (drag) return;
    if (target !== null) {
      if (Math.abs(track.scrollLeft - leftOf(slides()[target])) < 2) target = null;
      return;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const x = track.scrollLeft;
      const lefts = slides().map(leftOf);
      let best = 0;
      lefts.forEach((l, i) => {
        if (Math.abs(l - x) < Math.abs(lefts[best] - x)) best = i;
      });
      index = best;
    });
  }

  // The scale: the tallest slide, laid out at the design width, fits the
  // track's height. Scaling down widens each slide's own layout, so its text
  // rewraps shorter; a few halvings find the largest scale that fits.
  function fit() {
    if (!track) return;
    track.removeAttribute("data-overflow");
    track.style.height = "";
    if (!sideways()) return void track.style.setProperty("--z", 1);
    const cs = getComputedStyle(track);
    const pads = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const avail = track.clientHeight - pads;
    const colW = slides()[0].clientWidth;
    // The slides' height on screen at scale z (the layout is 1/z larger)
    const tallest = (z) => {
      track.style.setProperty("--z", z);
      return z * Math.max(...slides().map((s) => inner(s).offsetHeight));
    };
    track.toggleAttribute("data-measure", true); // each slide at its own height
    let hi = Math.min(1, colW / DESIGN_W);
    let lo = MIN_ZOOM;
    if (tallest(hi) <= avail) lo = hi;
    else if (tallest(lo) > avail) {
      // Too short even at the smallest scale: the track grows, the page scrolls.
      track.setAttribute("data-overflow", "");
      track.style.height = `${Math.ceil(tallest(lo) + pads)}px`;
    } else
      for (let n = 0; n < 7; n++) {
        const mid = (lo + hi) / 2;
        if (tallest(mid) <= avail) lo = mid;
        else hi = mid;
      }
    track.toggleAttribute("data-measure", false);
    track.style.setProperty("--z", lo);
    go(index, "instant"); // stay on this chapter
  }

  // Dragging with the mouse (touch already scrolls): the slides follow the
  // hand, then snap to the next or previous chapter, or back.
  let drag = $state(null);
  let dragged = false;
  function onPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0 || !sideways() || e.target.closest("a, button")) return;
    drag = { x: e.clientX, left: track.scrollLeft };
    dragged = false;
    track.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) dragged = true;
    track.scrollLeft = drag.left - dx;
  }
  function onPointerUp(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag = null;
    // A short flick is enough: an eighth of a slide moves one chapter.
    const step = Math.abs(dx) > slides()[0].getBoundingClientRect().width / 8 ? -Math.sign(dx) : 0;
    go(index + step);
  }

  // A click on the neighbour peeking at either edge goes to it (not the end of a drag).
  function onClick(e) {
    if (dragged) return void (dragged = false);
    if (e.target.closest("a, button") || !sideways()) return;
    const i = slides().findIndex((s) => s.contains(e.target));
    if (i >= 0 && i !== index) go(i);
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea, [contenteditable]")) return;
    if (!sideways()) return; // stacked: nothing to step
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else return;
    e.preventDefault();
  }

  onMount(() => {
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const ro = new ResizeObserver(refit);
    ro.observe(track);
    document.fonts?.ready.then(refit); // the fonts change every height
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  });
  const pad = (n) => String(n).padStart(2, "0");
</script>

<svelte:window onkeydown={onKey} />

<section class="carousel" aria-roledescription="carousel" aria-label="The story">
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (pointer shortcuts; the deck and ← → are the keyboard's) -->
  <div
    class="track"
    class:dragging={drag}
    bind:this={track}
    onscroll={onScroll}
    onclick={onClick}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    ondragstart={(e) => e.preventDefault()}
  >
    {@render children()}
  </div>

  <div class="deck" role="group" aria-label="Chapters">
    <span class="key-col">
      <button class="round b" aria-label="Previous chapter" disabled={index === 0} onclick={() => go(index - 1)}>◀</button>
      <span class="etch">BACK</span>
    </span>
    <div class="lcd" aria-live="polite">
      <span class="lcd-line"><b>{pad(index + 1)}</b>/{pad(titles.length)} · {titles[index]}</span>
      <span class="pips">
        {#each titles as t, i}
          <button class:on={i === index} aria-label="Chapter {i + 1}: {t}" aria-current={i === index ? "step" : undefined} onclick={() => go(i)}></button>
        {/each}
      </span>
    </div>
    <span class="key-col">
      <button class="round a" aria-label="Next chapter" disabled={index === titles.length - 1} onclick={() => go(index + 1)}>▶</button>
      <span class="etch">NEXT</span>
    </span>
  </div>
</section>

<style>
  .carousel {
    --slide: min(1320px, calc(100vw - 120px)); /* set by the pages' layout too, for the header */
    --gutter: calc((100vw - var(--slide)) / 2);
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .track {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: var(--slide);
    /* One row, exactly the track's height: a slide's unscaled layout
       mustn't size it (its panels are scaled into this room) */
    grid-template-rows: minmax(0, 1fr);
    gap: 28px;
    padding: 6px var(--gutter) 18px;
    scroll-padding-inline: var(--gutter);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
  }
  .track::-webkit-scrollbar { display: none; }
  .track[data-overflow] { flex: none; }
  .track :global(img) { -webkit-user-drag: none; }
  /* While dragging: no snapping (it snaps on release), the hand closed */
  .track.dragging { scroll-snap-type: none; }
  .track.dragging,
  .track.dragging :global(*) { cursor: grabbing !important; }

  /* The deck: a graphite module under the slides */
  .deck {
    flex: none;
    width: fit-content;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 12px 18px 10px;
    border-radius: 18px;
    background: linear-gradient(165deg, #3b3f3d, #2d302f 38%, #262928);
    box-shadow:
      inset 0 1.5px 0 rgb(255 255 255 / 0.12),
      0 5px 0 #171918,
      0 5px 0 1px rgba(0, 0, 0, 0.3),
      0 18px 24px -8px rgba(30, 28, 20, 0.5);
  }
  .key-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .etch {
    font-family: var(--label);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: rgba(210, 214, 210, 0.5);
  }
  .round {
    width: 40px;
    height: 40px;
    padding: 0 0 2px;
    border: none;
    border-radius: 50%;
    font-size: 13px;
    cursor: pointer;
    transition: transform 0.06s ease, box-shadow 0.06s ease, opacity 0.15s ease;
  }
  .round.b {
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 4px 0 #121413, inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .round.a {
    color: #fff3ea;
    background: radial-gradient(circle at 40% 30%, #ff965e, #ff6a1a 55%, #e65d14);
    box-shadow: 0 4px 0 #b8460b, inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  .round:active:not(:disabled) { transform: translateY(3px); }
  .round.b:active:not(:disabled) { box-shadow: 0 1px 0 #121413; }
  .round.a:active:not(:disabled) { box-shadow: 0 1px 0 #b8460b; }
  .round:disabled { opacity: 0.4; cursor: default; }
  .lcd {
    width: min(380px, 52vw);
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 9px 12px 8px;
    border-radius: 7px;
    background: radial-gradient(120% 90% at 30% 20%, #142019, #0b100d 70%);
    box-shadow: inset 0 0 0 2px #050706, inset 0 3px 8px rgba(0, 0, 0, 0.8);
    font-family: var(--mono);
    color: #d5e4c6;
  }
  .lcd-line {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: #8fa385;
  }
  .lcd-line b { color: #ff6a1a; font-weight: 700; }
  .pips {
    display: flex;
    gap: 6px;
  }
  .pips button {
    flex: 1;
    height: 4px;
    padding: 0;
    border: none;
    border-radius: 2px;
    background: #2b3a2c;
    cursor: pointer;
  }
  .pips button.on {
    background: #ff6a1a;
    box-shadow: 0 0 6px #ff6a1a;
  }

  /* Phones: the chapters stack, one column of panels, no deck */
  @media (max-width: 760px) {
    .track {
      display: flex;
      flex-direction: column;
      gap: 44px;
      padding: 0 12px 16px;
      overflow: visible;
      cursor: auto;
      user-select: auto; /* stacked: nothing to drag, so text selects again */
      -webkit-user-select: auto;
    }
    .deck { display: none; }
  }
</style>
