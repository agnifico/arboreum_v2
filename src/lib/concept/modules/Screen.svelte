<script>
  import { onMount } from "svelte";
  import { useDevice, Device, ago } from "../device.svelte.js";
  import { treeName, TREES } from "../trees.js";
  import GardenMap from "../GardenMap.svelte";
  import TreeGrid from "../TreeGrid.svelte";
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

  // With the Format deck slotted, the strip's format page steps aside.
  let pages = $derived(device.stripPages);
  let stripPage = $derived(pages.includes(device.stripPage) ? device.stripPage : pages[0]);
  // One overflow rule for strips: the content scrolls sideways, and an edge
  // fades only while there's more past it.
  function lane(node) {
    const update = () => {
      node.classList.toggle("more-l", node.scrollLeft > 1);
      node.classList.toggle("more-r", node.scrollLeft + node.clientWidth < node.scrollWidth - 1);
    };
    const ro = new ResizeObserver(update);
    ro.observe(node);
    for (const child of node.children) ro.observe(child); // details change width as they update
    node.addEventListener("scroll", update, { passive: true });
    // With a mouse: the wheel scrolls it sideways, and a key that's partly
    // hidden under the fade slides fully into view when it's used.
    const wheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || node.scrollWidth <= node.clientWidth) return;
      e.preventDefault();
      node.scrollLeft += e.deltaY;
    };
    const reveal = (e) => {
      const key = e.target.closest?.("button");
      if (!key) return;
      const l = key.offsetLeft - node.offsetLeft;
      if (l < node.scrollLeft) node.scrollTo({ left: l - 24, behavior: "smooth" });
      else if (l + key.offsetWidth > node.scrollLeft + node.clientWidth) node.scrollTo({ left: l + key.offsetWidth - node.clientWidth + 24, behavior: "smooth" });
    };
    node.addEventListener("wheel", wheel, { passive: false });
    node.addEventListener("click", reveal);
    return {
      destroy() {
        ro.disconnect();
        node.removeEventListener("scroll", update);
        node.removeEventListener("wheel", wheel);
        node.removeEventListener("click", reveal);
      },
    };
  }

  function page(step) {
    const i = pages.indexOf(stripPage);
    device.stripPage = pages[(i + step + pages.length) % pages.length];
  }

  // Enter in the title moves on to the text.
  function titleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      device.editorApi?.focus();
    }
  }
  // The red "!" and the drawer only concern an open note.
  // The alert covers only what a slotted module resolves; the drawer's handle
  // carries the "!" for its own jobs.
  let alertText = $derived(device.missing.filter((m) => !device.drawerSections.includes(m)).map((m) => (m === "tree" ? "NO TREE" : "NO PLOT")).join(" · "));
  let drawerLabel = $derived(device.drawerSections.map((x) => x.toUpperCase()).join(" · "));
  let drawerWarn = $derived(device.missing.some((m) => device.drawerSections.includes(m)));
  let drawerOpen = $derived(device.focus === "drawer");
  const pad2s = (n) => String(n).padStart(2, "0");
</script>

<!-- SCREEN -->
<section class="mod graphite r-scr screen" class:focused={device.focus === "editor"} aria-label="Screen module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="glass" class:writing={device.editing && !showList} class:browsing={!device.editing || showList}>
    <div class="status">
      {#if showList}
        {#if device.picking}
          <span>▣ <b>SELECT</b> <span class="mode">· {device.pickedNotes.length} OF {device.notes.length}</span></span>
        {:else}
          <span>▣ <b>NOTES</b> <span class="mode">· {device.notes.length}</span></span>
        {/if}
      {:else}
        {#if device.editing}
          <span class="title-wrap">▣ <input class="title-in" bind:value={device.draftTitle} placeholder="untitled" aria-label="Title" onkeydown={titleKey} /></span>
        {:else}
          <span>▣ <b>{device.note?.title ?? "—"}</b> <span class="mode">· PREVIEW</span></span>
        {/if}
      {/if}
      <div class="status-end">
        <!-- Missing modules: the red "!" sits on whatever resolves it. The
             drawer's handle carries it for the jobs the drawer stands in for
             (laid out like the missing module); this alert points at the bay
             for the jobs a slotted module does. -->
        <!-- Picking on the full-screen list: the delete is on the screen too, for
             touch without a Start key (the List module has its own slider) -->
        {#if showList && device.picking && device.pickedNotes.length}
          <button class="alert pick-del" onclick={() => device.askDeletePicked()}>DELETE {device.pickedNotes.length}</button>
        {/if}
        {#if device.editing && !showList}
          {#if alertText && !drawerOpen}
            <button class="alert" onclick={() => device.resolveMissing()} aria-label="Missing: {alertText}">
              <span class="bang">!</span>
              <span class="alert-text">{alertText}</span>
              <span class="alert-arrow">▸</span>
            </button>
          {/if}
          {#if device.drawerSections.length}
            <button
              class="drawer-tab"
              class:warn={drawerWarn}
              class:open={drawerOpen}
              aria-expanded={drawerOpen}
              aria-label="{drawerLabel}{device.drawerSections.includes('tree') ? `: ${device.draftIcon ? treeName(device.draftIcon) : 'no tree yet'}` : ''}{drawerWarn ? ' (missing)' : ''}"
              onclick={() => (drawerOpen ? device.closeDrawer() : device.openDrawer())}
            >
              {#if drawerWarn}<span class="bang">!</span>{/if}
              {#each device.drawerSections as sec}
                {#if sec === "tree"}
                  {#if device.draftIcon}<img class="tab-tree" src={device.draftIcon} alt="" />{:else}<span class="tab-none">?</span>{/if}
                {:else}<span class="tab-text">{sec.toUpperCase()}</span>{/if}
              {/each}
              <span class="tab-arrow">{drawerOpen ? "▸" : "◂"}</span>
            </button>
          {/if}
        {/if}
        <span class="status-r" aria-live="polite">{#if device.message}<span class="msg">{device.message}</span>{:else}{#if device.dirty}<span class="dot-unsaved">●</span> UNSAVED{:else if device.isNew}<span class="dot-new">●</span> NEW{:else if device.editing}<span class="dot-saved">●</span> SAVED{/if}{/if}<span class="wide-only"> <span class="sep">│</span> {clock} <span class="sep">│</span> {date}</span></span>
      </div>
    </div>

    {#if showList}
      <div class="code list-screen"><NoteRows big /></div>
    {/if}
    <!-- The editor stays mounted (hidden under the portrait list) so it keeps its state -->
    <div class="editor-area" class:hidden={showList} aria-label="Note text">
      <MonoEditor />
    </div>

    <!-- The drawer stands in for the modules that aren't slotted, laid out
         like them; it slides out from the right, under its handle -->
    {#if device.editing && !showList}
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
              <TreeGrid />
              <div class="dr-caption">{TREES[device.treeIndex].name.toUpperCase()}</div>
            </div>
          {:else}
            {@const at = device.atCursor}
            <div class="dr-module">
              <div class="dr-head"><span>MAP-01</span><span class="dr-virtual">VIRTUAL</span></div>
              <GardenMap cursor={device.cursor} plots={device.plots} rows={7} onpick={(t) => (device.cursor = t)} onaccept={() => device.plant()} acceptable={!at || at.mine} onopen={(p) => device.openNote(p.noteid)} />
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
    <!-- (while the Map viewer has the D-pad, its own screen shows this) -->
    <div class="ab" class:away={device.focus === "bay"}>
      <span><i class="pip a">A</i>{device.labels.a}</span>
      <span><i class="pip b">B</i>{device.labels.b}</span>
      <span><i class="pip st">SRT</i>{device.labels.start}</span>
    </div>

    <!-- Secondary strip: paged with ◀ ▶ (format · details) -->
    <div class="strip">
      {#if stripPage === "format"}
        {#snippet act(f)}
          <button
            class="key act"
            disabled={!device.canAct(f)}
            aria-label={f.key}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => device.format(f.key)}>{typeof f.label === "function" ? f.label(device) : f.label}</button>
        {/snippet}
        <span class="keys lane" class:off={!device.canFormat} use:lane>
          {#each Device.ACTIONS.slice(0, 2) as f}{@render act(f)}{/each}
          <i class="gap"></i>
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
          <i class="gap"></i>
          {#each Device.ACTIONS.slice(2) as f}{#if f.key !== "edge" || f.ok(device)}{@render act(f)}{/if}{/each}
        </span>
      {:else}
        {@const d = device.details}
        <span class="details lane" use:lane>
          <span><i>WORDS</i>{d.words}</span>
          <span><i>MADE</i>{fmtDate(d.made)}</span>
          <span><i>SAVED</i>{d.saved ? ago(d.saved) : "—"}</span>
          <span class:warn={d.status === "UNSAVED"}><i>STATUS</i>{d.status}</span>
          <span><i>TREE</i>{d.tree ? treeName(d.tree) : "NONE"}</span>
          <span class:warn={!d.plot}><i>PLOT</i>{d.plot ? d.plot.map(pad2).join(",") : "NONE"}</span>
        </span>
      {/if}
      <!-- The page switcher sits at the right, so the strip starts with its keys -->
      <span class="pager">
        <button class="pg" class:gone={pages.length < 2} aria-label="Previous strip page" onclick={() => page(-1)}>◀</button>
        <span class="strip-label">{stripPage === "format" ? "FORMAT" : "DETAILS"}</span>
        <button class="pg" class:gone={pages.length < 2} aria-label="Next strip page" onclick={() => page(1)}>▶</button>
        <span class="pages">{#each pages as p}<i class:on={stripPage === p}></i>{/each}</span>
      </span>
    </div>
    {#if device.overlay?.kind === "menu"}
      <div class="overlay" role="menu" aria-label={device.overlay.title}>
        <div class="ov-title"><span>{device.overlay.title}</span>{#if device.overlay.hint}<span class="ov-hint">{device.overlay.hint}</span>{/if}</div>
        {#each device.overlay.items as item, i}
          <!-- Screen content is clickable: a click chooses, hovering with a mouse moves the caret -->
          <button
            class="ov-item"
            class:sel={i === device.overlay.index}
            role="menuitem"
            onmousedown={(e) => e.preventDefault()}
            onpointermove={(e) => e.pointerType === "mouse" && (device.overlay.index = i)}
            onclick={() => device.chooseMenuItem(i)}
          >
            <span class="ov-caret">{i === device.overlay.index ? "▸" : ""}</span>{typeof item.label === "function" ? item.label() : item.label}
            {#if item.choices}
              <!-- Choices side by side: the picked one is boxed; a click runs it -->
              <span class="ov-choices">
                {#each item.choices as c, j}
                  <span
                    class="ov-choice"
                    class:pick={j === item.pick}
                    role="menuitem"
                    tabindex="-1"
                    onclick={(e) => (e.stopPropagation(), device.chooseMenuItem(i, j))}
                    onkeydown={() => {}}>{c.label}</span>
                {/each}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    {:else if device.overlay?.kind === "confirm" && device.overlay.where !== "list"}
      <!-- The box's choices are clickable too (the mouse's way; A, B and
           Start still answer). A List module's confirm is drawn there. -->
      <div class="overlay confirm" role="alertdialog" aria-label={device.overlay.title}>
        <div class="ov-title">{device.overlay.title}</div>
        <p class="ov-text">{#if device.overlay.icon}<img class="ov-icon" src={device.overlay.icon} alt="" />{/if}{device.overlay.text}</p>
        <div class="ov-keys">
          <button class="ov-key" onmousedown={(e) => e.preventDefault()} onclick={() => device.press("a")}><i class="pip a">A</i>{device.overlay.yes}</button>
          <button class="ov-key" onmousedown={(e) => e.preventDefault()} onclick={() => device.press("b")}><i class="pip b">B</i>{device.overlay.no}</button>
          {#if device.overlay.alt}<button class="ov-key" onmousedown={(e) => e.preventDefault()} onclick={() => device.press("start")}><i class="pip st">SRT</i>{device.overlay.alt.label}</button>{/if}
        </div>
      </div>
    {/if}
    <div class="glare" aria-hidden="true"></div>
  </div>
  <span class="etch-dark screen-label">SCR-01 · MONO</span>
</section>

<style>
  .screen { grid-area: scr; min-height: 0; }
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
  /* Where you are, at a glance: writing a note is a warm moss glass, browsing
     (the list, or a note in preview) a cool slate one */
  .glass.writing {
    background: radial-gradient(120% 90% at 30% 20%, #1a2113, #0d110a 70%);
  }
  .glass.browsing {
    background: radial-gradient(120% 90% at 30% 20%, #10191e, #080d10 70%);
  }
  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 18px;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--phosphor-dim);
    border-bottom: 1px solid rgba(213, 228, 198, 0.08);
  }
  .status-end {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    white-space: nowrap;
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
    width: 100%;
    padding: 6px 18px;
    background: none;
    text-align: left;
    color: #a9bb9d;
  }
  .ov-item.sel {
    color: #fff;
    background: color-mix(in srgb, var(--signal) 14%, transparent);
  }
  .ov-caret {
    width: 10px;
    color: var(--signal);
  }
  .ov-choices {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  .ov-choice {
    padding: 0 6px;
    border-radius: 3px;
    color: var(--phosphor-dim);
    box-shadow: inset 0 0 0 1px rgba(213, 228, 198, 0.14);
  }
  /* The picked choice: boxed in the accent while its row is selected */
  .ov-choice.pick {
    color: inherit;
  }
  .ov-item.sel .ov-choice.pick {
    color: var(--signal);
    box-shadow: inset 0 0 0 1px var(--signal);
  }
  @media (hover: hover) {
    .ov-choice:hover {
      color: #fff;
      box-shadow: inset 0 0 0 1px var(--phosphor);
    }
  }
  .confirm .ov-title {
    color: #ff9ea3;
  }
  .ov-text {
    margin: 4px 18px 12px;
    line-height: 1.5;
    color: var(--phosphor);
  }
  .ov-icon {
    float: left;
    width: 28px;
    height: 28px;
    margin: 0 10px 0 0;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .ov-keys {
    display: flex;
    gap: 16px;
    padding: 0 18px;
    font-size: 11px;
    font-weight: 700;
  }
  .ov-key {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 -6px;
    padding: 4px 6px;
    border-radius: 4px;
    color: inherit;
    background: none;
    letter-spacing: inherit;
  }
  @media (hover: hover) {
    .ov-key:hover {
      color: #fff;
      box-shadow: inset 0 0 0 1px var(--phosphor);
    }
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
  /* Chips in the status line: kept short so the bar doesn't grow */
  .alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: -4px 0;
    padding: 2px 8px 2px 2px;
    font-size: 10.5px;
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
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: var(--alert);
    color: #fff;
    font-family: var(--label);
    font-weight: 700;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(229, 50, 59, 0.6);
    animation: pulse 1.6s ease-in-out infinite;
  }
  .alert {
    font-family: inherit;
    cursor: pointer;
  }
  .pick-del {
    padding-left: 8px;
  }
  .alert-arrow {
    color: var(--alert);
  }
  /* The drawer's handle: a chip at the right of the status line, over the
     edge the drawer slides out from */
  .drawer-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: -4px 0;
    padding: 2px 6px;
    font-family: inherit;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--phosphor);
    background: #223026;
    border: 1px solid rgba(213, 228, 198, 0.45);
    border-radius: 4px;
    cursor: pointer;
  }
  .tab-arrow {
    font-size: 9px;
    color: var(--phosphor-dim);
  }
  .tab-tree {
    width: 16px;
    height: 16px;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .tab-none {
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
    background: #4a1f22;
    border-color: rgba(229, 50, 59, 0.75);
  }
  .drawer-tab.open {
    color: #10130f;
    background: var(--phosphor);
    border-color: var(--phosphor);
  }
  .drawer-tab.open .tab-arrow {
    color: inherit;
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
  .ab.away {
    display: none;
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
  .pg.gone {
    visibility: hidden; /* keeps the label where it was */
  }
  .strip-label {
    width: 64px;
    text-align: center;
    color: var(--phosphor-dim);
  }
  .lane {
    flex: 0 1 auto;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    --fade: 24px;
  }
  .lane::-webkit-scrollbar { display: none; }
  .lane:global(.more-r) { mask-image: linear-gradient(90deg, #000 calc(100% - var(--fade)), transparent); }
  .lane:global(.more-l) { mask-image: linear-gradient(90deg, transparent, #000 var(--fade)); }
  .lane:global(.more-l.more-r) { mask-image: linear-gradient(90deg, transparent, #000 var(--fade), #000 calc(100% - var(--fade)), transparent); }
  .keys {
    display: flex;
    gap: 6px;
  }
  /* A small break between groups: undo/redo, formats, then the rest */
  .keys .gap {
    flex: none;
    width: 1px;
    margin: 6px 3px;
    background: rgba(213, 228, 198, 0.12);
  }
  /* Dimmed key by key: IMG stays live on a picked image (it replaces it) */
  .keys.off .key:disabled,
  .keys.off .gap {
    opacity: 0.45;
  }
  .key:disabled {
    cursor: default;
  }
  .key.act:disabled {
    opacity: 0.35;
  }
  .key.on {
    color: var(--signal);
    border-color: color-mix(in srgb, var(--signal) 45%, transparent);
  }
  .details {
    display: flex;
    gap: 16px;
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
  /* Hover only where there's a real pointer: on touch it sticks after a tap */
  @media (hover: hover) {
    .key:not(:disabled):hover {
      color: var(--phosphor);
      border-color: rgba(213, 228, 198, 0.22);
    }
  }
  .pager {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pages {
    margin-left: 4px;
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
  :global(.portrait) .status { padding: 9px 12px; font-size: 11px; }
  :global(.portrait) .wide-only { display: none; }
  :global(.portrait) .code { padding: 10px 14px 10px 0; font-size: 13px; line-height: 22px; }
  :global(.portrait) .status-end { gap: 6px; }
  :global(.portrait) .alert-text { display: none; } /* the "!" and its arrow say enough; the name is in its label */
  :global(.portrait) .alert { padding-right: 6px; }
  :global(.portrait) .ab { right: 10px; bottom: 50px; gap: 10px; padding: 6px 9px; font-size: 10px; }
  :global(.portrait) .strip { padding: 0 10px; gap: 6px; font-size: 10px; }
  :global(.portrait) .strip-label { width: 50px; }
  :global(.portrait) .keys { gap: 4px; }
  :global(.portrait) .key { min-width: 20px; padding: 2px 4px; }
  @keyframes pulse {
    50% { box-shadow: 0 0 2px rgba(229, 50, 59, 0.3); }
  }
</style>
