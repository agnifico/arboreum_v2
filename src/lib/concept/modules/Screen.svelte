<script>
  import { formatKeys } from "../sample.js";
  import { useDevice } from "../device.svelte.js";
  import NoteRows from "../NoteRows.svelte";
  import MonoEditor from "../MonoEditor.svelte";
  const device = useDevice();
  // Portrait has no List module, so the list takes over the screen.
  let showList = $derived(device.focus === "list" && !device.hasListModule);

  // Enter in the title moves on to the text.
  function titleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      device.editorApi?.focus();
    }
  }
  let { missing, drawerLabel } = $props();
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
        {#if device.focus === "editor"}
          <span class="title-wrap">▣ <input class="title-in" bind:value={device.draftTitle} placeholder="untitled" aria-label="Title" onkeydown={titleKey} /></span>
        {:else}
          <span>▣ <b>{device.note?.title ?? "—"}</b> <span class="mode">· PREVIEW</span></span>
        {/if}
      {/if}
      <span class="status-r" aria-live="polite">{#if device.message}<span class="msg">{device.message}</span>{:else}{#if device.dirty}<span class="dot-unsaved">●</span> UNSAVED{:else if device.focus === "editor"}<span class="dot-saved">●</span> SAVED{/if}{/if}<span class="wide-only"> <span class="sep">│</span> 11:42 <span class="sep">│</span> 16·10</span></span>
    </div>

    {#if showList}
      <div class="code list-screen"><NoteRows big /></div>
    {/if}
    <!-- The editor stays mounted (hidden under the portrait list) so it keeps its state -->
    <div class="editor-area" class:hidden={showList} aria-label="Note text">
      <MonoEditor />
    </div>

    <!-- Missing-module alert + drawer handle (about the open note, so not on the list) -->
    {#if !showList}
    <div class="alert">
      <span class="bang">!</span>
      <span>{missing}</span>
      <span class="alert-arrow">▸</span>
    </div>
    <div class="drawer-tab" aria-hidden="true">{drawerLabel}</div>
    {/if}

    <!-- A/B context: overlaid, always visible -->
    <div class="ab">
      <span><i class="pip a">A</i>{device.labels.a}</span>
      <span><i class="pip b">B</i>{device.labels.b}</span>
      <span><i class="pip st">≡</i>{device.labels.start}</span>
    </div>

    <!-- Secondary strip: paged with ◀ ▶ (format · details) -->
    <div class="strip">
      <span class="pg">◀</span>
      <span class="strip-label">FORMAT</span>
      <span class="pg">▶</span>
      <span class="keys">
        {#each formatKeys as k}<span class="key">{k}</span>{/each}
      </span>
      <span class="pages"><i class="on"></i><i></i></span>
    </div>
    {#if device.overlay?.kind === "menu"}
      <div class="overlay" role="menu" aria-label={device.overlay.title}>
        <div class="ov-title">{device.overlay.title}</div>
        {#each device.overlay.items as item, i}
          <div class="ov-item" class:sel={i === device.overlay.index} role="menuitem">
            <span class="ov-caret">{i === device.overlay.index ? "▸" : ""}</span>{item.label}
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
    font-weight: 500;
    color: var(--phosphor);
    caret-color: var(--signal);
    outline: none;
  }
  .title-in::placeholder {
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
  .alert-arrow {
    color: var(--alert);
  }
  .drawer-tab {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    padding: 12px 4px;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #ffd9d9;
    background: rgba(229, 50, 59, 0.25);
    border-left: 1px solid rgba(229, 50, 59, 0.6);
    border-radius: 4px 0 0 4px;
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
    background: rgba(213, 228, 198, 0.05);
    border-top: 1px solid rgba(213, 228, 198, 0.1);
    overflow: hidden;
  }
  .pg {
    color: var(--phosphor);
  }
  .strip-label {
    width: 64px;
    text-align: center;
    color: var(--phosphor);
  }
  .keys {
    display: flex;
    gap: 6px;
    margin-left: 10px;
    min-width: 0;
    overflow: hidden;
    mask-image: linear-gradient(90deg, #000 85%, transparent);
  }
  .key {
    flex-shrink: 0;
    min-width: 24px;
    padding: 2px 6px;
    text-align: center;
    border: 1px solid rgba(213, 228, 198, 0.18);
    border-radius: 3px;
    color: var(--phosphor);
    font-weight: 500;
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
