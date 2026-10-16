// The garden map, the same 25 × 15 tiles as the classic app's map
// (copied from src/routes/Garden.svelte, which the concept doesn't touch),
// so a note's plot (mapX, mapY) means the same place in both.
export const COLS = 25;
export const ROWS = 15;

export const TILES = [
  "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0",
  "water0", "waterPlant", "water0", "waterRock", "water0", "water0", "waterPlant", "waterPlant", "water0", "water0", "water0", "grass1", "grass3", "water0", "water0", "water0", "waterRock", "grass1", "grass2", "grass2", "grass15", "grass2", "grass3", "water0", "water0",
  "water0", "grass11", "grass12", "water0", "waterPlant", "grass1", "grass3", "water0", "waterPlant", "grass11", "grass2", "grass5", "grass5", "grass3", "water0", "water0", "grass1", "grass5", "grass5", "grass9", "waterPlant", "grass7", "grass6", "water0", "water0",
  "water0", "water0", "water0", "water0", "grass1", "grass5", "grass5", "grass3", "water0", "water0", "grass7", "grass8", "grass5", "grass6", "water0", "water0", "grass4", "grass5", "grass6", "waterPlant", "water0", "water0", "grass14", "water0", "water0",
  "water0", "waterPlant", "water0", "grass1", "grass5", "grass5", "grass8", "grass8", "grass3", "water0", "water0", "water0", "grass7", "grass6", "water0", "grass1", "grass5", "grass5", "grass9", "water0", "water0", "waterPlant", "grass14", "waterRock", "water0",
  "water0", "water0", "grass1", "grass5", "grass5", "grass9", "water0", "water0", "grass13", "water0", "grass11", "grass12", "water0", "grass13", "water0", "grass4", "grass5", "grass6", "waterBoat2", "water0", "water0", "grass1", "grass6", "water0", "water0",
  "water0", "water0", "grass4", "grass5", "grass6", "water0", "waterRock", "water0", "water0", "water0", "water0", "water0", "waterPlant", "water0", "grass1", "grass5", "grass8", "grass9", "water0", "water0", "grass1", "grass5", "grass9", "water0", "waterPlant",
  "water0", "water0", "grass7", "grass5", "grass5", "grass3", "water0", "water0", "grass10", "water0", "water0", "water0", "water0", "water0", "grass4", "grass6", "water0", "water0", "water0", "grass1", "grass5", "grass6", "water0", "water0", "water0",
  "water0", "water0", "water0", "grass7", "grass5", "grass5", "grass2", "grass2", "grass9", "water0", "grass11", "grass12", "water0", "grass1", "grass5", "grass6", "water0", "water0", "grass1", "grass5", "grass5", "grass9", "water0", "water0", "water0",
  "water0", "water0", "water0", "waterBoat1", "grass7", "grass5", "grass5", "grass9", "water0", "water0", "waterPlant", "water0", "water0", "grass4", "grass5", "grass6", "water0", "grass1", "grass5", "grass5", "grass9", "water0", "grass1", "grass3", "water0",
  "water0", "waterPlant", "water0", "water0", "water0", "grass7", "grass9", "water0", "waterRock", "water0", "water0", "waterBoat1", "water0", "grass4", "grass5", "grass6", "water0", "grass7", "grass8", "grass9", "water0", "water0", "grass7", "grass9", "water0",
  "water0", "water0", "grass1", "grass3", "water0", "water0", "water0", "water0", "water0", "water0", "grass1", "grass3", "water0", "grass7", "grass8", "grass6", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0",
  "water0", "water0", "grass7", "grass9", "water0", "waterPlant", "grass1", "grass3", "water0", "grass1", "grass5", "grass6", "water0", "water0", "water0", "grass13", "water0", "grass1", "grass2", "grass3", "waterPlant", "grass1", "grass3", "water0", "water0",
  "water0", "water0", "water0", "water0", "waterPlant", "grass11", "grass8", "grass9", "water0", "grass7", "grass8", "grass8", "grass12", "water0", "water0", "water0", "water0", "grass7", "grass8", "grass8", "grass15", "grass8", "grass9", "water0", "water0",
  "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "waterPlant", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0", "water0",
].flat();

export const tileSrc = (key) => `/tileset/${key}.png`;

const cache = new Map();
/** Load (once) and return an image element. */
export function image(src) {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      })
    );
  }
  return cache.get(src);
}
