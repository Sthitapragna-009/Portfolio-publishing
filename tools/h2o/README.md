# H2O Connect case study generator

`projects/h2o-connect.html` is generated. Edit the sources here, not the HTML.

- `build-h2o.js` writes `projects/h2o-connect.html`. All copy, data and markup live in it. The nav, lightbox, footer and theme toggle are lifted from `projects/pathang-mobility.html`.
- `h2o.css` is the H2O block of `styles.css`, which is always the last block in that file.
- `sync-css.js` replaces everything from the `H2O CONNECT` header in `styles.css` down with `h2o.css`.

Run both from the site root after an edit:

```bash
node tools/h2o/build-h2o.js && node tools/h2o/sync-css.js
```

Site-wide rules go above the H2O block in `styles.css`. Anything below that header is overwritten by the sync.

The walkthrough animation's timeline is in `assets/h2o/film.js`.
