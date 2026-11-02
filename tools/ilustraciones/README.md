# Ilustraciones de ejercicios

Generador de los pictogramas de los ejercicios del catálogo. Cada ilustración se
arma por código a partir de una pose (posición de la cadera, ángulo del torso y
destino de manos y pies), así todas comparten la misma estética.

- `engine.js`: dibuja la figura, el equipamiento y arma la imagen de dos paneles.
- `base.js`: posturas base (parado, sentado, acostado, colgado...).
- `ej_*.js`: la definición de cada ejercicio de fuerza, por grupo muscular.
- `grupos.js`: imágenes genéricas por grupo muscular (respaldo para ejercicios
  propios de cada gym que no tienen ilustración).
- `base_funcional.js`, `ej_funcional_*.js`, `funcionales.js` y
  `grupos_funcionales.js`: lo mismo para los ejercicios funcionales (ver abajo).

## Regenerar

```sh
cd tools/ilustraciones
npm install
npm run build
```

Deja las imágenes en `final/ejercicios/<id>.png` y `final/grupos/<id>.png`, y
hojas de contacto en `final/_revision/`. Para que el servidor las tome, copiarlas a
`src/seeders/imagenes/ejercicios/` y `src/seeders/imagenes/grupos/`: al arrancar,
el servidor actualiza en la base las que cambiaron (nunca pisa una imagen cargada
a mano).

**Copiar solo las imágenes nuevas o las que se cambiaron a propósito.** Según la
versión de `sharp`/libpng de cada máquina, el mismo dibujo puede salir con otra
compresión: mismos píxeles, distintos bytes. Si se copian todas, el servidor ve
hashes nuevos, reescribe las imágenes en la base y las apps las vuelven a bajar.

## Agregar un ejercicio de fuerza

Sumarlo en el `ej_*.js` de su grupo con el mismo `id` que tiene en
`src/seeders/ejercices.js`, regenerar y revisar la hoja de contacto.

## Ejercicios funcionales

Los funcionales usan ids **1001 en adelante**, sin huecos, y sus categorías ids
**101 a 108** (`src/seeders/gruposFuncionales.js`). Los rangos están reservados para
no chocar con ejercicios o grupos creados a mano en producción.

| Categoría | id | Archivo |
|---|---|---|
| Core | 101 | `ej_funcional_core.js` |
| Cardio | 102 | `ej_funcional_cardio.js` |
| Pliometría | 103 | `ej_funcional_pliometria.js` |
| Tren inferior | 104 | `ej_funcional_inferior.js` |
| Tren superior | 105 | `ej_funcional_superior.js` |
| Cuerpo completo | 106 | `ej_funcional_completo.js` |
| Movilidad | 107 | `ej_funcional_movilidad.js` |
| Elongación | 108 | `ej_funcional_elongacion.js` |

### Agregar un ejercicio funcional

El catálogo es solo del super admin, justamente para que todo ejercicio tenga
su dibujo. Para sumar uno:

1. Elegir el próximo id libre (el último + 1) y cargarlo en
   `src/seeders/ejerciciosFuncionales.js` con su categoría y su tiempo sugerido.
2. Dibujarlo en el `ej_funcional_*.js` de su categoría con el mismo `id` y
   `nombre`. `build_final.js` corta si hay ids repetidos o salteados.
3. `npm run build` y revisar `final/_revision/funcional.html` (o las hojas
   `funcionales_*.png`).
4. Copiar **solo** `final/ejercicios/<id>.png` a `src/seeders/imagenes/ejercicios/`.

Si no tiene dibujo, la API devuelve la imagen genérica de su categoría.

### Opciones del motor para funcionales

Todas son opcionales; si un ejercicio no las usa, sale igual que siempre.

- `sostenido: true` + `pose`: postura sostenida (planchas, isométricos,
  elongaciones). Un solo panel con la figura centrada y un reloj en lugar de
  los números 1 y 2.
- `espejo: true`: refleja la figura (lado izquierdo / derecho de un mismo
  ejercicio, por ejemplo las planchas laterales).
- `curvaTorso` (en la pose, px): curva la columna; positivo = espalda redonda,
  negativo = hundida (gato-camello, cobra).
- `flecha: { arco: { centro, rx, ry, a0, a1 } }`: flecha en arco para rotaciones
  y círculos (ángulos en grados, antihorario).
- Equipamiento nuevo en `E`: `kettlebell`, `soga`, `balon`, `sogasBattle`,
  `pared` (con `blanco` opcional), `remoErgometro`, `airBike` y `palancaBike`.
- En `base_funcional.js`: `planchaAlta`, `flexion`, `cuadrupedia`,
  `bocaArriba`, `sentadillaAbajo`, `elevar` (sube una pose para los saltos),
  `manosDesdeArriba` (recuadro con la posición de las manos) y `deFuerza(id)`
  para reusar el dibujo de un ejercicio de fuerza.
