// Reconoce a los clientes que saben mostrar entrenamientos funcionales.
//
// La app y el dashboard nuevos mandan el header X-Rutina360-Funcional: 1 en
// todas las llamadas (tambien se acepta ?funcional=1, para probar a mano). Una
// app vieja no lo manda: a esa no se le devuelven funcionales asignados y, si
// pide un codigo compartido de un funcional, recibe un error claro. Cubre el
// rato entre que se publica el servidor y la app nueva llega a los telefonos.

const HEADER = 'x-rutina360-funcional';

function clienteFuncional(req, _res, next) {
  req.soportaFuncional = req.headers[HEADER] === '1' || req.query?.funcional === '1';
  next();
}

module.exports = clienteFuncional;
module.exports.HEADER = HEADER;
