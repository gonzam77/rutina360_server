// Genera las imagenes finales: final/ejercicios/<id>.png y final/grupos/<id>.png
// (ejercicios de fuerza 1..90 y funcionales 1001+; grupos 1..14 y categorias
// funcionales 101..108), mas las hojas de revision en final/_revision/.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { render, renderGrupo } = require('./engine');

const PNG = { compressionLevel: 9, palette: true, quality: 95, dither: 0 };

async function hojas(items, dir, prefijo) {
  const w = 800 * 0.6, h = 400 * 0.6, cols = 2, porHoja = 8;
  for (let p = 0; p * porHoja < items.length; p++) {
    const g = items.slice(p * porHoja, p * porHoja + porHoja);
    const filas = Math.ceil(g.length / cols);
    const tiles = [];
    for (const [i, it] of g.entries()) {
      const left = (i % cols) * w, top = Math.floor(i / cols) * (h + 22);
      tiles.push({ input: await sharp(it.png).resize(w, h).toBuffer(), left, top: top + 22 });
      tiles.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22"><rect width="100%" height="100%" fill="#000"/><text x="6" y="16" font-family="DejaVu Sans" font-size="13" fill="#fff">${it.id} · ${it.nombre}</text></svg>`), left, top });
    }
    await sharp({ create: { width: cols * w, height: filas * (h + 22), channels: 3, background: '#000' } })
      .composite(tiles).png().toFile(path.join(dir, `${prefijo}${p + 1}.png`));
  }
}

// Hoja de revision de los funcionales: una grilla con la miniatura, el id, el
// nombre y la categoria, y una casilla para marcar las que hay que corregir.
// Las imagenes van embebidas para poder mandar el HTML solo.
function hojaHtml(ejercicios, categorias, destino) {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const tarjeta = (it, etiqueta) =>
    `<label class="t"><img src="data:image/png;base64,${fs.readFileSync(it.png).toString('base64')}" alt="">` +
    `<span class="n"><input type="checkbox" data-id="${it.id}"> <b>${it.id}</b> · ${esc(it.nombre)}</span>` +
    `<span class="c">${esc(etiqueta)}</span></label>`;
  const porCategoria = {};
  for (const e of ejercicios) (porCategoria[e.categoria] ||= []).push(e);
  const secciones = Object.entries(porCategoria)
    .map(([cat, lista]) => `<h2>${esc(cat)} <small>${lista.length}</small></h2><div class="g">${lista.map(e => tarjeta(e, cat)).join('')}</div>`)
    .join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisión de ilustraciones funcionales</title>
<style>
body{margin:0;padding:16px;background:#0B111D;color:#D5DEF0;font-family:system-ui,sans-serif}
h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#9AA7C0;font-size:14px}
h2{font-size:16px;margin:24px 0 8px;color:#46ED34}h2 small{color:#9AA7C0;font-weight:400}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.t{display:flex;flex-direction:column;background:#16223A;border:1px solid #2B374A;border-radius:10px;overflow:hidden;cursor:pointer}
.t img{width:100%;display:block}.n{padding:8px 10px 0;font-size:14px}.c{padding:2px 10px 10px;font-size:12px;color:#9AA7C0}
.t:has(input:checked){border-color:#D58691;box-shadow:0 0 0 2px #D58691 inset}
#marcadas{position:sticky;top:0;background:#0B111D;padding:8px 0;font-size:14px;z-index:1}
#copiar{margin-left:8px;background:#46ED34;color:#0B111D;border:0;border-radius:6px;padding:4px 10px;font-weight:600;cursor:pointer}#ok{color:#9AA7C0;margin-left:6px}
</style></head><body>
<h1>Ilustraciones de los ejercicios funcionales</h1>
<p>${ejercicios.length} ejercicios y ${categorias.length} imágenes de categoría. Marcá las que hay que corregir, tocá <b>Copiar números</b> y pegámelos en el chat (las marcas no se guardan en el archivo).</p>
<div id="marcadas">Marcadas: <b id="lista">ninguna</b> <button id="copiar" type="button">Copiar números</button> <span id="ok"></span></div>
${secciones}
<h2>Imágenes de categoría <small>${categorias.length}</small></h2><div class="g">${categorias.map(g => tarjeta(g, 'Respaldo de la categoría')).join('')}</div>
<script>
// Las marcas quedan solo en este navegador: para pasarlas, copiar la lista.
const marcadas=()=>[...document.querySelectorAll('input:checked')].map(i=>i.dataset.id);
document.addEventListener('change',()=>{const ids=marcadas();document.getElementById('lista').textContent=ids.length?ids.join(', '):'ninguna'});
document.getElementById('copiar').addEventListener('click',async()=>{const t=marcadas().join(', ');try{await navigator.clipboard.writeText(t);document.getElementById('ok').textContent=t?'Copiado':'No hay marcadas'}catch{document.getElementById('ok').textContent=t}});
</script></body></html>`;
  fs.writeFileSync(destino, html);
}

(async () => {
  const base = require('./ejercicios');
  const funcionales = require('./funcionales');
  const ejercicios = [...base, ...funcionales];
  const ids = ejercicios.map(e => e.id);
  const faltan = Array.from({ length: 90 }, (_, i) => i + 1).filter(i => !ids.includes(i));
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  // Los funcionales van del 1001 en adelante, sin huecos.
  const idsF = funcionales.map(e => e.id);
  const fueraDeRango = idsF.filter((id, i) => id !== 1001 + i);
  if (faltan.length || dup.length || fueraDeRango.length) {
    throw new Error(`faltan ${faltan} / duplicados ${dup} / funcionales fuera de orden ${fueraDeRango}`);
  }

  const dE = 'final/ejercicios', dG = 'final/grupos', dH = 'final/_revision';
  for (const d of [dE, dG, dH]) fs.mkdirSync(d, { recursive: true });

  const hechos = [];
  for (const ej of ejercicios) {
    const png = path.join(dE, `${ej.id}.png`);
    await sharp(Buffer.from(render(ej))).png(PNG).toFile(png);
    hechos.push({ ...ej, png });
  }
  const grupos = [];
  for (const g of [...require('./grupos'), ...require('./grupos_funcionales')]) {
    const png = path.join(dG, `${g.id}.png`);
    await sharp(Buffer.from(renderGrupo(g.pose, g.musculos))).png(PNG).toFile(png);
    grupos.push({ ...g, png });
  }
  const esFuncional = it => it.id > 1000 || (it.id > 100 && it.id < 1000);
  await hojas(hechos.filter(it => !esFuncional(it)), dH, 'ejercicios_');
  await hojas(grupos.filter(it => !esFuncional(it)), dH, 'grupos_');
  await hojas(hechos.filter(esFuncional), dH, 'funcionales_');
  await hojas(grupos.filter(esFuncional), dH, 'categorias_funcionales_');
  hojaHtml(hechos.filter(esFuncional), grupos.filter(esFuncional), path.join(dH, 'funcional.html'));
  console.log(`${hechos.length} ejercicios (${hechos.filter(esFuncional).length} funcionales), ${grupos.length} grupos`);
})().catch(e => { console.error(e); process.exit(1); });
