<!-- NAMEPLATE: fixed hardware branding; the name sits at the right end so
     the plate reads across the whole width. Its printing is also the way to
     the pages around the device: each line opens what it says (the name and
     the first line: about; the second: the story; the model number: the
     manual, as on a real product). -->
<section class="mod bone r-plate plate" aria-label="Nameplate">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="plate-stripe" aria-hidden="true"></div>
  <div class="plate-print">
    <a href="/about">CLASSIC NOTE TAKING, REIMAGINED</a>
    <a href="/story">CUSTOMISATION WITHIN STRUCTURE</a>
  </div>
  <div class="plate-name">
    <a class="brand" href="/about" title="About Arboreum">ARBOREUM</a>
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
  .plate a {
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
  .plate-print a {
    color: inherit;
  }
  .plate-print a:hover,
  .plate-print a:focus-visible,
  .brand:hover,
  .brand:focus-visible,
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
  :global(.portrait) .plate-stripe { width: 80px; }
</style>
