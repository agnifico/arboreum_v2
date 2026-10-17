<script>
  // One chapter of the story's carousel. The slide is a plain box, one
  // uniform width, so snapping lands exactly; its panels sit on a 12-column
  // grid inside and are scaled (--z, set by the carousel's fit) to the room
  // the window leaves. `rows`: the grid's rows, when one row should take the
  // spare height (the cover).
  let { label, rows = null, children } = $props();
</script>

<div class="slide" role="group" aria-roledescription="slide" aria-label={label}>
  <div class="inner" style:grid-template-rows={rows}>
    {@render children()}
  </div>
</div>

<style>
  .slide {
    position: relative;
    min-width: 0;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  /* Laid out larger by 1/z, then scaled down by z: exactly the slide's box.
     Rows stretch to its height, so every chapter fills the same room. */
  .inner {
    box-sizing: border-box;
    width: calc(100% / var(--z, 1));
    height: calc(100% / var(--z, 1));
    transform: scale(var(--z, 1));
    transform-origin: 0 0;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: auto;
    gap: 18px;
    align-content: stretch;
    padding-bottom: 8px; /* the panels' thickness */
  }
  /* The carousel measuring (fit): each slide at its own height */
  :global(.track[data-measure]) .inner { height: auto; }

  /* Phones: the chapters stack, nothing scales */
  @media (max-width: 760px) {
    .inner {
      width: auto;
      height: auto;
      transform: none;
      gap: 16px;
    }
  }
</style>
