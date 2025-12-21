<script>
  let { note, disabled = true, bg } = $props();

  let isSelected = $derived(bg.includes(note.id));
</script>

<a class="file" href="/read/{note.noteid}" class:selected={isSelected}>
  <div class="xp">
    <p>
      {note.title.length > 10 ? note.title.slice(0, 6).trim() + ".." : note.title}
    </p>
    <div class="right-box">
      <img src={note.icon} alt="Saved File" class="icon" />
    </div>
  </div>
</a>

<style>
  a {
    color: inherit;
    text-decoration: none;
    width: 100%;
    /* height: 30px; */
    display: flex;
    align-items: center;
    padding-inline: 1rem;
    padding-block: .5rem;
  }
  p {
    position: relative;
    text-align: left;
    width: fit-content;
    padding: 0rem 0rem;
    margin-block: auto;
    z-index: 0;
    font-family: "Crete Round";
    color: var(--neon-green);
  }
  
  p::after {
    content: " ";
    white-space: pre;
  }

  .xp {
    height: 100%;
    min-width: 15rem;
    position: relative;
    display: flex;
    align-items: flex-start;
  }
  
  .file {
    height: 70px;
    height: fit-content;
    z-index: 0;
    position: relative;
    display: flex;
    min-width: 15rem;
    align-items: flex-start;
    cursor: pointer;
    
    &:hover {
      background-color: var(--evergreen);
      /* border-left: 4px solid white; */
      
      .icon {
        filter: brightness(1.5);
        /* transform: translateY(-5px); */
      }
      p {
        
        color: var(--dust-grey);
        /* text-decoration: underline; */
      }
      p::after {
        content: " →";
      }
    }
  }
  
  .selected {
    /* background-color: var(--orange); */
    border-left: 4px solid var(--orange);
    p {
      color: var(--orange);
      transform: translateX(-4px);
    }
    .icon {
      transform: translateX(-4px);
    }
  }

  .right-box {
    height: 100%;
    width: fit-content;
    margin-left: auto;
    margin-right: 0;
    /* padding: 0.5rem; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* border: 1px solid white; */
  }

  .icon {
    height: 30px;
    width: 30px;
    margin-left: auto;
  }
</style>
