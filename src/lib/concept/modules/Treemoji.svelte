<script>
  import { useDevice } from "../device.svelte.js";
  import TreeGrid from "../TreeGrid.svelte";
  import { TREES, treeName } from "../trees.js";
  // tall: the bay has the whole right column (no speaker under it).
  let { tall = false } = $props();
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();

  let focused = $derived(device.focus === "bay");
  let treeMode = $derived(focused && device.bayMode === "tree");
  // The tree on show: the open note's, or the selected note's while browsing.
  let tree = $derived(device.editing ? device.draftIcon : (device.note?.tree ?? null));
  let readout = $derived(treeMode ? TREES[device.treeIndex].name.toUpperCase() : tree ? treeName(tree).toUpperCase() : "NO TREE");

  // Treemoji's chatter (the classic app's lines), a new one every few seconds.
  const LINES = ["ʕ•́ᴥ•̀ʔっ", "(ɔ◔‿◔)ɔ ♥", "(❛‿❛✿̶̥̥)", "(¬‿¬)", "clippy who?", "you got this!", "heyy cutie ;)", "ganbatte!"];
  let line = $state(LINES[0]);
  $effect(() => {
    const t = setInterval(() => (line = LINES[Math.floor(Math.random() * LINES.length)]), 6000);
    return () => clearInterval(t);
  });

  // It reacts to what just happened, for a moment.
  let reaction = $state("");
  let reactTimer;
  $effect(() => {
    const m = device.message;
    const r = m.startsWith("SAVED")
      ? "\\(^ヮ^)/ saved!"
      : m.startsWith("PLANTED")
        ? "rooted! (ᵔᴥᵔ)"
        : m.startsWith("DELETED")
          ? "(╥﹏╥) bye…"
          : TREES.some((t) => t.name.toUpperCase() === m)
            ? "ooh, new look ✿"
            : "";
    if (!r) return;
    reaction = r;
    clearTimeout(reactTimer);
    reactTimer = setTimeout(() => (reaction = ""), 2600);
  });
  $effect(() => () => clearTimeout(reactTimer));

  let asleep = $derived(!device.editing);
  // A tall screen has room for the trees under the buddy: tap one to pick it
  // (the screen shows more, as the Map viewer shows more garden).
  let stageW = $state(0);
  let stageH = $state(0);
  let roomy = $derived(!treeMode && stageH > stageW * 1.4);
  let say = $derived(reaction || (asleep ? "(－_－) zzZ" : !device.draftIcon ? "pick me a tree?" : line));
</script>

<!-- BAY: Treemoji, the tree buddy. It chooses the note's tree. -->
<section class="mod lichen trm" class:focused class:tall aria-label="Treemoji module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="map-glass trm-glass">
    <div class="stage" class:roomy bind:clientWidth={stageW} bind:clientHeight={stageH}>
      {#if treeMode}
        <div class="grid-wrap"><TreeGrid fill={!tall} /></div>
      {:else}
        <!-- Tapping the buddy opens the tree grid, as TREE does -->
        <button class="buddy" class:asleep aria-label="Choose this note's tree" onmousedown={keepFocus} onclick={() => device.enterBay("tree")}>
          <span class="bubble" aria-live="polite">{say}</span>
          <span class="sprite">
            {#if tree}<img src={tree} alt="" />{:else}<span class="none">?</span>{/if}
          </span>
          <span class="ground" aria-hidden="true"></span>
        </button>
        {#if roomy}<div class="shelf"><TreeGrid cursor={false} live={!asleep} /></div>{/if}
      {/if}
    </div>
    <div class="trm-read">{readout}</div>
    <!-- The A/B context lives here while Treemoji has the D-pad -->
    <div class="trm-ab" class:off={!focused} aria-hidden={!focused}>
      <span><i class="pip a">A</i>{focused ? device.labels.a : ""}</span>
      <span><i class="pip b">B</i>{focused ? device.labels.b : ""}</span>
    </div>
  </div>
  <div class="trm-btns">
    <button class="flip" aria-label="Previous tree" onmousedown={keepFocus} onclick={() => device.cycleTree(-1)}>◀</button>
    <div class="tb-wrap">
      <button class="trm-btn" class:on={treeMode} aria-label="Choose this note's tree" onmousedown={keepFocus} onclick={() => device.toggleBay("tree")}>▦</button>
      <span class="etch">TREE</span>
    </div>
    <button class="flip" aria-label="Next tree" onmousedown={keepFocus} onclick={() => device.cycleTree(1)}>▶</button>
  </div>
  <span class="etch trm-label">TRM-01</span>
</section>

<style>
  .trm {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 30px;
    gap: 18px;
  }
  /* The screen takes the bay's spare height; the keys sit under it */
  .trm-glass {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
  .stage {
    position: relative;
    flex: 1;
    min-height: 174px; /* the design's 12 × 9 screen */
    border-radius: 3px;
    overflow: hidden;
  }
  .stage.roomy {
    display: flex;
    flex-direction: column;
  }
  .roomy .buddy {
    flex: 1;
    min-height: 0;
    height: auto;
  }
  .shelf {
    padding: 10px;
    border-top: 1px solid rgba(213, 228, 198, 0.1);
  }
  .grid-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .buddy {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* the buddy stays together on a tall screen */
    gap: 6px;
    padding: 10px 10px 12px;
    background: radial-gradient(70% 55% at 50% 78%, rgba(213, 228, 198, 0.08), transparent 70%);
    color: inherit;
  }
  /* Speech bubble, with a tail pointing down at the tree */
  .bubble {
    position: relative;
    max-width: 92%;
    margin-bottom: 14px;
    padding: 6px 10px;
    font-size: 13px;
    line-height: 1.3;
    color: var(--phosphor);
    border: 1px solid rgba(213, 228, 198, 0.35);
    border-radius: 8px;
    background: rgba(5, 8, 6, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bubble::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -5px;
    width: 8px;
    height: 8px;
    margin-left: -4px;
    background: #0a0f0c;
    border-right: 1px solid rgba(213, 228, 198, 0.35);
    border-bottom: 1px solid rgba(213, 228, 198, 0.35);
    transform: rotate(45deg);
  }
  .sprite {
    display: grid;
    place-items: center;
    width: 42%;
    aspect-ratio: 1;
    animation: bob 1.2s steps(2) infinite; /* a two-frame idle, like a pocket pet */
  }
  .sprite img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .none {
    font-size: 28px;
    font-weight: 700;
    color: var(--phosphor-dim);
  }
  .ground {
    width: 46%;
    height: 6px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    box-shadow: 0 0 0 1px rgba(213, 228, 198, 0.06);
  }
  .asleep .sprite {
    animation: none;
    opacity: 0.55;
  }
  .asleep .bubble {
    color: var(--phosphor-dim);
  }
  @keyframes bob {
    50% { transform: translateY(-3px); }
  }
  .trm-read {
    margin-top: 8px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--phosphor-dim);
  }
  /* The A/B strip, moved here while Treemoji has the D-pad */
  .trm-ab {
    display: flex;
    gap: 14px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(213, 228, 198, 0.1);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor);
  }
  .trm-ab.off {
    visibility: hidden;
  }
  .trm-ab span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* Three keys, pocket-pet style: flip, choose, flip */
  .trm-btns {
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }
  .tb-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .trm-btn {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    font-size: 22px;
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 5px 0 #121413, 0 8px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  /* Latched while it has the D-pad: a push-on, push-off key that stays down
     (pressing it again goes all the way, then it pops back up) */
  .trm-btn.on {
    transform: translateY(3px);
    background: radial-gradient(circle at 40% 30%, #484d4a, #2a2e2c 60%, #1f2221);
    box-shadow: 0 2px 0 #121413, 0 3px 4px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.55);
  }
  .trm-btn.on:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #121413, inset 0 2px 5px rgba(0, 0, 0, 0.55);
  }
  .flip {
    width: 34px;
    height: 34px;
    margin-top: 9px;
    border-radius: 50%;
    font-size: 11px;
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 4px 0 #121413, 0 6px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .trm-btn:active,
  .flip:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #121413;
  }
  .trm-label {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
  }
  /* Tall bay: a bigger buddy */
  .tall {
    padding-inline: 16px;
  }
  .tall .sprite {
    width: 58%;
  }
  /* Portrait: a short, wide screen; the keys stack on the right */
  :global(.portrait) .trm { flex-direction: row; align-items: stretch; padding: 16px 16px 16px 18px; gap: 16px; }
  :global(.portrait) .trm-glass {
    display: grid;
    grid-template: "stage stage" minmax(0, 1fr) "read ab" 20px / 1fr auto; /* one fixed line, as the Map viewer */
    gap: 4px 12px;
    align-items: center;
  }
  :global(.portrait) .stage { grid-area: stage; align-self: stretch; min-height: 0; }
  :global(.portrait) .buddy { flex-direction: row; align-items: flex-end; justify-content: center; gap: 12px; padding: 8px 14px; }
  :global(.portrait) .bubble { margin: 0; align-self: center; }
  :global(.portrait) .bubble::after { left: auto; right: -5px; bottom: 50%; transform: rotate(-45deg); }
  :global(.portrait) .sprite { width: auto; height: 78%; }
  :global(.portrait) .ground { display: none; }
  :global(.portrait) .trm-read { grid-area: read; margin-top: 0; }
  :global(.portrait) .trm-glass:has(.trm-ab.off) .trm-read { grid-column: 1 / -1; text-align: center; }
  :global(.portrait) .trm-ab { grid-area: ab; margin-top: 0; padding-top: 0; border-top: none; }
  :global(.portrait) .trm-ab.off { display: none; }
  /* TREE on top, the flip keys side by side under it */
  :global(.portrait) .trm-btns { display: grid; grid-template-columns: auto auto; align-content: center; justify-items: center; gap: 8px 6px; }
  :global(.portrait) .tb-wrap { grid-column: 1 / -1; order: -1; }
  :global(.portrait) .tb-wrap { gap: 6px; }
  :global(.portrait) .trm-btn { width: 40px; height: 40px; border-radius: 10px; font-size: 17px; }
  :global(.portrait) .flip { width: 28px; height: 28px; margin: 0; font-size: 9px; }
  :global(.portrait) .trm-label { display: none; }
</style>
