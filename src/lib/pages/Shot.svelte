<script>
  // An image on a story page, set into a screen: a graphite panel with the
  // picture behind glass and the caption etched under it, like SCR-01.
  // The glass fills whatever height the row gives it (the picture covers),
  // so the text sets each row's height and the carousel's fit can shrink
  // it. `ratio` keeps the picture's shape when it stands alone (phones).
  import Panel from "./Panel.svelte";
  let { src, alt, caption = "", span = 6, rows = 1, ratio = "1936 / 1024", position = "center", contain = false, loading = "lazy" } = $props();
</script>

<Panel tone="graphite" {span} {rows} label={caption} flush>
  <div class="glass" style:--ratio={ratio} class:contain>
    <img {src} {alt} {loading} style:object-position={position} />
    <span class="glare" aria-hidden="true"></span>
  </div>
</Panel>

<style>
  .glass {
    position: relative;
    flex: 1;
    min-height: 150px;
    border-radius: 8px;
    overflow: hidden;
    background: #0b100d;
    box-shadow: inset 0 0 0 2px #050706, 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .contain img { object-fit: contain; }
  @media (max-width: 760px) {
    .glass { min-height: 0; aspect-ratio: var(--ratio); }
  }
  /* The glass's edge over the picture */
  .glare {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 2px #050706, inset 0 3px 10px rgba(0, 0, 0, 0.55);
    background: linear-gradient(118deg, rgba(255, 255, 255, 0.06) 0 22%, transparent 22.5%);
    pointer-events: none;
  }
</style>
