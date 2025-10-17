const ReguladorAcciones = require('../models/ReguladorAcciones');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const server = require('../server'); // usamos server.io exportado en server.js

const io = server.io; // socket.io instance

const ACCIONES = ["INTC","MSFT","AAPL","IPET","IBM","WMT","MRK","KO"];

function validAccionField(accion) {
  return ACCIONES.includes(accion);
}

/**
 * Aplica un delta (positivo o negativo) a la fila del jugador y acción indicada.
 * - Si no existe el documento ReguladorAcciones, se crea uno.
 * - Si no existe la fila del jugador, se crea una con valores 0 y se aplica el delta.
 * - Emite 'regulador:update' con { jugador, accion, delta, nuevo }.
 */
async function aplicarDelta({ jugador, accion, delta }) {
  if (!jugador || !accion || typeof delta !== 'number') {
    throw new Error("Parámetros inválidos para aplicarDelta");
  }
  if (!validAccionField(accion)) {
    throw new Error("Acción no válida: " + accion);
  }

  // Asegurar documento ReguladorAcciones
  let doc = await ReguladorAcciones.findOne({});
  if (!doc) {
    doc = new ReguladorAcciones({
      encabezados: ["jugador", ...ACCIONES],
      filas: []
    });
    await doc.save();
  }

  // Buscar fila del jugador
  const filaIdx = doc.filas.findIndex(f => f.jugador === jugador);
  if (filaIdx === -1) {
    const nuevaFila = { jugador };
    ACCIONES.forEach(a => { nuevaFila[a] = 0; });
    nuevaFila[accion] = (nuevaFila[accion] || 0) + delta;
    doc.filas.push(nuevaFila);
    await doc.save();
    const nuevoValor = nuevaFila[accion] || 0;
    try { io.emit('regulador:update', { jugador, accion, delta, nuevo: nuevoValor }); } catch (e) { console.error("emit regulador:update:", e); }
    return { jugador, accion, nuevo: nuevoValor };
  }

  // Actualizar usando $inc sobre path específico para evitar condiciones de carrera
  const path = `filas.${filaIdx}.${accion}`;
  await ReguladorAcciones.updateOne({ _id: doc._id }, { $inc: { [path]: delta } });

  const refreshed = await ReguladorAcciones.findOne({ _id: doc._id }).lean();
  const nuevoValor = (refreshed?.filas?.[filaIdx]?.[accion]) ?? 0;

  try { io.emit('regulador:update', { jugador, accion, delta, nuevo: nuevoValor }); } catch (e) { console.error("emit regulador:update:", e); }
  return { jugador, accion, nuevo: nuevoValor };
}

/**
 * Recalcula todo el regulador desde IntencionesDeVenta (agregación).
 * Reemplaza el documento ReguladorAcciones (fila por jugador con sumas por acción).
 */
async function recomputeAll() {
  const agg = await IntencionesDeVenta.aggregate([
    { $group: { _id: { jugador: "$jugador", accion: "$accion" }, total: { $sum: "$cantidad" } } }
  ]);

  const map = new Map();
  agg.forEach(row => {
    const jugador = row._id.jugador;
    const accion = row._id.accion;
    const total = row.total || 0;
    if (!map.has(jugador)) map.set(jugador, {});
    map.get(jugador)[accion] = total;
  });

  const filas = [];
  for (const [jugador, accionesMap] of map.entries()) {
    const fila = { jugador };
    ACCIONES.forEach(a => { fila[a] = accionesMap[a] ?? 0; });
    filas.push(fila);
  }

  const encabezados = ["jugador", ...ACCIONES];
  const existing = await ReguladorAcciones.findOne({});
  if (existing) {
    existing.encabezados = encabezados;
    existing.filas = filas;
    await existing.save();
  } else {
    await ReguladorAcciones.create({ encabezados, filas });
  }

  try { io.emit('regulador_acciones', await ReguladorAcciones.findOne({}).lean()); } catch (e) { console.error("emit regulador_acciones:", e); }

  return { filasCount: filas.length };
}

module.exports = { aplicarDelta, recomputeAll };