<script>
  import { useDevice, Device } from "../device.svelte.js";
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();
  const by = (keys) => keys.map((k) => Device.FORMATS.find((f) => f.key === k));
  // Inline marks on top, line kinds below.
  const ROWS = [
    by(["bold", "italic", "underline", "strike", "highlight", "code"]),
    by(["h1", "h2", "h3", "bulletList", "orderedList", "taskList", "blockquote"]),
  ];
</script>

<!-- FORMAT DECK: physical keys for the formatting; swaps with the control pad -->
<section class="mod graphite deck" class:off={!device.canFormat} aria-label="Format deck module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="deck-keys">
    {#each ROWS as row}
      <div class="deck-row">
        {#each row as f}
          <!-- A key stays down, its LED lit, while that format is under the caret -->
          <button
            class="cap cap-{f.key}"
            class:on={device.canFormat && device.active[f.key]}
            aria-label={f.key}
            aria-pressed={device.canFormat && !!device.active[f.key]}
            onmousedown={keepFocus}
            onclick={() => device.format(f.key)}
          ><i class="led"></i><span>{f.label}</span></button>
        {/each}
      </div>
    {/each}
  </div>
  <span class="etch-dark deck-label">
    <span class="model">FMT-01 · </span><button class="latch" aria-label="Swap for the control pad" onmousedown={keepFocus} onclick={() => device.swapControls()}><i>⇄</i>CONTROL PAD</button>
  </span>
</section>

<style>
  .deck {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .deck-keys {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: -14px;
  }
  .deck-row {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  /* Bone keycaps on the dark deck */
  .cap {
    position: relative;
    min-width: 40px;
    height: 34px;
    padding: 0 6px;
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 500;
    color: #2b2d2c;
    background: linear-gradient(180deg, var(--bone-hi), var(--bone) 70%);
    box-shadow: 0 4px 0 var(--bone-side), 0 6px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 #fff;
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .cap:active,
  .cap.on {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--bone-side), inset 0 1px 0 #fff;
  }
  .off .cap span {
    opacity: 0.4;
  }
  .cap-bold span { font-weight: 800; }
  .cap-italic span { font-style: italic; }
  .cap-underline span { text-decoration: underline; text-underline-offset: 2px; }
  .cap-strike span { text-decoration: line-through; }
  .cap-highlight span { padding: 0 3px; border-radius: 2px; background: rgba(255, 106, 26, 0.25); }
  .led {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #b5ac96;
  }
  .on .led {
    background: var(--signal);
    box-shadow: 0 0 5px var(--signal);
  }
  .deck-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
  }
  /* Portrait: smaller caps in wrapped rows; the label keeps only the latch */
  :global(.portrait) .deck-keys { flex-direction: row; flex-wrap: wrap; justify-content: center; width: 148px; gap: 7px 4px; margin-top: -14px; }
  :global(.portrait) .deck-row { display: contents; }
  :global(.portrait) .model { display: none; }
  :global(.portrait) .cap { min-width: 26px; height: 22px; padding: 0 3px; font-size: 10px; border-radius: 5px; box-shadow: 0 3px 0 var(--bone-side), 0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 #fff; }
  :global(.portrait) .cap:active,
  :global(.portrait) .cap.on { transform: translateY(2px); box-shadow: 0 1px 0 var(--bone-side), inset 0 1px 0 #fff; }
  :global(.portrait) .led { top: 3px; right: 3px; width: 3px; height: 3px; }
  :global(.portrait) .deck-label { font-size: 8.5px; letter-spacing: 0.12em; bottom: 10px; }
</style>
