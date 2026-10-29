# Ilustraciones de ejercicios

Generador de los pictogramas de los ejercicios del catálogo. Cada ilustración se
arma por código a partir de una pose (posición de la cadera, ángulo del torso y
destino de manos y pies), así todas comparten la misma estética.

- `engine.js`: dibuja la figura, el equipamiento y arma la imagen de dos paneles.
- `base.js`: posturas base (parado, sentado, acostado, colgado...).
- `ej_*.js`: la definición de cada ejercicio, por grupo muscular.
- `grupos.js`: imágenes genéricas por grupo muscular (respaldo para ejercicios
  propios de cada gym que no tienen ilustración).

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

## Agregar un ejercicio

Sumarlo en el `ej_*.js` de su grupo con el mismo `id` que tiene en
`src/seeders/ejercices.js`, regenerar y revisar la hoja de contacto.
