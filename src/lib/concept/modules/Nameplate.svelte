<!-- NAMEPLATE: fixed hardware branding; the name sits at the right end so
     the plate reads across the whole width -->
<section class="mod bone plate" aria-label="Nameplate">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="plate-stripe" aria-hidden="true"></div>
  <div class="plate-print">
    <span>CLASSIC NOTE TAKING, REIMAGINED</span>
    <span>CUSTOMISATION WITHIN STRUCTURE</span>
  </div>
  <div class="plate-name">
    <span class="brand">ARBOREUM</span>
    <span class="sub">
      <a class="byline" href="https://junesforge.com" target="_blank" rel="noopener">by JUNESFORGE</a>
      <span class="model">JXF-ARB-16A</span>
    </span>
  </div>
</section>

<style>
  .plate { grid-area: plate; }
  .plate {
    --stripe-x: 72px; /* room for the Configure key at the left end */
    display: flex;
    align-items: center;
    gap: 36px;
    padding: 0 40px 0 calc(var(--stripe-x) + 150px);
    overflow: hidden;
  }
  .plate-name {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .brand {
    font-weight: 700;
    font-size: 44px;
    line-height: 1;
    letter-spacing: 0.06em;
    margin-right: -0.06em; /* the tracking after the last letter */
    color: #2b2d2c;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7), 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
  /* Under the name: the maker's mark, then the model number */
  .sub {
    display: flex;
    align-items: baseline;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }
  .byline {
    font-family: var(--label);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(43, 45, 44, 0.55);
    text-decoration: none;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
    transition: color 0.12s ease;
  }
  .byline:hover,
  .byline:focus-visible {
    color: var(--signal);
  }
  .model {
    font-family: var(--mono); /* model numbers are hex, set in mono */
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0.08em;
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
  .plate-stripe {
    position: absolute;
    left: var(--stripe-x);
    top: 0;
    bottom: 0;
    width: 150px;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, #2b2d2c 60% 66%, transparent 66%);
  }
  :global(.portrait) .plate { --stripe-x: 66px; padding: 0 22px 0 0; gap: 0; }
  :global(.portrait) .brand { font-size: 26px; }
  :global(.portrait) .sub { margin-top: 3px; gap: 7px; }
  :global(.portrait) .model { font-size: 12px; }
  :global(.portrait) .byline { font-size: 6.5px; letter-spacing: 0.12em; }
  :global(.portrait) .plate-print { display: none; }
  :global(.portrait) .plate-stripe { width: 80px; }
</style>
