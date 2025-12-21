import { writable } from 'svelte/store';

// --- Original Stores ---
export const isFullscreen = writable(false);
export const placementMode = writable(false);
export const selectedCoordinates = writable(null);
export const editorCoordinates = writable(null);
export const isMapVisible = writable(false);
export const editorStore = writable(null);

// --- Centralized UI State Management Functions ---

/**
 * Toggles the fullscreen state of the editor.
 */
export function toggleFullscreen() {
  isFullscreen.update(n => !n);
}

/**
 * Toggles the visibility of the map.
 * If the map is being opened, it does not enter placement mode.
 * If the map is being closed, it also ensures placement mode is turned off.
 */
export function toggleMap() {
  isMapVisible.update(visible => {
    const newVisibility = !visible;
    if (!newVisibility) {
      // If we are closing the map, always exit placement mode.
      placementMode.set(false);
    }
    return newVisibility;
  });
}

/**
 * Enters map placement mode from the editor.
 */
export function enterPlacementMode() {
  isMapVisible.set(true);
  placementMode.set(true);
}

/**
 * Closes the map and exits placement mode.
 * This is intended to be called from the Garden/Map component itself.
 */
export function closeMap() {
  isMapVisible.set(false);
  placementMode.set(false);
}

/**
 * Resets all UI states related to the editor.
 * Intended to be called when the editor component is destroyed.
 */
export function exitEditor() {
  isFullscreen.set(false);
  placementMode.set(false);
  isMapVisible.set(false);
  editorCoordinates.set(null);
}
