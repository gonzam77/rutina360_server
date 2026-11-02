// Prueba de punta a punta de los entrenamientos funcionales contra un
// servidor LOCAL ya levantado (npm run dev:local) con los usuarios de
// `npm run usuarios:local`.
//
//   node scripts/prueba-funcional.js [http://127.0.0.1:5000]
//
// Cubre: catalogo con y sin filtro, alta y edicion de funcionales (con
// ejercicios repetidos y validaciones), ejercicios repetidos en fuerza,
// asignacion, compartir, clientes viejos (sin el header) y nuevos, e imagenes
// (304 con ETag y respaldo de la categoria). Deja datos de prueba en la base
// local; no la uses contra produccion.

const BASE = process.argv[2] || 'http://127.0.0.1:5000';
const CLAVE = 'rutina360';
const NUEVO = { 'X-Rutina360-Funcional': '1' };

let fallas = 0;
let pasos = 0;
function ok(condicion, mensaje, extra) {
  pasos += 1;
  if (condicion) {
    console.log(`  ok  ${mensaje}`);
  } else {
    fallas += 1;
    console.log(`  MAL ${mensaje}`, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : '');
  }
}

async function pedir(metodo, ruta, { token, body, headers = {} } = {}) {
  const r = await fetch(BASE + ruta, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const tipo = r.headers.get('content-type') || '';
  const datos = tipo.includes('json') ? await r.json().catch(() => ({})) : await r.arrayBuffer();
  return { status: r.status, body: datos, headers: r.headers };
}

async function login(email) {
  const r = await pedir('POST', '/users/auth', { body: { email, password: CLAVE } });
  if (r.status !== 200) throw new Error(`No se pudo entrar como ${email}: ${r.status}`);
  return { token: r.body.data.accessToken, user: r.body.data.user };
}

const ejerciciosDe = (rutina) => rutina?.Routine_Ejercices || [];

(async () => {
  const gym = await login('gym@rutina360.local');
  const atleta = await login('atleta@rutina360.local');
  const admin = await login(process.env.SUPERADMIN_EMAIL || 'admin@rutina360.local');

  console.log('\nCatalogo');
  const grupos = await pedir('GET', '/muscleGroup');
  const funcionales = grupos.body.data.filter((g) => g.kind === 'functional');
  ok(funcionales.length >= 8, 'sin filtro devuelve tambien las categorias funcionales', funcionales.length);
  ok(grupos.body.data.every((g) => g.kind), 'todos los grupos traen kind');
  const soloF = await pedir('GET', '/muscleGroup?kind=functional');
  ok(soloF.body.data.length === funcionales.length && soloF.body.data.every((g) => g.kind === 'functional'), '?kind=functional filtra');
  const ejF = await pedir('GET', '/ejercice?kind=functional');
  ok(ejF.body.data.length >= 85 && ejF.body.data.every((e) => e.id > 1000 || e.idMuscleGroup >= 100), 'ejercicios ?kind=functional', ejF.body.data.length);
  ok(ejF.body.data.find((e) => e.id === 1001)?.defaultWorkSeconds === 40, 'tiempo sugerido de Plancha frontal = 40 s');
  const ejS = await pedir('GET', '/ejercice?kind=strength');
  ok(ejS.body.data.length >= 90 && !ejS.body.data.some((e) => e.id >= 1001 && e.id <= 1085), 'ejercicios ?kind=strength sin funcionales');

  console.log('\nAlta de funcional');
  const bloques = [
    { idEjercice: 1001, workSeconds: 45, restSeconds: 15, comments: 'Cadera alineada' },
    { idEjercice: 1006, workSeconds: 40, restSeconds: 20 },
    { idEjercice: 1021, workSeconds: 30, restSeconds: 0 },
    { idEjercice: 1001, workSeconds: 45, restSeconds: 10 }, // repetido a proposito
  ];
  const alta = await pedir('POST', '/routine', {
    token: gym.token,
    headers: NUEVO,
    body: { name: 'Core express', order: 1, kind: 'functional', rounds: 3, roundRestSeconds: 60, defaultMode: 'manual', exercises: bloques },
  });
  ok(alta.status === 201, 'crea un funcional que repite un ejercicio', alta.body);
  const idF = alta.body.data?.id;
  ok(alta.body.data?.kind === 'functional' && alta.body.data?.rounds === 3 && alta.body.data?.defaultMode === 'manual', 'guarda kind, vueltas y modo');
  // 3 vueltas de (45+15+40+20+30+0+45) menos el ultimo descanso de cada vuelta
  // (10) + 2 descansos entre vueltas (60): 3*185 + 120 = 675 s -> 12 min.
  ok(alta.body.data?.time === 12, 'calcula el tiempo en minutos si no viene', alta.body.data?.time);
  const creados = alta.body.data?.exercises || [];
  ok(creados.map((e) => e.position).join() === '1,2,3,4', 'asigna position segun el orden', creados.map((e) => e.position));
  ok(creados.every((e) => e.series === 1), 'series queda en 1');
  ok(creados[2]?.restSeconds === 0 && creados[2]?.rest === 0, 'descanso 0 permitido');

  const malos = [
    [{ ...bloques[0], workSeconds: 3 }, 'trabajo < 5 s'],
    [{ ...bloques[0], restSeconds: 700 }, 'descanso > 600 s'],
    [{ idEjercice: 1, workSeconds: 30, restSeconds: 10 }, 'ejercicio de fuerza en un funcional'],
  ];
  for (const [bloque, que] of malos) {
    const r = await pedir('POST', '/routine', { token: gym.token, headers: NUEVO, body: { name: 'Mal', order: 1, time: 5, kind: 'functional', exercises: [bloque] } });
    ok(r.status === 400, `rechaza ${que}`, r.body);
  }
  const vueltasMal = await pedir('POST', '/routine', { token: gym.token, headers: NUEVO, body: { name: 'Mal', order: 1, kind: 'functional', rounds: 25, exercises: [bloques[0]] } });
  ok(vueltasMal.status === 400, 'rechaza 25 vueltas');
  const vacio = await pedir('POST', '/routine', { token: gym.token, headers: NUEVO, body: { name: 'Mal', order: 1, kind: 'functional', exercises: [] } });
  ok(vacio.status === 400, 'rechaza un funcional sin bloques');

  console.log('\nFuerza');
  const fuerza = await pedir('POST', '/routine', {
    token: gym.token,
    body: { name: 'Fuerza repetida', order: 2, time: 30, exercises: [
      { idEjercice: 1, series: 4, rest: 2, comments: '' },
      { idEjercice: 1, series: 3, restSeconds: 75, comments: 'Segunda vuelta' },
    ] },
  });
  ok(fuerza.status === 201, 'una rutina de fuerza tambien puede repetir ejercicios (cliente viejo)', fuerza.body);
  ok(fuerza.body.data?.kind === 'strength', 'queda como fuerza');
  ok(fuerza.body.data?.exercises?.[0]?.restSeconds === 120 && fuerza.body.data?.exercises?.[1]?.rest === 1, 'rest y restSeconds siguen sincronizados');

  console.log('\nEdicion');
  const actual = (await pedir('GET', '/routine', { token: gym.token, headers: NUEVO })).body.data.find((r) => r.id === idF);
  const filas = ejerciciosDe(actual);
  ok(filas.map((e) => e.idEjercice).join() === '1001,1006,1021,1001', 'GET /routine devuelve los bloques en orden', filas.map((e) => e.idEjercice));
  const reordenados = [filas[2], filas[0], filas[1], filas[3]].map((e, i) => ({
    id: e.id, idEjercice: e.idEjercice, workSeconds: e.workSeconds, restSeconds: e.restSeconds, comments: e.comments, position: i + 1,
  }));
  reordenados[0].workSeconds = 35;
  const edit = await pedir('PUT', `/routine/${idF}`, { token: gym.token, headers: NUEVO, body: { rounds: 2, exercises: reordenados } });
  ok(edit.status === 200, 'edita vueltas y reordena', edit.body);
  const editados = ejerciciosDe(edit.body.data);
  ok(editados.map((e) => e.idEjercice).join() === '1021,1001,1006,1001', 'el orden nuevo se respeta', editados.map((e) => e.idEjercice));
  ok(editados[0]?.workSeconds === 35 && edit.body.data?.rounds === 2, 'guarda el trabajo y las vueltas nuevas');
  const cambiarTipo = await pedir('PUT', `/routine/${idF}`, { token: gym.token, headers: NUEVO, body: { kind: 'strength' } });
  ok(cambiarTipo.status === 400, 'no deja cambiar el tipo');
  const bloqueMal = await pedir('PUT', `/routine/${idF}`, { token: gym.token, headers: NUEVO, body: { exercises: [{ idEjercice: 1001, workSeconds: 1 }] } });
  ok(bloqueMal.status === 400, 'valida los bloques al editar');

  console.log('\nAsignacion');
  const asig = await pedir('POST', '/routine/assign', { token: gym.token, headers: NUEVO, body: { idRoutine: idF, idAthlete: atleta.user.id } });
  ok(asig.status === 201, 'asigna el funcional al atleta', asig.body);
  const nueva = await pedir('GET', `/routine/assign/athlete/${atleta.user.id}`, { token: atleta.token, headers: NUEVO });
  const aF = nueva.body.data.find((a) => a.Routine?.id === idF);
  ok(aF && aF.Routine.kind === 'functional' && aF.Routine.rounds === 2 && aF.Routine.roundRestSeconds === 60, 'la app nueva ve el funcional con sus campos');
  ok(ejerciciosDe(aF?.Routine).map((e) => e.idEjercice).join() === '1021,1001,1006,1001', 'y con los bloques en orden');
  ok(ejerciciosDe(aF?.Routine)[0]?.Ejercice?.MuscleGroup?.kind === 'functional', 'cada ejercicio trae el kind de su grupo');
  const vieja = await pedir('GET', `/routine/assign/athlete/${atleta.user.id}`, { token: atleta.token });
  ok(vieja.status === 200 && !vieja.body.data.some((a) => a.Routine?.kind === 'functional'), 'la app vieja no recibe funcionales');
  ok(vieja.body.data.length === nueva.body.data.length - 1, 'pero sigue recibiendo las de fuerza');

  // Lo que veia la app vieja antes de actualizar el servidor tiene que seguir igual.
  if (process.env.ANTES) {
    const antes = JSON.parse(require('fs').readFileSync(process.env.ANTES, 'utf8'));
    const resumen = (lista) => lista.map((a) => ({
      id: a.id, rutina: a.Routine?.name, time: a.Routine?.time,
      ej: ejerciciosDe(a.Routine).map((e) => [e.id, e.idEjercice, e.series, e.rest, e.restSeconds, e.comments]),
    }));
    ok(JSON.stringify(resumen(vieja.body.data)) === JSON.stringify(resumen(antes.asig)), 'la asignacion de fuerza que ya existia no cambio', resumen(vieja.body.data));
  }

  console.log('\nCompartir');
  const compartir = await pedir('POST', '/routine/share', {
    token: atleta.token,
    headers: NUEVO,
    body: {
      name: 'Mi funcional', kind: 'functional', rounds: 2, roundRestSeconds: 45, defaultMode: 'auto',
      exercises: [
        { idEjercice: 1017, name: 'Jumping jacks', category: 'cardio', workSeconds: 40, restSeconds: 0, note: 'Ritmo' },
        { idEjercice: 1027, name: 'Burpees', category: 'pliometria', workSeconds: 30, restSeconds: 20 },
      ],
    },
  });
  ok(compartir.status === 201, 'comparte un funcional', compartir.body);
  const codigo = compartir.body.data?.code;
  const verNuevo = await pedir('GET', `/routine/share/${codigo}`, { token: gym.token, headers: NUEVO });
  ok(verNuevo.status === 200 && verNuevo.body.data.kind === 'functional' && verNuevo.body.data.rounds === 2, 'la app nueva lo importa con su tipo');
  ok(verNuevo.body.data.exercises?.[0]?.workSeconds === 40 && verNuevo.body.data.exercises?.[0]?.restSeconds === 0, 'con trabajo y descanso 0');
  const verViejo = await pedir('GET', `/routine/share/${codigo}`, { token: gym.token });
  ok(verViejo.status === 409 && /Actualiz/.test(verViejo.body.message), 'la app vieja recibe un error claro', verViejo.body);
  const sinTrabajo = await pedir('POST', '/routine/share', {
    token: atleta.token, headers: NUEVO, body: { name: 'Mal', kind: 'functional', exercises: [{ name: 'X', restSeconds: 10 }] },
  });
  ok(sinTrabajo.status === 400, 'rechaza compartir un bloque sin trabajo');
  const fuerzaShare = await pedir('POST', '/routine/share', {
    token: atleta.token, body: { name: 'Fuerza', exercises: [{ idEjercice: 1, name: 'Press plano', series: 3, restSeconds: 60 }] },
  });
  const fuerzaVieja = await pedir('GET', `/routine/share/${fuerzaShare.body.data?.code}`, { token: gym.token });
  ok(fuerzaVieja.status === 200 && fuerzaVieja.body.data.kind === 'strength' && fuerzaVieja.body.data.exercises?.[0]?.series === 3, 'compartir fuerza sigue igual para la app vieja');
  if (process.env.ANTES) {
    const antes = JSON.parse(require('fs').readFileSync(process.env.ANTES, 'utf8'));
    const previo = await pedir('GET', `/routine/share/${antes.share.code}`, { token: gym.token });
    ok(previo.status === 200 && previo.body.data.kind === 'strength' && previo.body.data.exercises?.length === 1, 'un codigo de antes de actualizar se sigue importando');
  }

  console.log('\nImagenes');
  const img = await pedir('GET', '/ejercice/1001/image');
  const etag = img.headers.get('etag');
  ok(img.status === 200 && img.headers.get('content-type') === 'image/png' && etag, 'imagen de un funcional con ETag');
  const cache = await pedir('GET', '/ejercice/1001/image', { headers: { 'If-None-Match': etag } });
  ok(cache.status === 304, '304 con el mismo ETag');
  const nuevoEj = await pedir('POST', '/ejercice', { token: admin.token, body: { name: 'Funcional sin dibujo', idMuscleGroup: 102, defaultWorkSeconds: 45 } });
  ok(nuevoEj.status === 201 && nuevoEj.body.data?.defaultWorkSeconds === 45, 'el super admin crea un funcional con tiempo sugerido', nuevoEj.body);
  const respaldo = await pedir('GET', `/ejercice/${nuevoEj.body.data?.id}/image`);
  const grupo = await pedir('GET', '/muscleGroup/102/image');
  ok(respaldo.status === 200 && respaldo.headers.get('etag') === grupo.headers.get('etag'), 'sin dibujo devuelve la imagen de su categoria');
  const tiempoMal = await pedir('POST', '/ejercice', { token: admin.token, body: { name: 'Mal', idMuscleGroup: 102, defaultWorkSeconds: 2 } });
  ok(tiempoMal.status === 400, 'rechaza un tiempo sugerido invalido');
  const gymNoPuede = await pedir('POST', '/ejercice', { token: gym.token, body: { name: 'Mal', idMuscleGroup: 102 } });
  ok(gymNoPuede.status === 403, 'el catalogo sigue siendo solo del super admin');
  const nuevaCat = await pedir('POST', '/muscleGroup', { token: admin.token, body: { name: 'Prueba funcional', kind: 'functional' } });
  ok(nuevaCat.status === 201 && nuevaCat.body.data?.kind === 'functional', 'el super admin crea una categoria funcional');
  await pedir('DELETE', `/muscleGroup/${nuevaCat.body.data?.id}`, { token: admin.token });
  await pedir('DELETE', `/ejercice/${nuevoEj.body.data?.id}`, { token: admin.token });

  console.log('\nLimpieza');
  const borrar = await pedir('DELETE', `/routine/${idF}`, { token: gym.token, headers: NUEVO });
  ok(borrar.status === 200, 'borra el funcional (y su asignacion)');
  await pedir('DELETE', `/routine/${fuerza.body.data?.id}`, { token: gym.token });

  console.log(`\n${pasos - fallas} de ${pasos} verificaciones bien.`);
  process.exit(fallas ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
