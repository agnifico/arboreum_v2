# Arboreum

A notes app built as a modular retro handheld: swappable modules, clicky keys, and every note grows into a pixel tree.

Arboreum is a note-taking app designed as a piece of retro consumer electronics. Its console, the JXF26-ARB-16A, is a set of
swappable modules around a writing screen: a D-pad, A and B keys, a map viewer, a camera. Slot modules in and out,
rearrange them and recolour the whole console: the customisation modular hardware promises, without hardware's limits.
Underneath is a calm monospace editor, and every note you save grows into a pixel tree on a little map, so over time your
notes become a garden. No account, no server: your notes stay in your browser.

By [JunesForge](https://junesforge.com). The design and its reasoning are in [CONCEPT.md](CONCEPT.md) and on the site's
Story page.

## Developing

Built with SvelteKit and deployed on Vercel.

```bash
npm install
npm run dev      # the dev server
npm run build    # a production build
npm run preview  # preview the build
```

The device lives at `/`; the About, Help and Story pages at `/about`, `/help` and `/story`; the first Arboreum at `/classic`.
