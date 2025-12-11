<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { placementMode, selectedCoordinates, editorCoordinates, isMapVisible } from "$lib/stores.js";
  import { base } from "$app/paths";

  let { notes = [] } = $props();

  const TILE_SIZE = 32;
  const GRID_WIDTH = 25;
  const GRID_HEIGHT = 15;

  let canvas;
  let notesOnMap = [];
  let hoveredTile = $state({ x: -1, y: -1 });
  let tooltip = $state({ visible: false, content: "", x: 0, y: 0 });
  let isHoveringOccupiedTile = $state(false);

  const myMap = [
    "water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","waterPlant","water0","waterRock","water0","water0","waterPlant","waterPlant","water0","water0","water0","grass1","grass3","water0","water0","water0","waterRock","grass1","grass2","grass2","grass15","grass2","grass3","water0","water0","water0","grass11","grass12","water0","waterPlant","grass1","grass3","water0","waterPlant","grass11","grass2","grass5","grass5","grass3","water0","water0","grass1","grass5","grass5","grass9","waterPlant","grass7","grass6","water0","water0","water0","water0","water0","water0","grass1","grass5","grass5","grass3","water0","water0","grass7","grass8","grass5","grass6","water0","water0","grass4","grass5","grass6","waterPlant","water0","water0","grass14","water0","water0","water0","waterPlant","water0","grass1","grass5","grass5","grass8","grass8","grass3","water0","water0","water0","grass7","grass6","water0","grass1","grass5","grass5","grass9","water0","water0","waterPlant","grass14","waterRock","water0","water0","water0","grass1","grass5","grass5","grass9","water0","water0","grass13","water0","grass11","grass12","water0","grass13","water0","grass4","grass5","grass6","waterBoat2","water0","water0","grass1","grass6","water0","water0","water0","water0","grass4","grass5","grass6","water0","waterRock","water0","water0","water0","water0","water0","waterPlant","water0","grass1","grass5","grass8","grass9","water0","water0","grass1","grass5","grass9","water0","waterPlant","water0","water0","grass7","grass5","grass5","grass3","water0","water0","grass10","water0","water0","water0","water0","water0","grass4","grass6","water0","water0","water0","grass1",
    "grass5","grass6","water0","water0","water0","water0","water0","water0","grass7","grass5","grass5","grass2","grass2","grass9","water0","grass11","grass12","water0","grass1","grass5","grass6","water0","water0","grass1","grass5","grass5","grass9","water0","water0","water0","water0","water0","water0","waterBoat1","grass7","grass5","grass5","grass9","water0","water0","waterPlant","water0","water0","grass4","grass5","grass6","water0","grass1","grass5","grass5","grass9","water0","grass1","grass3","water0","water0","waterPlant","water0","water0","water0","grass7","grass9","water0","waterRock","water0","water0","waterBoat1","water0","grass4","grass5","grass6","water0","grass7","grass8","grass9","water0","water0","grass7","grass9","water0","water0","water0","grass1","grass3","water0","water0","water0","water0","water0","water0","grass1","grass3","water0","grass7","grass8","grass6","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","grass7","grass9","water0","waterPlant","grass1","grass3","water0","grass1","grass5","grass6","water0","water0","water0","grass13","water0","grass1","grass2","grass3","waterPlant","grass1","grass3","water0","water0","water0","water0","water0","water0","waterPlant","grass11","grass8","grass9","water0","grass7","grass8","grass8","grass12","water0","water0","water0","water0","grass7","grass8","grass8","grass15","grass8","grass9","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","waterPlant","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0","water0",
  ];

  const tileSources = {
    grass1: "/tileset/grass1.png",
    grass2: "/tileset/grass2.png",
    grass3: "/tileset/grass3.png",
    grass4: "/tileset/grass4.png",
    grass5: "/tileset/grass5.png",
    grass6: "/tileset/grass6.png",
    grass7: "/tileset/grass7.png",
    grass8: "/tileset/grass8.png",
    grass9: "/tileset/grass9.png",
    grass10: "/tileset/grass10.png",
    grass11: "/tileset/grass11.png",
    grass12: "/tileset/grass12.png",
    grass13: "/tileset/grass13.png",
    grass14: "/tileset/grass14.png",
    grass15: "/tileset/grass15.png",
    water0: "/tileset/water0.png",
    waterBoat1: "/tileset/waterBoat1.png",
    waterBoat2: "/tileset/waterBoat2.png",
    waterPlant: "/tileset/waterPlant.png",
    waterRock: "/tileset/waterRock.png",
  };

  let tileImages = {};
  let noteImages = {};

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base + src;
    });
  }

  async function loadAssets() {
    const tilePromises = Object.entries(tileSources).map(async ([key, src]) => {
      tileImages[key] = await loadImage(src);
    });

    const noteIconSrcs = [...new Set(notes.map(n => n.icon).filter(Boolean))];
    const notePromises = noteIconSrcs.map(async (src) => {
        if (!noteImages[src]) {
            noteImages[src] = await loadImage(src);
        }
    });

    await Promise.all([...tilePromises, ...notePromises]);
  }

  function drawMap() {
    if (!canvas || !Object.keys(tileImages).length) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background tiles
    myMap.forEach((tileKey, index) => {
      const x = (index % GRID_WIDTH) * TILE_SIZE;
      const y = Math.floor(index / GRID_WIDTH) * TILE_SIZE;
      if (tileImages[tileKey]) {
        ctx.drawImage(tileImages[tileKey], x, y, TILE_SIZE, TILE_SIZE);
      }
    });

    // Draw hover effect
    if (hoveredTile.x !== -1 && hoveredTile.y !== -1) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(hoveredTile.x * TILE_SIZE, hoveredTile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Place and draw notes
    notesOnMap = [];
    notes.forEach(note => {
      if (note.mapX !== null && note.mapY !== null) {
        const x = note.mapX * TILE_SIZE;
        const y = note.mapY * TILE_SIZE;

        const noteImage = noteImages[note.icon];
        if (noteImage) {
            const iconWidth = noteImage.width / 2;
            const iconHeight = noteImage.height / 2;
            const drawX = x + (TILE_SIZE - iconWidth) / 2;
            const drawY = y + (TILE_SIZE - iconHeight) / 2;
            ctx.drawImage(noteImage, drawX, drawY, iconWidth, iconHeight);
            notesOnMap.push({ note, x, y, width: TILE_SIZE, height: TILE_SIZE });
        }
      }
    });

    // Draw selected highlight from editor
    if ($editorCoordinates) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        $editorCoordinates.x * TILE_SIZE + 1,
        $editorCoordinates.y * TILE_SIZE + 1,
        TILE_SIZE - 2,
        TILE_SIZE - 2
      );
    }
  }

  function closeMap() {
    isMapVisible.set(false);
    placementMode.set(false);
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeMap();
    }
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if ($placementMode) {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);

      const isOccupied = notesOnMap.some(
        (item) => item.note.mapX === tileX && item.note.mapY === tileY
      );

      if (!isOccupied) {
        selectedCoordinates.set({ x: tileX, y: tileY });
        closeMap();
      }
    } else {
      for (const item of notesOnMap) {
        if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
          goto(`${base}/read/${item.note.noteid}`);
          break;
        }
      }
    }
  }

  function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileX !== hoveredTile.x || tileY !== hoveredTile.y) {
      hoveredTile = { x: tileX, y: tileY };
      
      const hoveredNote = notesOnMap.find(item => 
        tileX * TILE_SIZE >= item.x && tileX * TILE_SIZE < item.x + item.width &&
        tileY * TILE_SIZE >= item.y && tileY * TILE_SIZE < item.y + item.height
      );

      isHoveringOccupiedTile = !!hoveredNote;

      if (hoveredNote) {
        tooltip = {
          visible: true,
          content: hoveredNote.note.title || "Untitled Note",
          x: rect.left + hoveredNote.x + (hoveredNote.width / 2),
          y: rect.top + hoveredNote.y
        };
      } else {
        tooltip.visible = false;
      }
      
      requestAnimationFrame(drawMap);
    }
  }

  function handleMouseLeave() {
    hoveredTile = { x: -1, y: -1 };
    tooltip.visible = false;
    requestAnimationFrame(drawMap);
  }

  onMount(async () => {
    await loadAssets();
    drawMap();
  });

  $effect(async () => {
    if (notes) {
      await loadAssets();
      drawMap();
    }
  });

  $effect(() => {
    if ($editorCoordinates) {
      drawMap();
    }
  });
</script>

<div class="container" on:click={handleBackdropClick}>
  <canvas
    bind:this={canvas}
    width={GRID_WIDTH * TILE_SIZE}
    height={GRID_HEIGHT * TILE_SIZE}
    on:click={handleCanvasClick}
    on:mousemove={handleMouseMove}
    on:mouseleave={handleMouseLeave}
    class="garden"
    class:placement-mode={$placementMode}
    class:hovering-occupied={$placementMode && isHoveringOccupiedTile}
  ></canvas>
  {#if tooltip.visible}
  <div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y - 10}px;">
    {tooltip.content}
  </div>
  {/if}
</div>

<style>
  .container {
    z-index: 2;
    position: absolute;
    height: 100dvh;
    width: 100dvw;
    background-color: rgba(10, 28, 33, 0.8); /* Darker lightbox effect */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .garden {
    border: 4px solid white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    background-color: #d4eac8;
    cursor: pointer;
  }
  .garden.placement-mode {
    cursor: crosshair;
  }
  .garden.placement-mode.hovering-occupied {
    cursor: not-allowed;
  }
  .tooltip {
    position: fixed;
    background-color: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    transform: translateX(-45%) translateY(-100%);
    font-family: "Arvo";
  }

  .tooltip::after {
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