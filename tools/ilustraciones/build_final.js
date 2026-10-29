// Genera las imagenes finales: final/ejercicios/<id>.png y final/grupos/<id>.png
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

(async () => {
  const ejercicios = require('./ejercicios');
  const ids = ejercicios.map(e => e.id);
  const faltan = Array.from({ length: 90 }, (_, i) => i + 1).filter(i => !ids.includes(i));
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (faltan.length || dup.length) throw new Error(`faltan ${faltan} / duplicados ${dup}`);

  const dE = 'final/ejercicios', dG = 'final/grupos', dH = 'final/_revision';
  for (const d of [dE, dG, dH]) fs.mkdirSync(d, { recursive: true });

  const hechos = [];
  for (const ej of ejercicios) {
    const png = path.join(dE, `${ej.id}.png`);
    await sharp(Buffer.from(render(ej))).png(PNG).toFile(png);
    hechos.push({ ...ej, png });
  }
  const grupos = [];
  for (const g of require('./grupos')) {
    const png = path.join(dG, `${g.id}.png`);
    await sharp(Buffer.from(renderGrupo(g.pose, g.musculos))).png(PNG).toFile(png);
    grupos.push({ ...g, png });
  }
  await hojas(hechos, dH, 'ejercicios_');
  await hojas(grupos, dH, 'grupos_');
  console.log(`${hechos.length} ejercicios, ${grupos.length} grupos`);
})().catch(e => { console.error(e); process.exit(1); });
