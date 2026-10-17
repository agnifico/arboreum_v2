// The device renders only in the browser: its notes, images and remembered
// Configure settings all live there, and its layout fits the window, so a
// server render would only be a guess at both. app.html paints the saved
// theme's mat while it loads.
export const ssr = false;
