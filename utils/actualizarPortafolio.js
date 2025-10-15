const PortafolioJugadores = require("../models/PortafolioJugadores");
const HistorialLimpio = require("../models/HistorialLimpio");
const RegistrosRegistrador = require("../models/RegistrosRegistrador");

// Recalcula el stock de una acción para un jugador
async function actualizarStockJugadorAccion(jugador, accion) {
  // Suma total de compras en ambas colecciones
  const comprasHL = await HistorialLimpio.aggregate([
    { $match: { comprador: jugador, accion } },
    { $group: { _id: null, total: { $sum: "$cantidad" } } }
  ]);
  const comprasRR = await RegistrosRegistrador.aggregate([
    { $match: { comprador: jugador, accion } },
    { $group: { _id: null, total: { $sum: "$cantidad" } } }
  ]);
  const sumaCompras = (comprasHL[0]?.total || 0) + (comprasRR[0]?.total || 0);

  // Suma total de ventas en ambas colecciones
  const ventasHL = await HistorialLimpio.aggregate([
    { $match: { vendedor: jugador, accion } },
    { $group: { _id: null, total: { $sum: "$cantidad" } } }
  ]);
  const ventasRR = await RegistrosRegistrador.aggregate([
    { $match: { vendedor: jugador, accion } },
    { $group: { _id: null, total: { $sum: "$cantidad" } } }
  ]);
  const sumaVentas = (ventasHL[0]?.total || 0) + (ventasRR[0]?.total || 0);

  const nuevoStock = sumaCompras - sumaVentas;

  // Actualiza el stock en el PortafolioJugadores
  const portafolio = await PortafolioJugadores.findOne({});
  if (!portafolio) return;

  // Busca la fila del jugador
  const fila = portafolio.filas.find(f => f.jugador === jugador);
  if (!fila) return;

  fila[accion] = nuevoStock;

  await portafolio.save();
}

module.exports = { actualizarStockJugadorAccion };