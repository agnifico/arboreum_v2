<script>
  // The pad ⇄ deck switch: a slide switch set into the module's right edge,
  // in the same place on both, like a handheld's side switch. Up is the
  // control pad, down the Format deck. The knob slides first, then the
  // modules swap.
  // etch: the module's printing (etch on light faces, etch-dark on dark ones).
  let { down = false, label = "", etch = "etch", onflip = () => {} } = $props();
  let flipped = $state(false);
  let at = $derived(flipped ? !down : down);
  function flip() {
    if (flipped) return;
    flipped = true;
    setTimeout(() => {
      onflip();
      flipped = false;
    }, 140);
  }
</script>

<button class="edge-switch {etch}" class:down={at} aria-label={label} onmousedown={(e) => e.preventDefault()} onclick={flip}>
  <span class="names" aria-hidden="true"><i class:on={!at}>PAD</i><i class:on={at}>FMT</i></span>
  <span class="slot" aria-hidden="true"><span class="knob"></span></span>
</button>

<style>
  .edge-switch {
    position: absolute;
    top: 18%; /* the top half, the same on both modules: the deck's long row is the bottom one */
    right: 0;
    display: flex;
    align-items: stretch;
    gap: 5px;
    height: 46px;
    padding: 0;
    background: none;
    cursor: pointer;
    touch-action: manipulation;
  }
  /* Printed beside the slot, one at each end */
  .names {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0;
  }
  .names i {
    font-family: var(--label);
    font-style: normal;
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
    color: currentColor;
    opacity: 0.45;
    transition: opacity 0.12s ease;
  }
  .names i.on {
    opacity: 1;
  }
  /* A slot cut into the edge; the knob stands a little proud of it */
  .slot {
    position: relative;
    width: 9px;
    border-radius: 5px 0 0 5px;
    background: #1b1d1c;
    box-shadow: inset 2px 2px 3px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  }
  .knob {
    position: absolute;
    top: 3px;
    right: -1px;
    width: 7px;
    height: 20px;
    border-radius: 3px 1px 1px 3px;
    background:
      repeating-linear-gradient(180deg, transparent 0 4px, rgba(0, 0, 0, 0.22) 4px 5px) 3px 5px / 6px 11px no-repeat,
      linear-gradient(90deg, var(--signal-hi), var(--signal) 55%, var(--signal-lo));
    box-shadow: 1px 0 0 var(--signal-side), 0 2px 3px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35);
    transition: top 0.12s ease;
  }
  .down .knob {
    top: calc(100% - 22px);
  }
  :global(.portrait) .edge-switch {
    height: 34px;
    gap: 4px;
  }
  :global(.portrait) .names i {
    font-size: 6.5px;
  }
  :global(.portrait) .knob {
    height: 15px;
  }
  :global(.portrait) .down .knob {
    top: calc(100% - 17px);
  }
</style>
