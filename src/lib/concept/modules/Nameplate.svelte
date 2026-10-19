<!-- NAMEPLATE: fixed hardware branding; the name sits at the right end so
     the plate reads across the whole width. The pages around the device are
     two keys in a well past the stripes (ABOUT, with the story, and HELP); the printing
     is just printing, except the model number, which also opens the manual,
     as on a real product, and the maker's mark. -->
<section class="mod bone r-plate plate" aria-label="Nameplate">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="plate-stripe" aria-hidden="true"></div>
  <!-- Pill keys in a recessed well, like the Configure key and Select/Start -->
  <nav class="page-keys" aria-label="Pages">
    <a class="page-key" href="/about">ABOUT</a>
    <a class="page-key" href="/help">HELP</a>
  </nav>
  <div class="plate-print">
    <span>CLASSIC NOTE TAKING, REIMAGINED</span>
    <span>CUSTOMISATION WITHIN STRUCTURE</span>
  </div>
  <div class="plate-name">
    <span class="brand">ARBOREUM</span>
    <span class="sub">
      <a class="byline" href="https://junesforge.com" target="_blank" rel="noopener">by JUNESFORGE</a>
      <a class="model" href="/help" title="The manual">JXF26-ARB-16A</a>
    </span>
  </div>
</section>

<style>
  .plate { grid-area: plate; }
  .plate {
    --stripe-x: 72px; /* room for the Configure key at the left end */
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 0 40px 0 calc(var(--stripe-x) + 150px);
    overflow: hidden;
  }
  .plate-name {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .plate-name a {
    text-decoration: none;
    transition: color 0.12s ease;
  }
  .brand {
    font-weight: 700;
    font-size: 44px;
    line-height: 1;
    letter-spacing: 0.06em;
    margin-right: -0.06em; /* the tracking after the last letter */
    color: var(--ink-hard);
    text-shadow: var(--ink-sh);
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
    color: var(--ink);
    text-decoration: none;
    text-shadow: var(--ink-sh);
    transition: color 0.12s ease;
  }
  .byline:hover,
  .byline:focus-visible {
    color: var(--signal-text);
  }
  /* The model number is already in the accent: it underlines instead */
  .model:hover,
  .model:focus-visible {
    text-decoration: underline 1.5px;
    text-underline-offset: 3px;
  }
  .model {
    font-family: var(--mono); /* model numbers are hex, set in mono */
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0.08em;
    color: var(--signal-text);
    text-shadow: var(--ink-sh);
  }
  .plate-print {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--ink);
    border-left: 1.5px solid color-mix(in srgb, var(--ink-hard) 25%, transparent);
    padding-left: 16px;
  }
  /* The well and its keys: the Configure key's build, so the left end reads as
     one bank of keys either side of the stripes. Keys look the same in every
     theme; the well takes the plate's colour. Bottom padding = top + the
     keys' 3px drop. */
  .page-keys {
    flex: none;
    display: flex;
    gap: 6px;
    padding: 6px 7px 9px;
    border-radius: 18px;
    background: color-mix(in oklab, var(--face), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .page-key {
    display: grid;
    place-items: center;
    height: 22px;
    padding: 0 11px;
    border-radius: 11px;
    font-family: var(--label);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #c9cec9;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease, color 0.12s ease;
  }
  .page-key:hover,
  .page-key:focus-visible {
    color: var(--signal-hi);
  }
  .page-key:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #141615, inset 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  .plate-stripe {
    position: absolute;
    left: var(--stripe-x);
    top: 0;
    bottom: 0;
    width: 150px;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, var(--ink-hard) 60% 66%, transparent 66%);
  }
  :global(.portrait) .plate { --stripe-x: 66px; padding: 0 22px 0 0; gap: 0; }
  :global(.portrait) .brand { font-size: 26px; }
  :global(.portrait) .sub { margin-top: 3px; gap: 7px; }
  :global(.portrait) .model { font-size: 12px; }
  :global(.portrait) .byline { font-size: 6.5px; letter-spacing: 0.12em; }
  :global(.portrait) .plate-print { display: none; }
  :global(.portrait) .page-keys { display: none; }
  :global(.portrait) .plate-stripe { width: 80px; }
</style>
