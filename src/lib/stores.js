import { writable } from 'svelte/store';

export const isFullscreen = writable(false);
export const placementMode = writable(false);
export const selectedCoordinates = writable(null);
export const editorCoordinates = writable(null);
export const isMapVisible = writable(false);
export const editorStore = writable(null);