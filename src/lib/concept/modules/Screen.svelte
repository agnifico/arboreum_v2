<script>
  import { lines, cursorLine, formatKeys } from "../sample.js";
  let { missing, drawerLabel } = $props();
</script>

<!-- SCREEN -->
<section class="mod graphite screen" aria-label="Screen module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="glass">
    <div class="status">
      <span>▣ <b>morning-pages</b></span>
      <span class="status-r"><span class="dot-unsaved">●</span> UNSAVED<span class="wide-only"> <span class="sep">│</span> 11:42 <span class="sep">│</span> 16·10</span></span>
    </div>

    <div class="code" aria-label="Note text">
      {#each lines as line, i}
        <div class="ln" class:current={i === cursorLine}>
          <span class="gutter">{i + 1}</span>
          <span class="txt">{#each line as seg}<span class={seg.c}>{seg.t}</span>{/each}{#if i === cursorLine}<span class="cursor"></span>{/if}</span>
        </div>
      {/each}
    </div>

    <!-- Missing-module alert + drawer handle -->
    <div class="alert">
      <span class="bang">!</span>
      <span>{missing}</span>
      <span class="alert-arrow">▸</span>
    </div>
    <div class="drawer-tab" aria-hidden="true">{drawerLabel}</div>

    <!-- A/B context: overlaid, always visible -->
    <div class="ab">
      <span><i class="pip a">A</i>SAVE</span>
      <span><i class="pip b">B</i>LIST</span>
      <span><i class="pip st">≡</i>START</span>
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
  .ln {
    display: flex;
  }
  .ln.current {
    background: rgba(213, 228, 198, 0.04);
  }
  .gutter {
    width: 54px;
    flex-shrink: 0;
    padding-right: 18px;
    text-align: right;
    color: #3d4b3b;
    user-select: none;
  }
  .ln.current .gutter {
    color: var(--phosphor-dim);
  }
  .txt {
    white-space: pre-wrap;
    min-width: 0;
  }
  .tk-md { color: #4f6150; }
  .tk-h { color: #f3c58a; font-weight: 700; }
  .tk-bold { color: #ffffff; font-weight: 700; }
  .tk-quote { color: #a9bb9d; font-style: italic; }
  .tk-done { color: #5f705c; text-decoration: line-through; }
  .cursor {
    display: inline-block;
    width: 9px;
    height: 18px;
    margin-left: 1px;
    vertical-align: -3px;
    background: var(--signal);
    box-shadow: 0 0 8px rgba(255, 106, 26, 0.6);
    animation: blink 1.1s steps(1) infinite;
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
  :global(.portrait) .gutter { width: 34px; padding-right: 10px; }
  :global(.portrait) .cursor { height: 15px; width: 8px; }
  :global(.portrait) .alert { top: 44px; right: 10px; padding: 4px 8px 4px 4px; font-size: 10px; }
  :global(.portrait) .bang { width: 16px; height: 16px; font-size: 11px; }
  :global(.portrait) .ab { right: 10px; bottom: 50px; gap: 10px; padding: 6px 9px; font-size: 10px; }
  :global(.portrait) .strip { padding: 0 10px; gap: 6px; font-size: 10px; }
  :global(.portrait) .strip-label { width: 50px; }
  :global(.portrait) .keys { margin-left: 4px; gap: 4px; }
  :global(.portrait) .key { min-width: 20px; padding: 2px 4px; }
  @keyframes blink {
    50% { opacity: 0; }
  }
  @keyframes pulse {
    50% { box-shadow: 0 0 2px rgba(229, 50, 59, 0.3); }
  }
</style>
