<script>
  let { slots = 11 } = $props();
</script>

<!-- SPEAKER -->
<section class="mod graphite spk" aria-label="Speaker module">
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
  :global(.mobile) .spk { flex-direction: row; align-items: center; padding: 0 22px; }
  :global(.mobile) .slots { flex: 1; height: 22px; }
  :global(.mobile) .slots i { width: 6px; }
  :global(.mobile) .spk-foot { flex-shrink: 0; }
  :global(.mobile) .spk-model { display: none; }
</style>
