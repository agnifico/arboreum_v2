// The note a new ARB-16A starts with: every kind of formatting the screen can
// show (no images or links), plus the keys you need.
export const WELCOME_ID = "welcome-JXF26-ARB-16A";

export const WELCOME = {
  noteid: WELCOME_ID,
  title: "Welcome to Arboreum",
  icon: "/Flower_tree2.png",
  text: [
    "<h1>Welcome to Arboreum</h1>",
    "<p>Notes that grow into <strong>trees</strong> on a little map. This note shows everything the screen can do.</p>",
    "<h2>Keys</h2>",
    "<ul>",
    "<li><p><strong>Ctrl/⌘ K</strong> opens the Start menu, from anywhere.</p></li>",
    "<li><p><strong>A</strong> saves. <strong>B</strong> starts a new note, and the one you were on is saved first.</p></li>",
    "<li><p>Arrows are the D-pad, Enter is A, Esc is B. Or just click and type.</p></li>",
    "</ul>",
    "<h2>Formatting</h2>",
    "<p><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, <mark>highlight</mark> and <code>inline code</code>.</p>",
    '<p>H<sub>2</sub>O and E = mc<sup>2</sup>, with a little <span style="color: #ffd166">colour</span> too.</p>',
    "<h3>Lists</h3>",
    "<ol><li><p>Numbered</p></li><li><p>in order</p></li></ol>",
    "<ul><li><p>Bullets</p><ul><li><p>nest with Tab</p></li></ul></li></ul>",
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>open this note</p></div></li>',
    '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>plant your own tree on the map. -- tree picker (right) --></p></div></li>',
    "</ul>",
    "<blockquote><p>Every note grows into a tree. Bit by bit, your notes become a garden.</p></blockquote>",
    "<pre><code>// code blocks keep their spacing\nplant(note, { x: 12, y: 7 })</code></pre>",
    "<hr>",
    "<p><b>Arboreum</b> is a conceptual project where specialised handheld electronics of the past meets modern day web design. <br>Classic note taking reimagined, with customisation within structure.<br></p>",
    "<p>Press <strong>B</strong> when you're ready for your own first note.<br><br></p>",
  ].join(""),
};
