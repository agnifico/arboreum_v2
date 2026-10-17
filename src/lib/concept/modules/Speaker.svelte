<script>
  let { slots = 11 } = $props();
</script>

<!-- SPEAKER -->
<section class="mod graphite r-spk spk" aria-label="Speaker module">
  <span class="screw s-tl"></span><span class="screw s-br"></span>
  <div class="slots" aria-hidden="true">{#each Array(slots) as _}<i></i>{/each}</div>
  <div class="spk-foot">
    <span class="pwr"></span>
    <span class="etch-dark">PWR</span>
    <span class="etch-dark spk-model">SPK-01</span>
  </div>
</section>

<style>
  .spk { grid-area: spk; }
  .spk {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 0 26px;
  }
  .slots {
    display: flex;
    justify-content: space-between;
    height: 92px;
  }
  .slots i {
    width: 9px;
    border-radius: 5px;
    background: linear-gradient(90deg, #0b0c0b, #171918);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 2px 3px rgba(0, 0, 0, 0.8);
  }
  .spk-foot {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pwr {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 8px var(--signal);
  }
  .spk-model {
    margin-left: auto;
  }
  /* Mobile: a thin vertical strip; the grille runs its full height */
  :global(.portrait) .spk { flex: 1; width: 22px; border-radius: 11px; flex-direction: column; align-items: center; padding: 22px 0 12px; gap: 10px; }
  :global(.portrait) .spk .screw { display: none; }
  :global(.portrait) .slots {
    flex: 1;
    width: 10px;
    height: auto;
    border-radius: 5px;
    background: repeating-linear-gradient(180deg, #0b0c0b 0 4px, transparent 4px 8px);
    box-shadow: none;
  }
  :global(.portrait) .slots i { display: none; }
  :global(.portrait) .spk-foot { flex-direction: column; }
  :global(.portrait) .spk-foot .etch-dark { display: none; }
</style>
