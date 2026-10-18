// Genera la app del viaje a Japón a partir de japon/app.html.
//   node japon/build.js                 -> public/japon/index.html (documento completo, servido en /japon)
//   node japon/build.js --fragment out  -> además escribe un fragmento sin <head> (para publicarlo como Artifact)
const fs = require('fs')
const path = require('path')

const dir = __dirname
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8')

const app = read('app.html')
  .replace('/*LEAFLET_CSS*/', () => read('leaflet-1.9.4.css'))
  .replace('/*COAST*/[]', () => read('japan-coast.json').trim())

const title = app.match(/<title>.*?<\/title>/)[0]
const body = app.replace(title + '\n', '')

const doc = `<!doctype html>
<html lang="es" data-tiles="osm">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Japón 2026">
${title}
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`

const out = path.join(dir, '..', 'public', 'japon', 'index.html')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, doc)
console.log('wrote', path.relative(process.cwd(), out), doc.length, 'bytes')

const i = process.argv.indexOf('--fragment')
if (i > -1) {
  fs.writeFileSync(process.argv[i + 1], app)
  console.log('wrote', process.argv[i + 1], app.length, 'bytes')
}
