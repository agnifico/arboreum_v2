<!-- CONTROL PAD: Start, B, A in one straight row -->
<section class="mod bone ctl" aria-label="Control pad">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="ctl-row">
    <div class="btn-col">
      <button class="start" aria-label="Start"></button>
      <span class="etch">START</span>
    </div>
    <div class="ab-pad">
      <div class="btn-col">
        <button class="round b" aria-label="B">B</button>
      </div>
      <div class="btn-col">
        <button class="round a" aria-label="A">A</button>
      </div>
    </div>
  </div>
  <span class="etch ctl-label">CTL-01 · ⇄ FORMAT DECK</span>
</section>

<style>
  .ctl { grid-area: ctl; }
  .ctl {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ctl-row {
    display: flex;
    align-items: center;
    gap: 36px;
    margin-top: -10px;
  }
  .btn-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
  }
  .start {
    width: 58px;
    height: 18px;
    border-radius: 9px;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .start:active {
    box-shadow: 0 1px 0 #141615;
    transform: translateY(2px);
  }
  .ab-pad {
    display: flex;
    gap: 20px;
    padding: 10px 16px;
    border-radius: 44px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .round {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    font-family: var(--label);
    font-weight: 700;
    font-size: 20px;
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .round.a {
    color: #fff3ea;
    background: radial-gradient(circle at 40% 30%, #ff9a5c, var(--signal) 55%, #e2560c);
    box-shadow: 0 5px 0 var(--signal-side), 0 8px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }
  .round.b {
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 5px 0 #121413, 0 8px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .round:active {
    transform: translateY(4px);
  }
  .round.a:active { box-shadow: 0 1px 0 var(--signal-side), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  .round.b:active { box-shadow: 0 1px 0 #121413; }
  .ctl-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
  }
  :global(.mobile) .ctl-row { gap: 12px; margin-top: -8px; }
  :global(.mobile) .start { width: 42px; height: 15px; }
  :global(.mobile) .btn-col .etch { font-size: 8.5px; }
  :global(.mobile) .ab-pad { gap: 12px; padding: 8px 10px; }
  :global(.mobile) .round { width: 48px; height: 48px; font-size: 16px; }
  :global(.mobile) .ctl-label { font-size: 8.5px; letter-spacing: 0.12em; }
</style>
