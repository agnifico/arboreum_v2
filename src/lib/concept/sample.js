// Sample content for the look tests (tk-* = text styling tokens on the screen), until the device reads real notes (build step 4).

export const lines = [
  [{ t: "# ", c: "tk-md" }, { t: "Morning pages", c: "tk-h" }],
  [],
  [{ t: "Woke up before the alarm. The fern on the sill has a new curl, " }, { t: "**", c: "tk-md" }, { t: "third one this week", c: "tk-bold" }, { t: "**", c: "tk-md" }, { t: "." }],
  [],
  [{ t: "- [x] ", c: "tk-md" }, { t: "water the fern", c: "tk-done" }],
  [{ t: "- [ ] ", c: "tk-md" }, { t: "repot the little palm" }],
  [{ t: "- [ ] ", c: "tk-md" }, { t: "write to Mira about Sunday" }],
  [],
  [{ t: "> ", c: "tk-md" }, { t: "plant this one somewhere sunny", c: "tk-quote" }],
];
export const cursorLine = 8;

export const formatKeys = ["B", "I", "U", "S", "H1", "H2", "•", "1.", "☐", "❝", "</>"];

export const notes = [
  { title: "morning-pages", when: "now", tree: "/Flower_tree2.png" },
  { title: "groceries-for-the-week", when: "2h", tree: "/t-red.png" },
  { title: "apple-pie-recipe", when: "1d", tree: "/Tree2.png" },
  { title: "letters-to-mira", when: "3d", tree: "/Palm_tree2_2.png" },
  { title: "zebra-facts", when: "1w", tree: "/t-blue.png" },
  { title: "garden-plans-2026", when: "2w", tree: "/Moss_tree2.png" },
  { title: "books-to-read", when: "1m", tree: "/Snow_tree2.png" },
];
export const selectedNote = 0;

// A tiny pixel map for the Map viewer: w water, s sand, g grass, d dark grass.
export const mapRows = [
  "wwwwwwwwwwww",
  "wwsggggsswww",
  "wsggddgggsww",
  "wsgdddggggsw",
  "wwsggggddgsw",
  "wwwsggggggsw",
  "wwwwssgggsww",
  "wwwwwwssswww",
  "wwwwwwwwwwww",
];
export const plantedTrees = [
  { x: 4, y: 3, src: "/t-red.png" },
  { x: 7, y: 2, src: "/Tree2.png" },
  { x: 8, y: 5, src: "/Palm_tree2_2.png" },
];
export const mapCursor = { x: 5, y: 5 };
