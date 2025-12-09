<script>
  let {
    btnType = "btn-1",
    text = "xyz",
    fn = null,
    type = "button",
    active = false,
    link = '/',
    target = '_parent'
  } = $props();
</script>

{#if btnType == "map-btn"}
  <button {type} class={btnType} onclick={fn} class:active>
    <img src="/map.svg" alt="" />
  </button>
{:else if btnType == "switcher"}
  <button onclick={fn} type="button" class="switcher" class:active>
    <div class="switchLabel">
      {text}
    </div>
    <div class="switchButton">
      <div class="X">&nbsp;</div>
    </div>
  </button>
{:else if btnType == "delete"}
  <div class="delete" class:active>
    <button type="button" class="toggleDelete" onclick={fn}
      >{active ? "Delete" : "Select"}</button
    >
    <button type="submit" class="deletePostButton"
      ><img src="/delete.svg" alt="" /></button
    >
  </div>
  {:else if btnType == "link"}
  <button type="button" class="link">
    <a href={link} target={target}>{text}</a>
  </button>
{:else}
  <button {type} class={btnType} onclick={fn} class:active> {text} </button>
{/if}

<style>
  .delete {
    position: relative;
    margin: 1rem 1rem 1rem 1rem;
    width: fit-content;
    display: flex;
    flex-wrap: nowrap;
    /* padding: 0 0 0 8px; */
    background-color: #3d405b;
    border: 4px solid #38a3a5;
    color: #3d405b;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    /* overflow: visible; */
    z-index: 1;
    /* padding: 0.5rem; */
    transition: all 0.1s ease;

    &.active {
      border: 4px solid #e07a5f;
      .deletePostButton {
        visibility: visible;
        transform: translateX(0);
        box-shadow:
          rgba(0, 0, 0, 0.4) 0px 2px 4px,
          rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
          rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
        &:hover {
          transform: translateX(0) translateY(-3px);
        }
      }
      .toggleDelete {
        text-align: left;
        transform: translateX(0);
        background-color: #3d405b;
        color: #e07a5f;
      }
    }
  }
  .toggleDelete {
    cursor: pointer;
    width: 10ch;
    text-align: center;
    transform: translateX(50px);
    position: relative;
    border: none;
    box-shadow: none;
    border-radius: 4px;
    z-index: 2;
    background-color: #38a3a5;
    &:hover {
      background-color: #57cc99;
    }
  }
  .deletePostButton {
    z-index: 1;
    position: relative;
    visibility: hidden;
    /* transform: translateX(-10ch); */
    width: 50px;
    margin: 0 0 0 auto;
    object-fit: contain;
    border: 2px solid #e07a5f;
    border: none;
    border-radius: 0px;
    background-color: #e07a5f;
    transition: all 0.1s ease;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
    box-shadow: none;
    img {
      position: relative;
      aspect-ratio: 1;
      height: 16px;
    }
  }
  .switcher {
    cursor: pointer;
    position: relative;
    width: fit-content;
    display: flex;
    flex-wrap: nowrap;
    padding: 0 0 0 8px;
    background-color: #3d405b;
    border: 4px solid #e07a5f;
    color: #e07a5f;
    border-radius: 8px;
    font-family: "Fira Code";
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    overflow: visible;
    z-index: 1;
    /* padding: 0.5rem; */

    &.active {
      border: 4px solid #38a3a5;
      color: #38a3a5;
      .switchButton .X {
        transform: translateX(25px);
        background-color: #38a3a5;
      }
    }
  }
  .switchLabel {
    text-align: left;
    width: 10ch;
    position: relative;
    padding: 4px 0 4px 0;
  }
  .switchButton {
    margin: 0 0 0 auto;
    position: relative;
    height: 100%;
    width: 50px;
    /* background-color: #22577a; */
    z-index: 2;
    box-shadow: none;
    border: none;
  }
  .X {
    position: relative;
    transition: all 0.2s ease-in-out;
    /* transform: translateY(-4px); */
    height: 100%;
    width: 25px;
    background-color: #e07a5f;
    margin: 0 auto 0 0;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }

  button {
    height: 100%;
    transition: all 0.1s ease;
    position: relative;
    width: fit-content;
    font-family: "Fira Code";
    font-size: 1rem;
    padding: 4px 8px;
    border-radius: 8px;
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }

  .btn-1 {
    border-radius: 2rem 8px 8px 0px;
    color: #463f3a;
    padding-inline: 4rem;
    background-color: #8a817c;
    border: 4px solid #bcb8b1;
    &:hover {
      background-color: #22577a;
      border-color: #87bba2;
      color: #94d2bd;
      transform: translateY(-3px);
    }

    &.active {
      color: #22577a;
      background-color: #38a3a5;
      border-color: #57cc99;
      font-weight: 600;
    }
  }

  .btn-2 {
    justify-self: right;
    /* width: 600px; */
    text-wrap: nowrap;
    padding-inline: 5rem;
    font-family: "Fira Code";
    font-weight: 600;
    color: #071e22;
    background-color: #679289;
    border: 5px solid #1d7874;
    &:hover {
      background-color: #22577a;
      border-color: #87bba2;
      color: #94d2bd;
    }
  }

  .btn-3 {
    justify-self: right;
    /* width: 600px; */
    text-wrap: nowrap;
    /* padding-inline: 5rem; */
    font-family: "Fira Code";
    /* font-weight: 600; */
    color: #071e22;
    background-color: #679289;
    border: 5px solid #1d7874;
    &:hover {
      background-color: #22577a;
      border-color: #87bba2;
      color: #94d2bd;
    }
  }

  .map-btn {
    position: relative;
    border-radius: 8px 2rem 0px 8px;
    margin-inline: auto 0;
    width: fit-content;
    padding: 0 5rem;
    background-position: 8px 8px;
    background-repeat: no-repeat;
    object-fit: contain;
    height: 100%;
    color: #463f3a;
    background-color: #8a817c;
    border: 4px solid #bcb8b1;
    object-fit: contain;
    img {
      margin-top: 4px;
      height: 28px;
    }
    &.active {
      color: #22577a;
      background-color: #38a3a5;
      border-color: #57cc99;
      font-weight: 600;
      transform: translateY(-5px);
    }
    &:hover {
      transform: translateY(-3px);
      background-color: #463f3a;
      border-color: #8a817c;
      color: #bcb8b1;
    }
  }

  .link {
    /* justify-self: right; */
    /* width: 600px; */
    text-wrap: nowrap;
    /* padding-inline: 5rem; */
    font-family: "Fira Code";
    font-family: "Silkscreen";
    /* font-weight: 600; */
    color: #071e22;
    height: fit-content;
    padding: 4px 8px 8px 8px;
    background-color: #679289;
    /* border: 5px solid #1d7874; */
    border: none;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -6px 0px inset;
    &:hover {
      background-color: #22577a;
      border-color: #87bba2;
      color: #94d2bd;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }
</style>
