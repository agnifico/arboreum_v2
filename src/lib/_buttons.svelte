<script>
  let { color = "green", text = "xyz", fn = null, type = "button" } = $props();

  let buttonClass = $derived(`btn ${color}`);
</script>

<button {type} class={buttonClass} onclick={fn}>{text}</button>

<style>
  .btn {
    width: 100px;
    padding: 4px 8px;
    height: 50px;
    border-radius: 5px;
    font-family: "Fira Code";
    transition: all 0.1s ease-in-out;
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }

  .btn:hover {
    transform: translateY(-3px);
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }

  .btn:focus {
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }

  .green {
    background-color: #679289;
    border: 3px solid #1d7874;
    color: #071e22;
  }

  .darkgreen {
    background-color: #071e22;
    border: 3px solid #87bba2;
    color: #87bba2;
  }

  .red {
    background-color: #5c3335;
    border: 3px solid #84484b;
    color: #ffd151;
  }

  .olive {
    background-color: #37423d;
    border: 3px solid #9a8873;
    color: #e2cacc;
  }

  .purple {
    background-color: #4f345a;
    border: 3px solid #9c71ad;
    color: #ffd6ad;
  }
</style>