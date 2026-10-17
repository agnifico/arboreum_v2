<script>
  // The pages around the device (about, the manual, the story): printed
  // sheets on the device's mat, under a strip shaped like its nameplate. The
  // nameplate's printing links here; the key at the left goes back.
  import { page } from "$app/state";
  let { children } = $props();
  const PAGES = [
    ["/about", "ABOUT"],
    ["/help", "HELP"],
    ["/story", "STORY"],
  ];
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="pages">
  <header class="plate">
    <span class="well"><a class="back" href="/" title="Back to the device">◂ DEVICE</a></span>
    <span class="stripe" aria-hidden="true"></span>
    <nav aria-label="Pages">
      {#each PAGES as [href, label]}
        <a {href} class:on={page.url.pathname === href} aria-current={page.url.pathname === href ? "page" : undefined}>{label}</a>
      {/each}
    </nav>
    <a class="name" href="/">
      <span class="brand">ARBOREUM</span>
      <span class="model">JXF26-ARB-16A</span>
    </a>
  </header>

  <main class="sheet">
    {@render children()}
  </main>

  <footer>
    <span>ARBOREUM · JXF26-ARB-16A</span>
    <a href="https://junesforge.com" target="_blank" rel="noopener">by JUNESFORGE</a>
    <a href="/classic">THE CLASSIC APP</a>
  </footer>
</div>

<style>
  .pages {
    --bone: #e6e0d0;
    --bone-hi: #f4f0e4;
    --bone-side: #b7ae98;
    --paper: #faf8f2;
    --graphite: #2d302f;
    --ink: #2b2d2c;
    --ink-soft: #5f625d;
    --rule: #d9d3c3;
    --moss: #6d8756;
    --signal: #ff6a1a;
    --signal-text: #d4520c; /* the accent as text on paper: a shade darker to read */
    --mat: #ebe8e0;
    --mat-line: #d6d1c4;
    --label: "Chakra Petch", system-ui, sans-serif;
    --body: "IBM Plex Sans", system-ui, sans-serif;
    --mono: "JetBrains Mono", ui-monospace, monospace;

    min-height: 100dvh;
    box-sizing: border-box;
    padding: 20px 16px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    background-color: var(--mat);
    background-image:
      linear-gradient(transparent calc(100% - 1px), var(--mat-line) 0),
      linear-gradient(90deg, transparent calc(100% - 1px), var(--mat-line) 0);
    background-size: 48px 48px;
    color: var(--ink);
    font-family: var(--body);
  }

  /* The strip: a bone body like the nameplate's, with its stripes */
  .plate {
    position: relative;
    box-sizing: border-box;
    width: min(100%, 980px);
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 14px 24px 14px 14px;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(165deg, var(--bone-hi), var(--bone) 38%, color-mix(in oklab, var(--bone), black 8%));
    box-shadow:
      inset 0 1.5px 0 rgb(255 255 255 / 0.55),
      inset 0 -2px 0 rgba(0, 0, 0, 0.12),
      0 6px 0 var(--bone-side),
      0 6px 0 1px rgba(0, 0, 0, 0.3),
      0 16px 20px -6px rgba(40, 36, 24, 0.45);
    font-family: var(--label);
  }
  /* The way back is a pill key in a well, like Configure's */
  .well {
    display: flex;
    padding: 6px 7px 9px;
    border-radius: 20px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
    z-index: 1;
  }
  .back {
    display: block;
    padding: 6px 12px;
    border-radius: 13px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #c9cec9;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.5);
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .back:hover { color: #fff; }
  .back:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #141615;
  }
  .stripe {
    flex: none;
    align-self: stretch;
    width: 70px;
    margin: -14px 0;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, var(--ink) 60% 66%, transparent 66%);
  }
  /* Tabs: the List module's index tabs, lying down */
  nav {
    display: flex;
    gap: 6px;
  }
  nav a {
    padding: 6px 12px 5px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(210, 214, 210, 0.7);
    background: linear-gradient(180deg, #3b3f3d, #2b2e2d);
    box-shadow: 0 2px 0 #121413, inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  nav a:hover { color: #fff; }
  nav a.on {
    color: #2b1406;
    background: linear-gradient(180deg, #ffa36b, var(--signal));
    box-shadow: 0 2px 0 #b8460b;
  }
  .name {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1;
  }
  .brand {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-right: -0.06em;
  }
  .model {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--signal);
  }

  /* The sheet: one printed page */
  .sheet {
    box-sizing: border-box;
    width: min(100%, 980px);
    padding: clamp(28px, 6vw, 64px) clamp(20px, 7vw, 96px) clamp(36px, 6vw, 72px);
    border-radius: 6px;
    background: var(--paper);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 2px 0 var(--rule), 0 18px 30px -16px rgba(40, 36, 24, 0.35);
    font-size: 17px;
    line-height: 1.65;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 22px;
    font-family: var(--label);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--ink-soft);
  }
  footer a:hover { color: var(--signal-text); }

  /* Shared print styles for the pages */
  .sheet :global(.kicker) {
    margin: 0 0 10px;
    font-family: var(--label);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--signal-text);
  }
  .sheet :global(h1) {
    margin: 0 0 18px;
    font-family: var(--label);
    font-size: clamp(34px, 6vw, 52px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: 0.01em;
  }
  .sheet :global(.lead) {
    margin: 0 0 8px;
    max-width: 38em;
    font-size: 20px;
    line-height: 1.55;
    color: var(--ink-soft);
  }
  .sheet :global(h2) {
    margin: 56px 0 14px;
    padding-top: 18px;
    border-top: 1.5px solid var(--rule);
    font-family: var(--label);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .sheet :global(h2 .no) {
    margin-right: 10px;
    font-family: var(--mono);
    color: var(--signal-text);
  }
  .sheet :global(h3) {
    margin: 28px 0 6px;
    font-family: var(--label);
    font-size: 19px;
    font-weight: 700;
  }
  .sheet :global(p),
  .sheet :global(li) {
    max-width: 40em;
  }
  .sheet :global(p) { margin: 0 0 14px; }
  .sheet :global(ul),
  .sheet :global(ol) {
    margin: 0 0 14px;
    padding-left: 1.3em;
  }
  .sheet :global(li) { margin-bottom: 6px; }
  .sheet :global(li::marker) { color: var(--signal-text); }
  .sheet :global(strong) { font-weight: 600; }
  .sheet :global(a:not(.plain)) {
    color: var(--signal-text);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
  }
  .sheet :global(code) {
    font-family: var(--mono);
    font-size: 0.86em;
    white-space: nowrap;
    padding: 1px 5px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--bone) 70%, transparent);
  }
  /* A key on the console, printed small: dark caps, the A key in the accent */
  .sheet :global(kbd) {
    display: inline-block;
    min-width: 1.5em;
    padding: 1px 7px 2px;
    border-radius: 5px;
    font-family: var(--label);
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.6;
    text-align: center;
    vertical-align: 0.1em;
    color: #e4e6e2;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 2px 0 #141615;
  }
  .sheet :global(kbd.a) {
    color: #fff3ea;
    background: linear-gradient(180deg, #ff8a4a, var(--signal));
    box-shadow: 0 2px 0 #b8460b;
  }
  .sheet :global(kbd.key) {
    color: var(--ink);
    background: linear-gradient(180deg, #fffdf6, #ebe5d3);
    box-shadow: 0 2px 0 #b7ae98, inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  }
  /* Spec tables: label column in the hardware's printing */
  .sheet :global(table) {
    width: 100%;
    margin: 6px 0 18px;
    border-collapse: collapse;
    font-size: 15px;
    line-height: 1.5;
  }
  .sheet :global(th),
  .sheet :global(td) {
    padding: 9px 12px 9px 0;
    border-bottom: 1px solid var(--rule);
    text-align: left;
    vertical-align: top;
  }
  .sheet :global(th) {
    font-family: var(--label);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--ink-soft);
  }
  .sheet :global(.table-wrap) {
    overflow-x: auto;
  }
  .sheet :global(.note) {
    padding: 14px 18px;
    border-left: 3px solid var(--signal);
    border-radius: 0 6px 6px 0;
    background: color-mix(in srgb, var(--bone) 45%, transparent);
    font-size: 16px;
  }

  @media (max-width: 640px) {
    .pages { padding: 12px 10px 22px; gap: 16px; }
    .plate { flex-wrap: wrap; gap: 12px; padding: 12px 16px 12px 12px; }
    .stripe { display: none; }
    .name { order: -1; margin-left: auto; }
    nav { width: 100%; }
    nav a { flex: 1; text-align: center; padding-inline: 0; }
    .brand { font-size: 22px; }
    .sheet { font-size: 16px; }
    .sheet :global(.lead) { font-size: 18px; }
  }
</style>
