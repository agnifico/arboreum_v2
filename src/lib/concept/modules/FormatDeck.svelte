<script>
  import { useDevice, Device } from "../device.svelte.js";
  import EdgeSwitch from "./EdgeSwitch.svelte";
  // rows: 2 (marks over line kinds), or 3 when it's narrow (portrait, beside the D-pad)
  let { rows = 2 } = $props();
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();
  const KEYS = [...Device.FORMATS, ...Device.ACTIONS];
  const by = (keys) => keys.map((k) => KEYS.find((f) => f.key === k));
  // Inline marks on top, line kinds below; undo and redo lead the rows.
  const LAYOUTS = {
    2: [
      by(["undo", "bold", "italic", "underline", "strike", "highlight", "code"]),
      by(["redo", "h1", "h2", "h3", "bulletList", "orderedList", "taskList", "blockquote"]),
    ],
    3: [
      by(["bold", "italic", "underline", "strike", "highlight"]),
      by(["undo", "code", "h1", "h2", "h3"]),
      by(["redo", "bulletList", "orderedList", "taskList", "blockquote"]),
    ],
  };
  const isAction = (f) => Device.ACTIONS.includes(f);
</script>

<!-- FORMAT DECK: physical keys for the formatting; swaps with the control pad -->
<section class="mod graphite r-deck deck" class:off={!device.canFormat} class:two={rows === 2} style:--per={Math.max(...LAYOUTS[rows].map((r) => r.length))} aria-label="Format deck module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="deck-keys">
    {#each LAYOUTS[rows] as row}
      <div class="deck-row">
        {#each row as f}
          <!-- A key stays down, its LED lit, while that format is under the caret -->
          <button
            class="cap cap-{f.key}"
            class:act={isAction(f)}
            class:on={device.canFormat && device.active[f.key]}
            disabled={isAction(f) && device.canFormat && !f.ok(device)}
            aria-label={f.key}
            aria-pressed={device.canFormat && !!device.active[f.key]}
            onmousedown={keepFocus}
            onclick={() => device.format(f.key)}
          ><i class="led"></i><span>{f.label}</span></button>
        {/each}
      </div>
    {/each}
  </div>
  <EdgeSwitch down etch="etch-dark" label="Swap for the control pad" onflip={() => device.swapControls()} />
  <span class="etch-dark deck-label">FMT-01</span>
</section>

<style>
  .deck {
    container-type: inline-size; /* caps size from the deck's own width */
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
  /* Every cap is one width, set by the longest row: as wide as it can be up
     to --cap-max, with the longest row clear of the screws at both ends */
  .deck-keys {
    --gap: 8px;
    --cap-max: 50px;
    --cap: min(var(--cap-max), (100cqw - 56px - (var(--per) - 1) * var(--gap)) / var(--per));
  }
  .deck-row {
    display: flex;
    justify-content: center;
    gap: var(--gap);
  }
  /* Bone keycaps on the dark deck */
  .cap {
    position: relative;
    flex: none;
    width: var(--cap);
    height: 38px;
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
  .off .cap span,
  .cap:disabled span {
    opacity: 0.4;
  }
  .cap:disabled {
    cursor: default;
  }
  /* Undo and redo: one-shot keys, a darker cap with no LED */
  .cap.act {
    background: linear-gradient(180deg, #d9d2bf, #c9c1ab 70%);
  }
  .cap.act .led {
    display: none;
  }
  .cap-bold span { font-weight: 800; }
  .cap-italic span { font-style: italic; }
  .cap-underline span { text-decoration: underline; text-underline-offset: 2px; }
  .cap-strike span { text-decoration: line-through; }
  .cap-highlight span { padding: 0 3px; border-radius: 2px; background: color-mix(in srgb, var(--signal) 25%, transparent); }
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
  /* Portrait: thumb-sized caps (two big rows across the width, or three
     beside the D-pad) */
  :global(.portrait) .deck-keys { gap: 7px; margin-top: -14px; }
  :global(.portrait) .deck-keys { --gap: 6px; --cap-max: 40px; }
  :global(.portrait) .two .deck-keys { gap: 10px; --cap-max: 44px; }
  :global(.portrait) .two .cap { height: 36px; font-size: 13px; }
  :global(.portrait) .cap { height: 30px; padding: 0 3px; font-size: 12px; border-radius: 5px; box-shadow: 0 3px 0 var(--bone-side), 0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 #fff; }
  :global(.portrait) .cap:active,
  :global(.portrait) .cap.on { transform: translateY(2px); box-shadow: 0 1px 0 var(--bone-side), inset 0 1px 0 #fff; }
  :global(.portrait) .led { top: 3px; right: 3px; width: 3px; height: 3px; }
  :global(.portrait) .deck-label { font-size: 8.5px; letter-spacing: 0.12em; bottom: 10px; }
</style>
