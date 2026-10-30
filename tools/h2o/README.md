# H2O Connect case study generator

`projects/h2o-connect.html` is generated. Edit the sources here, not the HTML.

- `build-h2o.js` writes `projects/h2o-connect.html`. All copy, data and markup live in it. The nav, lightbox, footer and theme toggle are lifted from `projects/pathang-mobility.html`.
- The page's styles live directly in `styles.css`: the block under the `H2O CONNECT` header, plus the bento block and the "H2O v3" rules at the end of the file. Edit them there.
- `build-screens.js` holds the app screens as HTML (`screens/index.html` shows all ten on one board). With `--render` it renders them with Chrome or Edge into `assets/h2o/screen-f1.jpg` … `screen-f10.jpg` and the three hero `cover-*.webp` files.

Run from the site root after an edit:

```bash
node tools/h2o/build-h2o.js
```

After changing a screen:

```bash
node tools/h2o/build-screens.js --render
```

The walkthrough film ("See it in motion") runs the real app screens from `build-screens.js` live inside a phone: build-h2o.js puts them in a `<template data-app>`, and `assets/h2o/film.js` mounts them in a shadow root and animates every frame from a timeline (screens, finger, camera, headlines and callouts). After changing a screen, run both scripts. Its six sounds are CC0 WAVs in `assets/h2o/sfx/`, credited in `sfx/CREDITS.txt`, and play only when the visitor turns sound on.

`app-critique.md` is the full critique of the app; `app-fix-spec.md` lists the fixes and which are built.
