# jdd3021.github.io

Personal CV / resume website for **Edéda Bleoussi** - Software Engineer | Data & AI.
Live at: https://jdd3021.github.io/

100% static (plain HTML, CSS, and vanilla JS) - no build step, no framework, no backend.
Works out of the box with GitHub Pages.

## Structure

```
index.html          page content
css/style.css        styles (includes the print/PDF stylesheet)
js/main.js            nav, scroll reveal, EN/FR toggle logic
js/i18n.js            EN/FR text dictionary
assets/favicon.svg    site favicon (EB monogram)
assets/cv/            put your downloadable CV PDF here (see below)
assets/img/           put your profile photo here (see below)
```

## Adding your CV PDF

The "Download CV" button links to `assets/cv/Ededa-Bleoussi-CV.pdf`.
Drop your real CV PDF in `assets/cv/` with exactly that file name and the
button will work - no code changes needed. See
`assets/cv/PUT-YOUR-CV-HERE.txt` for details.

## Adding your profile photo

The hero section looks for a photo at `assets/img/profile.jpg`. Until that
file exists, an "EB" monogram placeholder is shown automatically. Drop a
photo there with exactly that file name (a square photo, ideally at least
400x400px) and it will replace the placeholder - no code changes needed.

## Updating the site later

If you make changes and the live site still shows the old version after a
few minutes, it's almost always a browser cache issue, not a bad deploy.
Do a hard refresh (Ctrl+Shift+R) or bump the `?v=` query string on the
`css/style.css`, `js/i18n.js`, and `js/main.js` tags in `index.html`.

## Local preview

Just open `index.html` in a browser, or serve the folder with any static
server, e.g.:

```
npx http-server .
```

## Deploying

```
git add .
git commit -m "Update CV site"
git push
```

Then, on GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
Since this repo is named `jdd3021.github.io`, GitHub Pages serves it at the
domain root automatically - no extra configuration needed.
