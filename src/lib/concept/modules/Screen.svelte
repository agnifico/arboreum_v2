<script>
  import { onMount } from "svelte";
  import { useDevice, Device, ago } from "../device.svelte.js";
  import { treeName, TREES } from "../trees.js";
  import GardenMap from "../GardenMap.svelte";
  import NoteRows from "../NoteRows.svelte";
  import MonoEditor from "../MonoEditor.svelte";
  const device = useDevice();
  // Portrait has no List module, so the list takes over the screen.
  let showList = $derived(device.focus === "list" && !device.hasListModule);

  // Status-line clock
  let now = $state(new Date());
  onMount(() => {
    const t = setInterval(() => (now = new Date()), 15000);
    return () => clearInterval(t);
  });
  const pad2 = (n) => String(n).padStart(2, "0");
  let clock = $derived(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
  let date = $derived(`${pad2(now.getDate())}·${pad2(now.getMonth() + 1)}`);
  const fmtDate = (d) => (d ? `${pad2(d.getDate())}·${pad2(d.getMonth() + 1)}·${String(d.getFullYear()).slice(2)}` : "—");

  const PAGES = ["format", "details"];
  function page(step) {
    const i = PAGES.indexOf(device.stripPage);
    device.stripPage = PAGES[(i + step + PAGES.length) % PAGES.length];
  }

  // Enter in the title moves on to the text.
  function titleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      device.editorApi?.focus();
    }
  }
  // The red "!" and the drawer only concern an open note.
  let alertText = $derived(device.missing.map((m) => (m === "tree" ? "NO TREE" : "NO PLOT")).join(" · "));
  let drawerLabel = $derived(device.drawerSections.map((x) => x.toUpperCase()).join(" · "));
  let drawerWarn = $derived(device.missing.some((m) => device.drawerSections.includes(m)));
  let drawerOpen = $derived(device.focus === "drawer");
  const pad2s = (n) => String(n).padStart(2, "0");
</script>

<!-- SCREEN -->
<section class="mod graphite screen" class:focused={device.focus === "editor"} aria-label="Screen module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="glass">
    <div class="status">
      {#if showList}
        <span>▣ <b>NOTES</b> <span class="mode">· {device.notes.length}</span></span>
      {:else}
        {#if device.editing}
          <span class="title-wrap">▣ <input class="title-in" bind:value={device.draftTitle} placeholder="untitled" aria-label="Title" onkeydown={titleKey} /></span>
        {:else}
          <span>▣ <b>{device.note?.title ?? "—"}</b> <span class="mode">· PREVIEW</span></span>
        {/if}
      {/if}
      <span class="status-r" aria-live="polite">{#if device.message}<span class="msg">{device.message}</span>{:else}{#if device.dirty}<span class="dot-unsaved">●</span> UNSAVED{:else if device.isNew}<span class="dot-new">●</span> NEW{:else if device.editing}<span class="dot-saved">●</span> SAVED{/if}{/if}<span class="wide-only"> <span class="sep">│</span> {clock} <span class="sep">│</span> {date}</span></span>
    </div>

    {#if showList}
      <div class="code list-screen"><NoteRows big /></div>
    {/if}
    <!-- The editor stays mounted (hidden under the portrait list) so it keeps its state -->
    <div class="editor-area" class:hidden={showList} aria-label="Note text">
      <MonoEditor />
    </div>

    <!-- Missing modules: the red "!" says what's missing; the drawer stands in
         for the modules that aren't slotted, laid out like them -->
    {#if device.editing && !showList}
      {#if alertText && !drawerOpen}
        <button class="alert" onclick={() => device.resolveMissing()} aria-label="Missing: {alertText}">
          <span class="bang">!</span>
          <span>{alertText}</span>
          <span class="alert-arrow">▸</span>
        </button>
      {/if}
      <button
        class="drawer-tab"
        class:warn={drawerWarn}
        class:open={drawerOpen}
        aria-expanded={drawerOpen}
        aria-label="{drawerLabel}: {device.draftIcon ? treeName(device.draftIcon) : 'no tree yet'}"
        onclick={() => (drawerOpen ? device.closeDrawer() : device.openDrawer())}
      >
        {#each device.drawerSections as sec}
          {#if sec === "tree"}
            {#if device.draftIcon}<img class="tab-tree" src={device.draftIcon} alt="" />{:else}<span class="tab-none">?</span>{/if}
          {:else}<span class="tab-text">{sec.toUpperCase()}</span>{/if}
        {/each}
      </button>
      {#if drawerOpen}
        <div class="drawer" role="dialog" aria-label="{drawerLabel} (virtual module)">
          {#if device.drawerSections.length > 1}
            <div class="dr-tabs">
              {#each device.drawerSections as sec}
                <button class:on={device.drawerSection === sec} aria-label={sec} onclick={() => (device.drawerSection = sec)}>
                  {#if sec === "tree"}{#if device.draftIcon}<img class="sec-tree" src={device.draftIcon} alt="" />{:else}?{/if}{:else}{sec.toUpperCase()}{/if}
                </button>
              {/each}
            </div>
          {/if}
          {#if device.drawerSection === "tree"}
            <div class="dr-module">
              <div class="dr-head"><span>TRM-01</span><span class="dr-virtual">VIRTUAL</span></div>
              <div class="trees" role="radiogroup" aria-label="Trees">
                {#each TREES as t, i}
                  <button
                    class="tree"
                    class:cur={i === device.treeIndex}
                    class:chosen={t.src === device.draftIcon}
                    role="radio"
                    aria-checked={t.src === device.draftIcon}
                    aria-label={t.name}
                    onclick={() => device.pickTree(i)}
                  ><img src={t.src} alt="" /></button>
                {/each}
              </div>
              <div class="dr-caption">{TREES[device.treeIndex].name.toUpperCase()}</div>
            </div>
          {:else}
            {@const at = device.atCursor}
            <div class="dr-module">
              <div class="dr-head"><span>MAP-01</span><span class="dr-virtual">VIRTUAL</span></div>
              <GardenMap cursor={device.cursor} plots={device.plots} rows={7} onpick={(t) => (device.cursor = t)} />
              <div class="dr-caption" class:taken={at && !at.mine}>
                PLOT {pad2s(device.cursor.x)},{pad2s(device.cursor.y)} · {!at ? "FREE" : at.mine ? "YOURS" : "TAKEN"}
              </div>
              <button class="dr-plant" onclick={() => device.plant()}>✎ PLANT HERE</button>
            </div>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- A/B context: overlaid, always visible -->
    <div class="ab">
      <span><i class="pip a">A</i>{device.labels.a}</span>
      <span><i class="pip b">B</i>{device.labels.b}</span>
      <span><i class="pip st">≡</i>{device.labels.start}</span>
    </div>

    <!-- Secondary strip: paged with ◀ ▶ (format · details) -->
    <div class="strip">
      <button class="pg" aria-label="Previous strip page" onclick={() => page(-1)}>◀</button>
      <span class="strip-label">{device.stripPage === "format" ? "FORMAT" : "DETAILS"}</span>
      <button class="pg" aria-label="Next strip page" onclick={() => page(1)}>▶</button>
      {#if device.stripPage === "format"}
        <span class="keys" class:off={!device.canFormat}>
          {#each Device.FORMATS as f}
            <button
              class="key"
              class:on={device.canFormat && device.active[f.key]}
              aria-pressed={device.canFormat && !!device.active[f.key]}
              aria-label={f.key}
              disabled={!device.canFormat}
              onmousedown={(e) => e.preventDefault()}
              onclick={() => device.format(f.key)}>{f.label}</button>
          {/each}
        </span>
      {:else}
        {@const d = device.details}
        <span class="details">
          <span><i>WORDS</i>{d.words}</span>
          <span><i>MADE</i>{fmtDate(d.made)}</span>
          <span><i>SAVED</i>{d.saved ? ago(d.saved) : "—"}</span>
          <span class:warn={d.status === "UNSAVED"}><i>STATUS</i>{d.status}</span>
          <span><i>TREE</i>{d.tree ? treeName(d.tree) : "NONE"}</span>
          <span class:warn={!d.plot}><i>PLOT</i>{d.plot ? d.plot.map(pad2).join(",") : "NONE"}</span>
        </span>
      {/if}
      <span class="pages"><i class:on={device.stripPage === "format"}></i><i class:on={device.stripPage === "details"}></i></span>
    </div>
    {#if device.overlay?.kind === "menu"}
      <div class="overlay" role="menu" aria-label={device.overlay.title}>
        <div class="ov-title"><span>{device.overlay.title}</span>{#if device.overlay.hint}<span class="ov-hint">{device.overlay.hint}</span>{/if}</div>
        {#each device.overlay.items as item, i}
          <div class="ov-item" class:sel={i === device.overlay.index} role="menuitem">
            <span class="ov-caret">{i === device.overlay.index ? "▸" : ""}</span>{typeof item.label === "function" ? item.label() : item.label}
          </div>
        {/each}
      </div>
    {:else if device.overlay?.kind === "confirm"}
      <div class="overlay confirm" role="alertdialog" aria-label={device.overlay.title}>
        <div class="ov-title">{device.overlay.title}</div>
        <p class="ov-text">{device.overlay.text}</p>
        <div class="ov-keys">
          <span><i class="pip a">A</i>{device.overlay.yes}</span>
          <span><i class="pip b">B</i>{device.overlay.no}</span>
          {#if device.overlay.alt}<span><i class="pip st">≡</i>{device.overlay.alt.label}</span>{/if}
        </div>
      </div>
    {/if}
    <div class="glare" aria-hidden="true"></div>
  </div>
  <span class="etch-dark screen-label">SCR-01 · MONO</span>
</section>

<style>
  .screen { grid-area: scr; }
  .screen {
    padding: 26px 30px 30px;
  }
  .screen-label {
    position: absolute;
    bottom: 9px;
    right: 34px;
    font-size: 9px;
  }
  .glass {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .status {
    display: flex;
    justify-content: space-between;
    padding: 10px 18px;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--phosphor-dim);
    border-bottom: 1px solid rgba(213, 228, 198, 0.08);
  }
  .status b {
    font-size: 14px;
    color: var(--phosphor);
    font-weight: 500;
  }
  .list-screen {
    display: flex;
    flex-direction: column;
    padding: 6px 0;
  }
  /* Menu and confirm draw on the screen itself, like a device OS */
  .overlay {
    position: absolute;
    left: 50%;
    top: 44%;
    transform: translate(-50%, -50%);
    min-width: 260px;
    max-width: 80%;
    padding: 12px 0 10px;
    background: #080c09; /* opaque: bright text would ghost through */
    border: 1px solid rgba(213, 228, 198, 0.25);
    border-radius: 6px;
    box-shadow: 0 0 0 1px #000, 0 12px 30px rgba(0, 0, 0, 0.6);
    font-size: 13px;
    letter-spacing: 0.06em;
    z-index: 3;
  }
  .ov-title {
    padding: 0 18px 8px;
    margin-bottom: 6px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--phosphor-dim);
    border-bottom: 1px solid rgba(213, 228, 198, 0.1);
  }
  .ov-title {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  .ov-hint {
    color: #4f6150;
    font-weight: 500;
  }
  .ov-item {
    display: flex;
    gap: 8px;
    padding: 6px 18px;
    color: #a9bb9d;
  }
  .ov-item.sel {
    color: #fff;
    background: rgba(255, 106, 26, 0.14);
  }
  .ov-caret {
    width: 10px;
    color: var(--signal);
  }
  .confirm .ov-title {
    color: #ff9ea3;
  }
  .ov-text {
    margin: 4px 18px 12px;
    line-height: 1.5;
    color: var(--phosphor);
  }
  .ov-keys {
    display: flex;
    gap: 16px;
    padding: 0 18px;
    font-size: 11px;
    font-weight: 700;
  }
  .ov-keys span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* Text stops where the bottom strip (40px) begins */
  .editor-area {
    flex: 1;
    min-height: 0;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
  }
  .hidden {
    display: none;
  }
  .title-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }
  .title-in {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 14px; /* a step up from the 12px status line */
    font-weight: 600;
    color: var(--phosphor);
    caret-color: var(--signal);
    outline: none;
  }
  .title-in::placeholder {
    color: var(--phosphor-dim);
  }
  .dot-new {
    color: var(--phosphor-dim);
  }
  .dot-saved {
    color: #6fae5a;
  }
  .mode {
    color: var(--phosphor-dim);
    font-weight: 400;
  }
  .msg {
    color: var(--signal);
    font-weight: 700;
  }
  .dot-unsaved {
    color: var(--signal);
  }
  .sep {
    opacity: 0.4;
    margin: 0 4px;
  }
  /* Text stops where the bottom strip (40px) begins */
  .code {
    flex: 1;
    min-height: 0;
    margin-bottom: 40px;
    overflow: hidden;
    padding: 14px 120px 14px 0;
    font-size: 15px;
    line-height: 26px;
  }
  .alert {
    position: absolute;
    right: 18px;
    top: 52px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #ffd9d9;
    background: rgba(229, 50, 59, 0.16);
    border: 1px solid rgba(229, 50, 59, 0.55);
    border-radius: 4px;
  }
  .bang {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    background: var(--alert);
    color: #fff;
    font-family: var(--label);
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 0 10px rgba(229, 50, 59, 0.6);
    animation: pulse 1.6s ease-in-out infinite;
  }
  .alert {
    font-family: inherit;
    cursor: pointer;
    z-index: 2;
  }
  .alert-arrow {
    color: var(--alert);
  }
  .drawer-tab {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    writing-mode: vertical-rl;
    padding: 12px 4px;
    font-family: inherit;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--phosphor);
    background: rgba(213, 228, 198, 0.1);
    border-left: 1px solid rgba(213, 228, 198, 0.3);
    border-radius: 4px 0 0 4px;
    cursor: pointer;
  }
  .drawer-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    writing-mode: horizontal-tb; /* only the words run vertically */
  }
  .tab-text {
    writing-mode: vertical-rl;
  }
  .tab-tree {
    width: 18px;
    height: 18px;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .tab-none {
    writing-mode: horizontal-tb;
    font-size: 12px;
    font-weight: 700;
  }
  .sec-tree {
    display: block;
    width: 16px;
    height: 16px;
    margin: 0 auto;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .drawer-tab.warn {
    color: #ffd9d9;
    background: rgba(229, 50, 59, 0.25);
    border-left-color: rgba(229, 50, 59, 0.6);
  }
  .drawer-tab.open {
    right: min(44%, 300px);
  }
  /* The drawer: a virtual stand-in for an unslotted module */
  .drawer {
    position: absolute;
    top: 38px;
    right: 0;
    bottom: 40px;
    z-index: 2;
    width: min(44%, 300px);
    box-sizing: border-box;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0a0f0c;
    border-left: 1px solid rgba(213, 228, 198, 0.22);
    box-shadow: -14px 0 24px rgba(0, 0, 0, 0.5);
    animation: slide-in 0.16s ease-out;
    overflow-y: auto;
    scrollbar-width: none;
  }
  @keyframes slide-in {
    from { transform: translateX(30px); opacity: 0; }
  }
  .dr-tabs {
    display: flex;
    gap: 6px;
  }
  .dr-tabs button,
  .dr-plant {
    flex: 1;
    padding: 5px 0;
    font-family: inherit;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--phosphor-dim);
    border: 1px solid rgba(213, 228, 198, 0.18);
    border-radius: 4px;
    background: none;
  }
  .dr-tabs button.on {
    color: #10130f;
    background: var(--phosphor);
  }
  /* Laid out like the real module: a bordered panel with its model number */
  .dr-module {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border: 1px dashed rgba(213, 228, 198, 0.3);
    border-radius: 8px;
  }
  .dr-head {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--phosphor-dim);
  }
  .dr-virtual {
    color: var(--signal);
  }
  .trees {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)); /* sprites mustn't widen the grid */
    gap: 6px;
  }
  .tree {
    min-width: 0;
    aspect-ratio: 1;
    padding: 4px;
    border-radius: 6px;
    background: rgba(213, 228, 198, 0.05);
    border: 1px solid transparent;
  }
  .tree img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .tree.chosen {
    background: rgba(213, 228, 198, 0.14);
  }
  .tree.cur {
    border-color: var(--signal);
    box-shadow: 0 0 0 1px var(--signal);
  }
  .dr-caption {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--phosphor);
    text-align: center;
  }
  .dr-caption.taken {
    color: #ffb3a1;
  }
  .dr-plant {
    flex: none;
    color: #fff3ea;
    background: var(--signal);
    border-color: var(--signal);
  }
  .ab {
    position: absolute;
    right: 14px;
    bottom: 54px;
    display: flex;
    gap: 14px;
    padding: 7px 12px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: rgba(5, 8, 6, 0.85);
    border: 1px solid rgba(213, 228, 198, 0.16);
    border-radius: 6px;
  }
  .ab span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .strip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor-dim);
    background: rgba(213, 228, 198, 0.025);
    border-top: 1px solid rgba(213, 228, 198, 0.07);
    overflow: hidden;
  }
  .pg {
    color: var(--phosphor-dim);
    background: none;
    font-size: 11px;
    padding: 4px 2px;
  }
  .strip-label {
    width: 64px;
    text-align: center;
    color: var(--phosphor-dim);
  }
  .keys {
    display: flex;
    gap: 6px;
    margin-left: 10px;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    mask-image: linear-gradient(90deg, #000 85%, transparent);
  }
  .keys.off {
    opacity: 0.45;
  }
  .key:disabled {
    cursor: default;
  }
  .key.on {
    color: var(--signal);
    border-color: rgba(255, 106, 26, 0.45);
  }
  .details {
    display: flex;
    gap: 16px;
    margin-left: 10px;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    color: var(--phosphor);
    font-weight: 500;
    mask-image: linear-gradient(90deg, #000 88%, transparent);
  }
  .details i {
    font-style: normal;
    color: var(--phosphor-dim);
    margin-right: 6px;
    font-weight: 700;
  }
  .details .warn {
    color: #ffb3a1;
  }
  /* Quiet by default: dim glyphs, a faint outline; active = orange text */
  .key {
    flex-shrink: 0;
    min-width: 24px;
    padding: 2px 6px;
    text-align: center;
    background: transparent; /* buttons otherwise get the browser's grey */
    border: 1px solid rgba(213, 228, 198, 0.08);
    border-radius: 3px;
    color: var(--phosphor-dim);
    font-weight: 500;
    cursor: pointer;
    transition: color 0.1s ease, border-color 0.1s ease;
  }
  .key:not(:disabled):hover {
    color: var(--phosphor);
    border-color: rgba(213, 228, 198, 0.22);
  }
  .pages {
    margin-left: auto;
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }
  .pages i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #33402f;
  }
  .pages i.on {
    background: var(--phosphor);
  }
  :global(.portrait) .screen { padding: 22px 18px 26px; }
  :global(.portrait) .drawer { width: 74%; }
  :global(.portrait) .drawer-tab.open { right: 74%; }
  :global(.portrait) .status { padding: 9px 12px; font-size: 11px; }
  :global(.portrait) .wide-only { display: none; }
  :global(.portrait) .code { padding: 10px 14px 10px 0; font-size: 13px; line-height: 22px; }
  :global(.portrait) .alert { top: 44px; right: 10px; padding: 4px 8px 4px 4px; font-size: 10px; }
  :global(.portrait) .bang { width: 16px; height: 16px; font-size: 11px; }
  :global(.portrait) .ab { right: 10px; bottom: 50px; gap: 10px; padding: 6px 9px; font-size: 10px; }
  :global(.portrait) .strip { padding: 0 10px; gap: 6px; font-size: 10px; }
  :global(.portrait) .strip-label { width: 50px; }
  :global(.portrait) .keys { margin-left: 4px; gap: 4px; }
  :global(.portrait) .key { min-width: 20px; padding: 2px 4px; }
  @keyframes pulse {
    50% { box-shadow: 0 0 2px rgba(229, 50, 59, 0.3); }
  }
</style>
