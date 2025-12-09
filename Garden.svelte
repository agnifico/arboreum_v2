<script>
  let { notes } = $props();
  let _n = JSON.parse(JSON.stringify(notes));
  // let _x;
  const gridWidth = 25;
  const gridHeight = 15;
  const totalCells = gridWidth * gridHeight;
  // let mapTrix = [
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "waterRock",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "waterRock",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "grass",
  //   "waterRock",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "waterBoat2",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterRock",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "waterBoat1",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterRock",
  //   "water",
  //   "water",
  //   "waterBoat1",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "water",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "grass",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "waterPlant",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  //   "water",
  // ];

  function reshapeArray(array, rows, cols) {
    if (
      !Array.isArray(array) ||
      array.length === 0 ||
      rows <= 0 ||
      cols <= 0 ||
      array.length !== rows * cols
    ) {
      return [];
    }

    // Create the new 2D matrix.
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = []; // Initialize each row.
      for (let j = 0; j < cols; j++) {
        // Calculate the index in the original 1D array.
        const index = i * cols + j;
        matrix[i][j] = array[index]; // Copy the element to the matrix.
      }
    }
    return matrix; // Return the reshaped matrix.
  }

  function processMatrixStrings(matrix) {
    if (
      !Array.isArray(matrix) ||
      matrix.length === 0 ||
      !Array.isArray(matrix[0])
    ) {
      return [];
    }

    const numRows = matrix.length;
    const numCols = matrix[0].length;
    const resultMatrix = []; // Create a new matrix
    let rocks = 4;
    let plants = 8;

    for (let i = 0; i < numRows; i++) {
      resultMatrix[i] = []; // Initialize the row
      for (let j = 0; j < numCols; j++) {
        const cellValue = matrix[i][j];

        if (cellValue === "soil") {
          resultMatrix[i][j] = cellValue;
        } else if (cellValue === "water") {
          resultMatrix[i][j] = "water0";
          continue;
          if (Math.random() > 0.97 && rocks) {
            rocks -= 1;
            resultMatrix[i][j] = "water1";
          } else if (Math.random() > 0.97 && plants) {
            plants -= 1;
            resultMatrix[i][j] = "water2";
          } else {
            resultMatrix[i][j] = "water0";
          }
        } else if (cellValue === "grass") {
          let _ = "";
          let wTop = false;
          let wBottom = false;
          let wLeft = false;
          let wRight = false;

          // Check neighbors for "water"
          if (i > 0 && matrix[i - 1][j].includes("water")) {
            wTop = true;
          }
          if (i < numRows - 1 && matrix[i + 1][j].includes("water")) {
            wBottom = true;
          }
          if (j > 0 && matrix[i][j - 1].includes("water")) {
            wLeft = true;
          }
          if (j < numCols - 1 && matrix[i][j + 1].includes("water")) {
            wRight = true;
          }

          // Determine the string to append based on water neighbors.
          if (wTop && wRight && wLeft && !wBottom) {
            _ = "10";
          } else if (wTop && !wRight && wLeft && wBottom) {
            _ = "11";
          } else if (wTop && wRight && !wLeft && wBottom) {
            _ = "12";
          } else if (!wTop && wRight && wLeft && wBottom) {
            _ = "13";
          } else if (!wTop && wRight && wLeft && wBottom) {
            _ = "13";
          } else if (!wTop && wRight && wLeft && !wBottom) {
            _ = "14";
          } else if (wTop && !wRight && !wLeft && wBottom) {
            _ = "15";
          } else if (wTop && wLeft) {
            _ = "1";
          } else if (wTop && !wRight) {
            _ = "2";
          } else if (wTop && wRight) {
            _ = "3";
          } else if (wLeft && !wBottom) {
            _ = "4";
          } else if (!wTop && !wBottom && !wLeft && !wRight) {
            _ = "5";
          } else if (wRight && !wBottom) {
            _ = "6";
          } else if (wBottom && wLeft) {
            _ = "7";
          } else if (wBottom && !wRight) {
            _ = "8";
          } else if (wBottom && wRight) {
            _ = "9";
          }
          resultMatrix[i][j] = cellValue + _;
        } else {
          resultMatrix[i][j] = cellValue; // fallback: original value
        }
      }
    }
    return resultMatrix;
  }
  // svelte-ignore non_reactive_update
  // let myMap = reshapeArray(mapTrix, gridHeight, gridWidth);
  // console.log(myMap);
  // myMap = processMatrixStrings(myMap);
  // console.log(myMap);
  // myMap = myMap.flat();
  // console.log(myMap);
  let myMap = [
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "waterRock",
  "water0",
  "water0",
  "waterPlant",
  "waterPlant",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass3",
  "water0",
  "water0",
  "water0",
  "waterRock",
  "grass1",
  "grass2",
  "grass2",
  "grass15",
  "grass2",
  "grass3",
  "water0",
  "water0",
  "water0",
  "grass11",
  "grass12",
  "water0",
  "waterPlant",
  "grass1",
  "grass3",
  "water0",
  "waterPlant",
  "grass11",
  "grass2",
  "grass5",
  "grass5",
  "grass3",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass9",
  "waterPlant",
  "grass7",
  "grass6",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass3",
  "water0",
  "water0",
  "grass7",
  "grass8",
  "grass5",
  "grass6",
  "water0",
  "water0",
  "grass4",
  "grass5",
  "grass6",
  "waterPlant",
  "water0",
  "water0",
  "grass14",
  "water0",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass8",
  "grass8",
  "grass3",
  "water0",
  "water0",
  "water0",
  "grass7",
  "grass6",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass9",
  "water0",
  "water0",
  "waterPlant",
  "grass14",
  "waterRock",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass9",
  "water0",
  "water0",
  "grass13",
  "water0",
  "grass11",
  "grass12",
  "water0",
  "grass13",
  "water0",
  "grass4",
  "grass5",
  "grass6",
  "waterBoat2",
  "water0",
  "water0",
  "grass1",
  "grass6",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass4",
  "grass5",
  "grass6",
  "water0",
  "waterRock",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "grass1",
  "grass5",
  "grass8",
  "grass9",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass9",
  "water0",
  "waterPlant",
  "water0",
  "water0",
  "grass7",
  "grass5",
  "grass5",
  "grass3",
  "water0",
  "water0",
  "grass10",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass4",
  "grass6",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass6",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass7",
  "grass5",
  "grass5",
  "grass2",
  "grass2",
  "grass9",
  "water0",
  "grass11",
  "grass12",
  "water0",
  "grass1",
  "grass5",
  "grass6",
  "water0",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass9",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "waterBoat1",
  "grass7",
  "grass5",
  "grass5",
  "grass9",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "water0",
  "grass4",
  "grass5",
  "grass6",
  "water0",
  "grass1",
  "grass5",
  "grass5",
  "grass9",
  "water0",
  "grass1",
  "grass3",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "water0",
  "water0",
  "grass7",
  "grass9",
  "water0",
  "waterRock",
  "water0",
  "water0",
  "waterBoat1",
  "water0",
  "grass4",
  "grass5",
  "grass6",
  "water0",
  "grass7",
  "grass8",
  "grass9",
  "water0",
  "water0",
  "grass7",
  "grass9",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass3",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass1",
  "grass3",
  "water0",
  "grass7",
  "grass8",
  "grass6",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass7",
  "grass9",
  "water0",
  "waterPlant",
  "grass1",
  "grass3",
  "water0",
  "grass1",
  "grass5",
  "grass6",
  "water0",
  "water0",
  "water0",
  "grass13",
  "water0",
  "grass1",
  "grass2",
  "grass3",
  "waterPlant",
  "grass1",
  "grass3",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "waterPlant",
  "grass11",
  "grass8",
  "grass9",
  "water0",
  "grass7",
  "grass8",
  "grass8",
  "grass12",
  "water0",
  "water0",
  "water0",
  "water0",
  "grass7",
  "grass8",
  "grass8",
  "grass15",
  "grass8",
  "grass9",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "waterPlant",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0",
  "water0"
]
</script>

<div class="container">
  <div class="garden" style:--width={gridWidth} style:--height={gridHeight}>
    {#each myMap as _, index}
      <div
        class="cell"
        style={`
        grid-column: ${(index % gridWidth) + 1}; 
        grid-row: ${Math.floor(index / gridWidth) + 1};
        background-image: url("${"/tileset/" + _ + ".png"}");
        `}
      >
        {#if _n.length > 0 && !_.includes("water") && Math.random(10) > 0.7}
          {@const _x = _n.pop()}
          <a href="./read/{_x.noteid}">
            <img src={_x.icon} alt="note/tree-icon" class="tree-icon" />
            <div class="popover" style:content={_x.title}>
              {#if _x.title == ""}
                <span style:color="#ffd6ad">{_x.userid}'s</span> Note
              {:else}
                <span style:color="#ffd6ad">{_x.title}</span>
              {/if}
            </div>
          </a>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    z-index: 1;
    position: absolute;
    height: 100dvh;
    width: 100dvw;
    background-color: #0a1c21;
  }
  .garden {
    --size: 32px;
    /* --width: 25;
    --height: 15; */
    position: absolute;
    z-index: 99;
    display: grid;
    inset: 0;
    margin: auto auto;
    grid-template-columns: repeat(var(--width), var(--size));
    grid-template-rows: repeat(var(--height), var(--size));
    width: calc(var(--width) * var(--size));
    height: calc(var(--height) * var(--size));
    border: 4px solid white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    /* margin: 20px auto; */
    background-color: #D4EAC8;
    cursor: none;
  }

  .cell {
    --image: "";
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    /* cursor: pointer;  */
    border: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 0;
    &:hover {
      top: -5px;
      filter: contrast(1.3);
      scale: 1.1;
      box-shadow:
        rgba(0, 0, 0, 0.25) 0px 54px 55px,
        rgba(0, 0, 0, 0.12) 0px -12px 30px,
        rgba(0, 0, 0, 0.12) 0px 4px 6px,
        rgba(0, 0, 0, 0.17) 0px 12px 13px,
        rgba(0, 0, 0, 0.09) 0px -3px 5px;
    }

    &:hover > a > .tree-icon {
      /* top: 0px; */
      scale: 1.2;
      filter: brightness(1.3);
    }
    &:hover > a > .popover {
      visibility: visible;
      opacity: 1;
    }
  }

  .tree-icon {
    z-index: 2;
    position: relative;
    top: -5px;
    max-width: 100%;
    max-height: 100%;
  }

  .popover {
    position: absolute;
    /* height: 40px; */
    /* width: 100px; */
    bottom: 120%; /* Position above the icon */
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    visibility: hidden;
    /* opacity: 0; */
    z-index: 4; /* Ensure it's above the icon */
    color: white;
    font-family: "Fira Code";
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }

  /* Basic arrow styling (optional) */
  .popover::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
</style>
