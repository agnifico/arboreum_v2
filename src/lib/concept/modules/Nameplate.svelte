<!-- NAMEPLATE: fixed hardware branding -->
<section class="mod bone plate" aria-label="Nameplate">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="plate-name">
    <span class="brand">ARBOREUM</span>
    <span class="model">1610F</span>
  </div>
  <div class="plate-print">
    <span>MODULAR NOTE SYSTEM</span>
    <span>MODEL 0x1610F</span>
    <span class="marks"><i>◇</i><i>⌂</i><i>◎</i></span>
  </div>
  <div class="plate-stripe" aria-hidden="true"></div>
</section>

<style>
  .plate { grid-area: plate; }
  .plate {
    display: flex;
    align-items: center;
    gap: 36px;
    padding: 0 40px 0 44px;
    overflow: hidden;
  }
  .plate-name {
    display: flex;
    align-items: baseline;
    gap: 14px;
  }
  .brand {
    font-weight: 700;
    font-size: 44px;
    letter-spacing: 0.06em;
    color: #2b2d2c;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7), 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
  .model {
    font-family: var(--mono); /* model numbers are hex, set in mono */
    font-weight: 700;
    font-size: 26px;
    letter-spacing: 0.04em;
    color: var(--signal);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  .plate-print {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(43, 45, 44, 0.6);
    border-left: 1.5px solid rgba(43, 45, 44, 0.25);
    padding-left: 16px;
  }
  .marks {
    display: flex;
    gap: 8px;
  }
  .marks i {
    font-style: normal;
  }
  .plate-stripe {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 150px;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, #2b2d2c 60% 66%, transparent 66%);
  }
  :global(.mobile) .plate { padding: 0 22px 0 28px; gap: 0; }
  :global(.mobile) .brand { font-size: 26px; }
  :global(.mobile) .model { font-size: 17px; }
  :global(.mobile) .plate-name { gap: 8px; }
  :global(.mobile) .plate-print { display: none; }
  :global(.mobile) .plate-stripe { width: 80px; }
</style>
