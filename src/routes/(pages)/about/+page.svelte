<script>
  // About and the story, in one carousel: the cover, what the app is (and
  // where your notes live), then the story one chapter per slide, ending on
  // the modules and the details. Each slide is laid out as panels (text,
  // renders, screenshots, and a few made-for-the-page pieces: the model
  // number decoded, the trees on a little screen, the SKU matrix).
  import Carousel from "$lib/pages/Carousel.svelte";
  import Panel from "$lib/pages/Panel.svelte";
  import Shot from "$lib/pages/Shot.svelte";
  import Slide from "$lib/pages/Slide.svelte";

  const TITLES = [
    "CUSTOMISATION WITHIN STRUCTURE",
    "ABOUT ARBOREUM",
    "NO NOTES APP WAS EVER QUITE RIGHT",
    "A LIGHT LAYER OF PLAY",
    "THE FIRST ARBOREUM",
    "WHY HARDWARE",
    "WHAT IT'S MEANT TO SHOW",
    "THREE RULES UNDERNEATH",
    "STRUCTURE, THEN FREEDOM",
    "THE MODULES",
    "THE DETAILS",
  ];

  const ART = "/concept-art/";
  const CLASSIC = {
    home: ART + "classic-home.png",
    editor: ART + "classic-editor.png",
    map: ART + "classic-map.png",
  };
  const SKETCH = ART + "first-sketch.jpeg";

  const TREES = ["Tree2", "Flower_tree2", "Autumn_tree2", "Moss_tree2", "Palm_tree1_2", "Snow_tree2", "Christmas_tree2", "Palm_tree2_2"];

  // The SKU matrix: left/right-handed × small/big × four colours
  const COLOURS = ["#e6e0d0", "#6d8756", "#2d302f", "#2a9d8f"];
  const SKUS = ["L", "R"].flatMap((hand) => ["S", "B"].flatMap((size) => COLOURS.map((c) => ({ hand, size, c }))));
</script>

<svelte:head>
  <title>About · Arboreum</title>
</svelte:head>

<Carousel titles={TITLES}>
  <!-- 00 · Cover -->
  <!-- The render's row takes the spare height; the ID plate keeps its own -->
  <Slide label="1 of 11: Customisation within structure" rows="minmax(0, 1fr) auto">
    <Panel span={5} rows={2} label="STY-00">
      <span class="stripes" aria-hidden="true"></span>
      <p class="kicker">ABOUT · THE APP AND ITS STORY</p>
      <h1>Customisation within structure.</h1>
      <p class="lead">
        The JXF26-ARB-16A is a conceptual design project: the specialised handheld electronics of the past, meeting modern web
        design. It asks what a notes app would feel like if it were an object you could pick up, with keys that click and
        modules that slot in.
      </p>
      <p class="hint">◀ ▶ or swipe through the chapters</p>
    </Panel>
    <Shot span={7} src="{ART}MiaZM.jpg" ratio="1920 / 1024" loading="eager" caption="RENDER · THE CONSOLE IN CLASSIC COLOURS"
      alt="A render of the console: camera and nameplate on top, the list, screen and map viewer across the middle, the D-pad, control pad and speaker below." />
    <!-- The model number, read out like a spec plate -->
    <Panel span={7} label="ID-PLATE">
      <p class="mini">THE MODEL NUMBER IS A DATE</p>
      <div class="decode" aria-label="JXF26-ARB-16A: JunesForge, 2026; Arboreum; the 16th of October (A is 10 in hexadecimal)">
        <span class="seg"><b>JXF</b><small>JUNESFORGE</small></span>
        <span class="seg"><b>26</b><small>2026</small></span>
        <span class="dash">-</span>
        <span class="seg"><b>ARB</b><small>ARBOREUM</small></span>
        <span class="dash">-</span>
        <span class="seg"><b>16</b><small>DAY 16</small></span>
        <span class="seg"><b>A</b><small>MONTH 0xA = 10</small></span>
      </div>
      <p class="small">JunesForge, 2026. Arboreum, the 16th of October: the month is in hexadecimal, so October, the tenth, is A.</p>
    </Panel>
  </Slide>

  <!-- About: what it is and where your notes live; the story starts to the right -->
  <Slide label="2 of 11: About Arboreum">
    <Panel span={5} label="ABT-01">
      <p class="kicker">ABOUT · THE APP</p>
      <h2 class="title">A notes app, built like a retro handheld.</h2>
      <p class="lead">
        Arboreum is a note-taking app designed as a piece of retro consumer electronics. Its console, the <i>JXF26-ARB-16A</i>,
        is a set of swappable modules around a screen for writing, and every note you save grows into a pixel tree on a little
        map.
      </p>
    </Panel>
    <Panel span={4} label="MEM-01">
      <h3>Your notes stay with you</h3>
      <p>
        There is no account and no server. Notes are kept in this browser, and images in the browser's private file storage.
        That also means they live on this device only: a different browser or another computer starts empty.
      </p>
      <p class="now">
        <i class="led"></i>Back up now and then: press <kbd>START</kbd>, then <strong>BACKUP → SAVE</strong>. <strong>LOAD</strong> brings a
        backup back. Images aren't in backups yet.
      </p>
    </Panel>
    <Panel span={3} tone="graphite" label="ABT-02 · WRITE">
      <h3>Writing is plain and calm</h3>
      <p>A monospace editor with line numbers. Bold, headings, lists, tasks, quotes and code all stay on the grid.</p>
    </Panel>
    <Panel span={3} tone="moss" label="ABT-03 · GROW">
      <h3>Every note is a tree</h3>
      <p>Pick a pixel tree for it and plant it on the garden map. Tap a tree to open its note.</p>
    </Panel>
    <Panel span={3} tone="alu" label="ABT-04 · PRESS">
      <h3>The interface is hardware</h3>
      <p>Every module is a real control, and you can still click, tap and type as in any app.</p>
    </Panel>
    <!-- Points on into the story: the next slide (or the next section, stacked).
         Last, so phones read it last; wider windows pin it to the right column -->
    <Panel span={3} rows={2} tone="signal" label="STY-01 ▸">
      <p class="mini">THE STORY · 01–09</p>
      <p class="big">Why a notes app looks like hardware, and the rules underneath.</p>
      <button class="key light onward" data-next>READ THE STORY <span class="arrow" aria-hidden="true">▶</span></button>
    </Panel>
  </Slide>

  <!-- 01 -->
  <Slide label="3 of 11: No notes app was ever quite right">
    <Panel span={7} label="STY-01">
      <header class="ch"><span class="no">01</span><h2>No notes app was ever quite right</h2></header>
      <p>
        I started Arboreum a couple of years ago, while I was learning web development: Svelte, reactive components, all of it.
        Frontier LLMs existed, but most people couldn't really use them yet. Only a few people in software knew how to get a
        website out of one, and the sites AI made back then looked very different from the ones it makes today. So I learned
        the long way, on a small notepad app.
      </p>
    </Panel>
    <Panel span={5} tone="signal" label="PET PEEVE">
      <p class="big">I chose a notepad because of a long-standing pet peeve: no notes app has ever been perfect.</p>
    </Panel>
    <Panel span={4} tone="alu" label="REF-01">
      <h3>Apple Notes</h3>
      <p>
        Notes has a rich set of styling and formatting features, but the interface is disjointed. The interface is unappealing, and it's very Apple-coded: you have to know Apple's way
        of doing things to get the best out of it, and fair amount of it is locked behind an Apple Pencil. So many hidden 'tips and tricks' that learning to use it with fluency feels like a grind.
      </p>
    </Panel>
    <Panel span={4} tone="alu" label="REF-02">
      <h3>Google Keep</h3>
      <p>
        Closer to my style. It's quick, simple and nice, and great for a fast note. But the moment you want to draw something, or
        do a little more, it feels tight.
      </p>
    </Panel>
    <Panel span={4} tone="alu" label="REF-03">
      <h3>Sublime Text</h3>
      <p>What I like on the desktop. I'm used to monospace, and evenly spaced text just makes sense to me.</p>
    </Panel>
    <!-- The question, typed on a screen -->
    <Panel span={12} tone="graphite" label="SCR-01 · MONO" flush>
      <div class="glass type">
        <p><span class="ln">1</span>So the question was: what if one app had the best of each?</p>
        <p><span class="ln">2</span>The quickness of <em>Keep</em>, the monospace of <em>Sublime</em>, and the colour that <em>Apple Notes</em> does better.<i class="caret"></i></p>
      </div>
    </Panel>
  </Slide>

  <!-- 02 -->
  <Slide label="4 of 11: A light layer of play">
    <Panel span={7} label="STY-02">
      <header class="ch"><span class="no">02</span><h2>A light layer of play</h2></header>
      <p>I also wanted it to be a little more interactive, which meant gamifying it.</p>
      <p>
        At the time, a friend was using Finch, an app that gamifies looking after your mental health. For a while they found
        real merit in it, because having something to grind towards helps. Eventually that same grind came back to bite them.
        It's the Snapchat streak problem: a streak brings people back, but once the charm breaks, it's broken for good.
      </p>
      <p>
        There are plenty of apps like it. Habitica rewards you for every day you log in and do your tasks. Others grow a plant a
        little more each day you stay mindful.
      </p>
    </Panel>
    <!-- The trees, on a little screen like Treemoji's -->
    <Panel span={5} tone="moss" label="TRM-01 · THE TREES" flush>
      <div class="glass grove">
        <div class="trees">
          {#each TREES as t}<img src="/{t}.png" alt="" width="64" height="64" />{/each}
        </div>
        <p class="grove-line">EVERY NOTE BECOMES A TREE</p>
      </div>
    </Panel>
    <Panel span={5} tone="bone" label="STY-02 · B">
      <p>
        I wanted something lighter: a gamified layer on top of ordinary, everyday tasks, light enough that it never asks you to
        come back. If you stay away, nothing dies. So I chose note taking, with a garden growing out of it. Every
        note becomes a tree, and over time the trees become a garden.
      </p>
      <p>
        I was also teaching myself pixel art then: retro 2D, 32-pixel tiles, game design in the style of the old Pokémon games.
        That's where the trees and the map come from.
      </p>
    </Panel>
    <Shot span={7} src="{ART}Uko4G.jpg" caption="RENDER · MAP-01, THE GARDEN"
      alt="A close-up render of the Map viewer module: a pixel-art garden of islands and water on its screen, with MOVE and TREE keys below." />
  </Slide>

  <!-- 03 -->
  <Slide label="5 of 11: The first Arboreum">
    <Panel span={4} rows={2} label="STY-03">
      <header class="ch"><span class="no">03</span><h2>The first Arboreum</h2></header>
      <p>
        All of it came together in one project: what I knew and was still learning about UI, what I was learning about games,
        and the idea of a light game layer over everyday life. That was the first Arboreum, the green website. It's still here
        as <a href="/classic">the classic app</a>, on the same notes.
      </p>
      <p>
        It was also where I learned both kinds of database: a local one that lives in the browser, and a hosted one deployed on
        Vercel, with user logins and authentication.
      </p>
      <p>
        It worked. But it ran on a free tier, and it was slow. It was usable, but not to the point where I'd drop everything else
        and reach for it myself. A notes app needs extreme ease of use, and the first Arboreum didn't have it.
      </p>
      <p class="now"><i class="led"></i>Today there's no account and no server. Notes stay in the browser, so nothing waits on the network.</p>
    </Panel>
    <Shot span={8} src={CLASSIC.editor} ratio="2940 / 1560" position="left top" caption="THE CLASSIC APP · THE EDITOR"
      alt="The first Arboreum: a dark green app with a notes sidebar, a rich-text editor and a formatting toolbar." />
    <Shot span={4} src={CLASSIC.home} ratio="2940 / 1560" position="left top" caption="THE CLASSIC APP · HOME"
      alt="The first Arboreum's home screen: Your Notes in a sidebar, each with a pixel tree, and a welcome message." />
    <Shot span={4} src={CLASSIC.map} ratio="2940 / 1560" caption="THE CLASSIC APP · THE MAP"
      alt="The first Arboreum's garden map: pixel-art islands with a note's tree marked on its plot." />
  </Slide>

  <!-- 04 -->
  <Slide label="6 of 11: Why hardware">
    <Panel span={4} label="STY-04">
      <header class="ch"><span class="no">04</span><h2>Why hardware</h2></header>
      <p>This year I've been consolidating my portfolio and finishing past projects, and Arboreum was one of them.</p>
      <p>
        Over the same year, I'd been looking closely at the Framework laptop and how far its modularity and customisability go.
        I'd also been reading about why modular phones, like Google's Project Ara, never panned out.
      </p>
    </Panel>
    <Panel span={5} tone="alu" label="SKU-16">
      <p class="mini">LEFT · RIGHT × SMALL · BIG × 4 COLOURS</p>
      <div class="skus" aria-hidden="true">
        {#each SKUS as s}
          <i class="sku {s.size} {s.hand}" style:--c={s.c}><b></b></i>
        {/each}
      </div>
      <p class="tally"><s>16 SKUS</s> <span>ON THE WEB: 1 BUILD</span></p>
    </Panel>
    <Shot span={3} rows={2} src={SKETCH} ratio="960 / 1280" contain caption="SKETCH · MODULES THAT SWAP"
      alt="A pen sketch of the console's layout: camera, screen, map viewer, D-pad and controls, with arrows showing the map viewer swapping for an emoji buddy or a list, and the controls for a key deck." />
    <Panel span={9} label="STY-04 · B">
      <div class="cols">
        <p>
          The short version is that hardware is solid, and a part can't change shape. You're offered customisation, but only
          within the components the company gives you, so the result is still rigid. And one size doesn't fit all: hands differ,
          needs differ, and some people are left-handed. To serve all of them, a company would need a left version and a right
          version, a small one and a big one, and then colours on top of each. That's an SKU nightmare, and every split makes the
          audience for each version smaller. Framework is one of the few modular hardware companies where it's working out, and
          its customers are genuinely excited.
        </p>
        <p>
          Software is fluid in a way hardware never is, and this is exactly the problem modern web design solves. On the web I
          can give you the feel of customisable hardware without the SKUs: one console, any combination of modules, arranged for
          whatever window it's in. Left, right, big, small and every colour are all the same build.
        </p>
        <p>
          It's also a look I think is coming back. Retro consumer electronics are slowly creeping back into fashion. E-ink
          displays are spreading, handheld consoles are everywhere, and as the games industry moves away from physical copies, I
          think there's room for the retro handheld to return. The JXF26-ARB-16A is built from that feeling.
        </p>
      </div>
    </Panel>
  </Slide>

  <!-- 05 -->
  <Slide label="7 of 11: What it's meant to show">
    <Panel span={5} label="STY-05">
      <header class="ch"><span class="no">05</span><h2>What it's meant to show</h2></header>
      <p>
        I wanted one magnum opus: a website so polished, with a concept so striking and visuals so cool, that it goes well beyond
        anything AI makes on its own. It should also show how I work as a UI/UX designer, which means understanding what people
        need and designing around it.
      </p>
      <p>
        Beyond that, I wanted it to show everything I know, from every part of my life: gaming, taste and aesthetics, art and
        colour, and products that cross domains.
      </p>
    </Panel>
    <Shot span={7} rows={2} src="{ART}gaayH.jpg" caption="RENDER · WITH THE ENCLOSURE"
      alt="A render of the console with its optional enclosure: the same modules set into a dark frame." />
    <Panel span={5} tone="signal" label="STY-05 · B">
      <p class="big">Most of all, it's about taking an abstract concept and turning it into something real.</p>
    </Panel>
  </Slide>

  <!-- 06 -->
  <Slide label="8 of 11: Three rules underneath">
    <Panel span={4} label="RULE-01">
      <header class="ch"><span class="no">06</span><h2>Three rules underneath</h2></header>
      <h3>Concept never beats usability</h3>
      <p>
        The hardware is a skin over a tool people actually use. Everyday features stay, even when they don't map neatly onto a
        console. Picking several notes and deleting them is one example: a handheld has no obvious button for it, so it got a
        slider of its own.
      </p>
    </Panel>
    <Panel span={4} rows={2} label="RULE-02">
      <h3>Three equivalent ways to do everything</h3>
      <p>Every action has three complete routes, and each one works on its own:</p>
      <ol>
        <li><strong>The classic desktop.</strong> Keyboard shortcuts and the mouse, the way any app works.</li>
        <li><strong>Touching the console.</strong> Pressing the hardware with the cursor or a finger, as on a touch-screen device.</li>
        <li><strong>The console way.</strong> Only the D-pad, A, B and Start, with menus.</li>
      </ol>
      <p>
        They overlap on purpose, and you can switch mid-action: press MOVE on the map, nudge with the arrow keys, finish with the
        mouse. Whichever hand is already moving should just work. The aim is a device that feels smooth in a way nobody can quite
        explain.
      </p>
    </Panel>
    <Panel span={4} label="RULE-03">
      <h3>Hardware is a layout tool</h3>
      <p>
        The physical metaphor decides the rules, and the web decides how the space flows. Controls always sit below the screen,
        and each side of the screen holds at most one dock. Pull the speaker and the map viewer takes its column and zooms in.
        Pull the map and the screen widens into the space. Modules that exist only for the look give way to ones that do
        something.
      </p>
    </Panel>
    <Panel span={4} tone="graphite" label="A/B · LABELS, NEVER BUTTONS">
      <p class="strip-demo" aria-hidden="true"><i class="pip a">A</i>SAVE <i class="pip b">B</i>NEW <i class="pip st">SRT</i>MENU</p>
      <p>
        One thing it deliberately doesn't do: the strip that says what A and B do is a label, never a button. The keys are real
        and the screen itself is clickable, so the three routes join up without that shortcut.
      </p>
    </Panel>
    <Shot span={4} src="{ART}ghnor.jpg" caption="RENDER · CTL-01, THE CONTROL PAD"
      alt="A close-up render of the control pad: Select and Start in one well, a dark B and an orange A in another, and the PAD/FMT slide switch on its edge." />
  </Slide>

  <!-- 07 -->
  <Slide label="9 of 11: Structure, then freedom">
    <Panel span={4} label="STY-07">
      <header class="ch"><span class="no">07</span><h2>Structure, then freedom</h2></header>
      <p>
        You choose what's slotted, but not where it goes. A handful of placement rules arrange any combination, so nothing needs
        dragging around and nothing ends up broken. The same goes for colour. A theme colours every module and the accent
        together, never one module at a time, so the contrast between them stays designed rather than left to chance.
      </p>
    </Panel>
    <!-- Portrait: the same modules, stacked for an upright window -->
    <Shot span={4} rows={2} src="{ART}oF8Fu.jpg" ratio="1408 / 1408" caption="RENDER · PORTRAIT, WITH THE CONTROL PAD"
      alt="A render of the console in portrait: camera and nameplate on top, a tall screen, then the D-pad and control pad, with the speaker as a strip down the right." />
    <Shot span={4} rows={2} src="{ART}sAfAA.jpg" ratio="1264 / 1568" caption="RENDER · PORTRAIT, WITH THE FORMAT DECK AND LIST"
      alt="A render of the console in portrait with the Format deck beside the D-pad and the List module in the bay below them." />
    <Panel span={4} tone="moss" label="STY-07 · B">
      <p>
        Only the screen stretches. On a bigger window the screen takes the extra room and every other module keeps its size, the
        way a real device's keys don't grow. On a smaller window the whole console scales down together. Upright windows get
        their own arrangement, a stack shaped to a phone, and the console follows as you turn the device.
      </p>
    </Panel>
  </Slide>

  <!-- 08 · The modules, as a spec sheet: one panel each, in its material -->
  <Slide label="10 of 11: The modules">
    <Panel span={3} rows={2} label="STY-08">
      <header class="ch"><span class="no">08</span><h2>The modules</h2></header>
      <p>
        The console is a set of modules around the screen. Each one is a real control: press it with the cursor or a finger, or
        reach it from the D-pad.
      </p>
      <p>
        Two slots swap. The bay takes the Map viewer, Treemoji or the List; the control slot takes the control pad or the Format
        deck. The old module ejects and the new one slides in.
      </p>
    </Panel>
    <Panel span={3} tone="graphite" label="SCR-01">
      <h3>Screen</h3>
      <p>Where writing happens. The notes list opens here full screen too.</p>
    </Panel>
    <Panel span={3} label="LST-01">
      <h3>List</h3>
      <p>Your notes, with index tabs to sort them and a slider for picking several at once.</p>
    </Panel>
    <Panel span={3} tone="alu" label="MAP-01">
      <h3>Map viewer</h3>
      <p>The garden. MOVE plants the note on a plot, TREE picks its tree.</p>
    </Panel>
    <Panel span={3} tone="alu" label="TRM-01">
      <h3>Treemoji</h3>
      <p>A tree buddy that keeps you company while you write, cheers milestones and dozes when you stop.</p>
    </Panel>
    <Panel span={3} tone="moss" label="NAV-01">
      <h3>D-pad</h3>
      <p>Moves through the list, the text and the map.</p>
    </Panel>
    <Panel span={3} label="CTL-01">
      <h3>Control pad</h3>
      <p>A, B, Start and Select: save, new note, the menu, the list.</p>
    </Panel>
    <Panel span={3} tone="graphite" label="FMT-01">
      <h3>Format deck</h3>
      <p>Physical keys for bold, italics, headings, lists and more. It swaps with the control pad.</p>
    </Panel>
    <Panel span={3} tone="alu" label="CAM · MEDIA">
      <h3>Camera</h3>
      <p>Adds an image to the note. On a phone it can open the camera.</p>
    </Panel>
    <Panel span={3} tone="graphite" label="SPK-01">
      <h3>Speaker</h3>
      <p>Mostly for looks. Remove it and the modules beside it take the room.</p>
    </Panel>
    <Panel span={3} tone="signal" label="CONFIGURE">
      <h3>Configure</h3>
      <p>The gear on the nameplate: choose what's slotted (LAYOUT) and the console's colours (LOOK).</p>
    </Panel>
  </Slide>

  <!-- 09 -->
  <Slide label="11 of 11: The details">
    <Panel span={3} label="SPEC-01">
      <header class="ch"><span class="no">09</span><h2>The details</h2></header>
      <h3>Printing and screens</h3>
      <p>The hardware is printed in <span class="chakra">Chakra Petch</span>; the screens use <span class="jb">JetBrains Mono</span>.</p>
    </Panel>
    <Panel span={3} label="SPEC-02">
      <h3>One accent</h3>
      <p>In each theme, a single signal colour marks what's live: the A key, LEDs, latches, the cursor and the stripe on the nameplate.</p>
    </Panel>
    <Shot span={6} src="{ART}W2RmQ.jpg" caption="RENDER · THE NAMEPLATE"
      alt="A close-up render of the nameplate: ARBOREUM, by JUNESFORGE, and the model number JXF26-ARB-16A in orange." />
    <Panel span={3} label="SPEC-03">
      <h3>The screen tells you where you are</h3>
      <p>Its glass is warm while you write and cool while you browse, in every theme's own tint.</p>
      <span class="glasses" aria-hidden="true"><i class="warm"></i><i class="cool"></i></span>
    </Panel>
    <Panel span={3} label="SPEC-04">
      <h3>The keys don't steal focus</h3>
      <p>Pressing a console key never takes the cursor out of your text, so you can type, press, and keep typing.</p>
    </Panel>
    <Shot span={4} src="{ART}ymnqY.jpg" caption="RENDER · NAV-01, THE D-PAD"
      alt="A close-up render of the moss green D-pad module, labelled NAV-01." />
    <Panel span={2} tone="signal" label="END">
      <p class="big">Want to try it?</p>
      <p class="cta">
        <a class="key" href="/">◂ DEVICE</a>
        <a class="key light" href="/help">MANUAL</a>
      </p>
    </Panel>
  </Slide>
</Carousel>

<style>
  /* Type inside the panels */
  .kicker,
  .mini {
    margin: 0 0 12px;
    font-family: var(--label);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--signal-text);
  }
  .mini { color: inherit; opacity: 0.7; }
  h1 {
    margin: 0 0 18px;
    font-family: var(--label);
    font-size: clamp(36px, 4.4vw, 54px);
    font-weight: 700;
    line-height: 1.02;
  }
  .lead {
    margin: 0;
    font-size: 19px;
    line-height: 1.55;
    color: var(--ink-soft);
  }
  .hint {
    margin: auto 0 0;
    padding-top: 22px;
    font-family: var(--label);
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--ink-soft);
  }
  /* The nameplate's stripes, on the cover */
  .stripes {
    position: absolute;
    bottom: 0;
    right: 34px;
    width: 92px;
    height: 140px;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, #2b2d2c 60% 66%, transparent 66%);
    opacity: 0.95;
  }
  .ch {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin: 0 0 16px;
  }
  .ch .no {
    font-family: var(--mono);
    font-size: 30px;
    font-weight: 700;
    line-height: 1;
    color: var(--signal);
  }
  h2 {
    margin: 0;
    font-family: var(--label);
    font-size: 26px;
    font-weight: 700;
    line-height: 1.15;
  }
  h3 {
    margin: 0 0 8px;
    font-family: var(--label);
    font-size: 19px;
    font-weight: 700;
    line-height: 1.2;
  }
  p,
  li {
    font-size: 16px;
    line-height: 1.55;
  }
  p { margin: 0 0 12px; }
  ol {
    margin: 0 0 12px;
    padding-left: 1.2em;
  }
  li { margin-bottom: 4px; }
  li::marker { color: var(--signal-text); font-weight: 700; }
  strong { font-weight: 600; }
  a:not(.key) {
    color: var(--signal-text);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
  }
  .big {
    margin: auto 0;
    font-family: var(--label);
    font-size: clamp(22px, 2.2vw, 28px);
    font-weight: 700;
    line-height: 1.2;
  }
  .small {
    margin: 14px 0 0;
    font-size: 15px;
    color: var(--ink-soft);
  }

  /* About: the title (the cover has the h1), the key onward */
  .title {
    margin: 0 0 16px;
    font-size: clamp(28px, 2.8vw, 36px);
    line-height: 1.08;
  }
  kbd {
    padding: 1px 6px;
    border-radius: 5px;
    font-family: var(--label);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #e4e6e2;
    background: #2d302f;
  }
  .onward {
    align-self: flex-start;
    margin-top: 18px;
    border: none;
    cursor: pointer;
  }
  .arrow { display: inline-block; margin-left: 6px; }
  @media (min-width: 761px) {
    :global(.panel:has(.onward)) { grid-column: 10 / span 3; grid-row: 1 / span 2; }
  }

  /* The model number, segment by segment */
  .decode {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px 6px;
    font-family: var(--mono);
  }
  .seg {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }
  .seg b {
    padding: 0 3px 6px;
    border-bottom: 2px solid currentColor;
    font-size: clamp(26px, 3vw, 40px);
    line-height: 1;
    color: var(--signal);
  }
  .seg small {
    font-family: var(--label);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--ink-soft);
    white-space: nowrap;
  }
  .dash {
    font-size: clamp(26px, 3vw, 40px);
    line-height: 1;
    color: var(--ink-soft);
  }

  /* Glass, as on the console's screens */
  .glass {
    flex: 1;
    border-radius: 8px;
    background: radial-gradient(120% 90% at 30% 20%, #142019, #0b100d 70%);
    box-shadow: inset 0 0 0 2px #050706, inset 0 3px 10px rgba(0, 0, 0, 0.8);
    font-family: var(--mono);
    color: #d5e4c6;
  }
  .type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 22px 26px;
  }
  .type p {
    margin: 0;
    font-size: clamp(15px, 1.6vw, 20px);
    line-height: 1.7;
  }
  .type em {
    font-style: normal;
    color: #ffb36b;
  }
  .ln {
    display: inline-block;
    width: 2.2em;
    color: #61735c;
  }
  .caret {
    display: inline-block;
    width: 0.6em;
    height: 1.1em;
    margin-left: 4px;
    vertical-align: -0.15em;
    background: var(--signal);
    animation: blink 1.1s steps(1) infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }

  /* The trees on grass, pixel for pixel */
  .grove {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    min-height: 210px;
    padding: 16px;
    background:
      linear-gradient(rgba(5, 10, 6, 0.28), rgba(5, 10, 6, 0.28)),
      url("/tileset/grass1.png") 0 0 / 48px 48px;
    image-rendering: pixelated;
  }
  .trees {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    justify-items: center;
    margin: auto 0;
  }
  .trees img {
    width: 64px;
    height: 64px;
    image-rendering: pixelated;
  }
  .grove-line {
    margin: 0;
    padding: 6px 8px;
    border-radius: 4px;
    background: rgba(5, 10, 6, 0.72);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .now {
    margin: auto 0 0;
    padding: 12px 14px;
    border-radius: 8px;
    background: color-mix(in oklab, var(--face), black 7%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12);
    font-size: 15px;
  }
  .led {
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 8px;
    border-radius: 50%;
    vertical-align: 0.1em;
    background: #6fd36a;
    box-shadow: 0 0 6px #6fd36a;
  }

  /* Sixteen versions of one device */
  .skus {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px 6px;
    align-items: end;
    margin: 4px 0 14px;
  }
  .sku {
    position: relative;
    display: block;
    aspect-ratio: 3 / 4;
    border-radius: 3px;
    background: var(--c);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  }
  .sku.S { width: 72%; justify-self: center; }
  .sku b {
    position: absolute;
    top: 14%;
    width: 50%;
    height: 34%;
    border-radius: 1.5px;
    background: #0b100d;
  }
  .sku.L b { right: 12%; }
  .sku.R b { left: 12%; }
  .sku::after {
    content: "";
    position: absolute;
    bottom: 16%;
    width: 22%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #141615;
  }
  .sku.L::after { left: 14%; }
  .sku.R::after { right: 14%; }
  .tally {
    margin: auto 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-family: var(--label);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
  }
  .tally s { color: var(--ink-soft); }
  .tally span { color: var(--signal-text); }

  .cols {
    columns: 2 260px;
    column-gap: 30px;
  }

  /* The A/B strip, printed as it appears on the screen */
  .strip-demo {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    margin: 0 0 16px;
    padding: 7px 12px;
    border-radius: 6px;
    background: #0b100d;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    font-family: var(--label);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #d5e4c6;
  }
  .pip {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    margin-left: 4px;
    border-radius: 50%;
    font-style: normal;
    font-size: 10px;
    color: #10130f;
  }
  .pip.a { background: var(--signal); }
  .pip.b { background: #8e9a88; }
  .pip.st { width: auto; padding: 0 4px; border-radius: 4px; font-size: 8.5px; background: #4c5a49; color: #d5e4c6; }

  .chakra { font-family: var(--label); font-weight: 600; }
  .jb { font-family: var(--mono); font-size: 0.92em; }
  .glasses {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }
  .glasses i {
    flex: 1;
    height: 30px;
    border-radius: 6px;
    box-shadow: inset 0 0 0 2px #050706, inset 0 3px 8px rgba(0, 0, 0, 0.7);
  }
  .glasses .warm { background: radial-gradient(120% 90% at 30% 20%, #1d2a18, #0d130b 70%); }
  .glasses .cool { background: radial-gradient(120% 90% at 30% 20%, #18212a, #0b1015 70%); }

  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0;
  }
  .key {
    padding: 9px 14px;
    border-radius: 14px;
    font-family: var(--label);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #e4e6e2;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .key.light {
    color: #2b2d2c;
    background: linear-gradient(180deg, #fffdf6, #ebe5d3);
    box-shadow: 0 3px 0 #b7ae98;
  }
  .key:active { transform: translateY(2px); }

  @media (max-width: 760px) {
    .stripes { right: 22px; width: 70px; height: 90px; }
    .lead { font-size: 17px; }
    .arrow { transform: rotate(90deg); } /* stacked: the story is below */
  }
</style>
