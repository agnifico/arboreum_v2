<script>
  // A panel on the story's pages: a module body like the console's (screws,
  // an etched label), placed on a 12-column grid. Tones are the console's
  // WORKSHOP materials plus the accent. span: columns (of 12); rows: 1 or 2.
  let { tone = "bone", span = 6, rows = 1, label = "", flush = false, children } = $props();
</script>

<section class="panel {tone} c{span}" class:r2={rows === 2} class:flush>
  <i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>
  {@render children()}
  {#if label}<span class="etch">{label}</span>{/if}
</section>

<style>
  .panel {
    --face: #e6e0d0;
    --face-hi: #f4f0e4;
    --side: #b7ae98;
    --rim: 0.55;
    --ink: #2b2d2c;
    --ink-soft: #5f625d;
    --etch: rgba(30, 32, 31, 0.5);
    position: relative;
    box-sizing: border-box;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 26px 26px 38px;
    border-radius: 14px;
    color: var(--ink);
    background: linear-gradient(165deg, var(--face-hi), var(--face) 38%, color-mix(in oklab, var(--face), black 8%));
    box-shadow:
      inset 0 1.5px 0 rgb(255 255 255 / var(--rim)),
      inset 0 -2px 0 rgba(0, 0, 0, 0.12),
      0 6px 0 var(--side),
      0 6px 0 1px rgba(0, 0, 0, 0.3),
      0 16px 20px -6px rgba(40, 36, 24, 0.45);
  }
  .flush { padding: 14px 14px 36px; }
  .alu { --face: #c8ccc8; --face-hi: #e6e9e6; --side: #8b908c; }
  .moss { --face: #6d8756; --face-hi: #87a26d; --side: #4a5e3a; --ink: #f4f1e6; --ink-soft: rgba(244, 241, 230, 0.8); --etch: rgba(255, 255, 255, 0.6); --rim: 0.3; }
  .graphite { --face: #2d302f; --face-hi: #3b3f3d; --side: #171918; --ink: #ecebe5; --ink-soft: rgba(236, 235, 229, 0.72); --etch: rgba(210, 214, 210, 0.45); --rim: 0.12; }
  .signal { --face: #ff6a1a; --face-hi: #ff8d4f; --side: #b8460b; --ink: #2b1406; --ink-soft: rgba(43, 20, 6, 0.78); --etch: rgba(43, 20, 6, 0.55); --rim: 0.35; }

  .c2 { grid-column: span 2; }
  .c3 { grid-column: span 3; }
  .c4 { grid-column: span 4; }
  .c5 { grid-column: span 5; }
  .c6 { grid-column: span 6; }
  .c7 { grid-column: span 7; }
  .c8 { grid-column: span 8; }
  .c9 { grid-column: span 9; }
  .c12 { grid-column: span 12; }
  .r2 { grid-row: span 2; }

  .screw {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fbfbfa, #b8bcbb 40%, #6a6f6d 75%, #464a48);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.35);
  }
  .screw::after {
    content: "";
    position: absolute;
    inset: 3.5px 2px auto;
    height: 1.5px;
    background: rgba(40, 42, 41, 0.75);
    transform: rotate(-35deg);
  }
  .tl { top: 9px; left: 9px; }
  .tr { top: 9px; right: 9px; }
  .bl { bottom: 9px; left: 9px; }
  .br { bottom: 9px; right: 9px; }
  .etch {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
    font-family: var(--label);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--etch);
  }

  /* Phones: one column */
  @media (max-width: 760px) {
    .panel { grid-column: 1 / -1; padding: 24px 22px 38px; }
    .flush { padding: 12px 12px 34px; }
  }
</style>
