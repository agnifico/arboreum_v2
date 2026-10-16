// The trees a note can grow into (sprites live in /static). Shared by the
// details strip, the Treemoji module and the drawer.
export const TREES = [
  { name: "Snowy tree", src: "/Snow_tree2.png" },
  { name: "Golden tree", src: "/t-yellow.png" },
  { name: "Green tree", src: "/t-green.png" },
  { name: "Blossom tree", src: "/Flower_tree2.png" },
  { name: "Palm tree", src: "/Palm_tree2_2.png" },
  { name: "Mossy tree", src: "/Moss_tree2.png" },
  { name: "Red tree", src: "/t-red.png" },
  { name: "Frosty pine", src: "/Snow_christmass_tree2.png" },
  { name: "Classic tree", src: "/Tree2.png" },
  { name: "Blue tree", src: "/t-blue.png" },
  { name: "Little palm", src: "/Palm_tree1_2.png" },
];

export const treeName = (src) => TREES.find((t) => t.src === src)?.name ?? "Tree";
