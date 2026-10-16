<!-- CONTROL PAD: Start, B, A in one straight row -->
<section class="mod bone ctl" aria-label="Control pad">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="ctl-row">
    <!-- Start: its function is on the key, in a well like the A/B pad -->
    <div class="start-well">
      <button class="start" aria-label="Start">START</button>
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
  /* Bottom padding = top + the key's 3px drop, so the well looks even */
  .start-well {
    padding: 9px 12px 12px;
    border-radius: 22px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .start {
    display: block;
    width: 64px;
    height: 24px;
    border-radius: 12px;
    font-family: var(--label);
    font-weight: 700;
    font-size: 9px;
    letter-spacing: 0.16em;
    color: #c9cec9;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.5);
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
    padding: 10px 16px 16px;
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
  :global(.mobile) .ctl-row { gap: 14px; margin-top: -10px; }
  :global(.mobile) .start-well { padding: 7px 8px 10px; }
  :global(.mobile) .start { width: 48px; height: 20px; font-size: 7.5px; letter-spacing: 0.1em; }
  /* Wells: bottom padding = top + the key's drop (round 5px, Start 3px) */
  :global(.mobile) .ab-pad { flex-direction: column-reverse; gap: 10px; padding: 8px 8px 13px; border-radius: 34px; }
  :global(.mobile) .round { width: 44px; height: 44px; font-size: 15px; }
  :global(.mobile) .ctl-label { font-size: 8.5px; letter-spacing: 0.12em; }
</style>
