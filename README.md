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
```

## Adding your CV PDF

The "Download CV" button links to `assets/cv/Ededa-Bleoussi-CV.pdf`.
Drop your real CV PDF in `assets/cv/` with exactly that file name and the
button will work - no code changes needed. See
`assets/cv/PUT-YOUR-CV-HERE.txt` for details.

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
