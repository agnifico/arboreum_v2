<div class="about">
  <h1 class="arboreum dynamic-text-shadow">Arboreum</h1>

  <p class="lead">A cosy notebook where every note grows into a tree.</p>

  <ol class="steps">
    <li>
      <span class="step">Write.</span>
      Press Create New and let the words out. Ctrl/⌘&nbsp;S saves as you go.
    </li>
    <li>
      <span class="step">Pick a tree.</span>
      Each note gets its own pixel tree: blossom, palm, frosty pine, and more.
    </li>
    <li>
      <span class="step">Plant it.</span>
      Use the map button in the editor to choose a spot. Over time your notes
      become a little garden you can wander.
    </li>
  </ol>

  <p class="note">
    Your notes live in this browser, not on a server. Use Export now and then
    to keep a backup, and Import to bring it back.
  </p>

  <p class="small">Written in Svelte 5 and Node.js.</p>
</div>

<style>
  .about {
    box-sizing: border-box;
    width: 100%;
    max-width: 40rem;
    height: fit-content;
    margin: 0 auto;
    padding: 4rem clamp(1.25rem, 5vw, 3rem) 3rem;
    color: aliceblue;
    text-align: left;
  }

  .arboreum {
    color: #2a9d8f;
    font-family: "Silkscreen";
    font-size: 2.5rem;
    font-weight: normal;
    margin: 0 0 1.5rem;
  }
  .dynamic-text-shadow {
    text-shadow: .2rem .2rem 0 #386641;
  }

  .lead {
    font-family: "Fira Code";
    color: #e07a5f;
    font-size: 1.35rem;
    line-height: 1.5;
    margin: 0 0 2rem;
  }

  .steps {
    font-family: "Fira Code";
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-main);
    margin: 0 0 2rem;
    padding-left: 1.5rem;
  }
  .steps li {
    margin-bottom: 1rem;
  }
  .steps li::marker {
    color: #2a9d8f;
    font-family: "Silkscreen";
  }
  .step {
    color: #2a9d8f;
  }

  .note {
    font-family: "Fira Code";
    font-size: 0.95rem;
    line-height: 1.7;
    color: #ffd6ad;
    margin: 0 0 2rem;
    padding: 0.75rem 1rem;
    border-left: 4px solid #e07a5f;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .small {
    font-family: "Fira Code";
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
  }

  @media (max-width: 768px) {
    .about {
      padding-top: 2.5rem;
    }
    .arboreum {
      font-size: 2rem;
    }
    .lead {
      font-size: 1.15rem;
    }
  }
</style>
