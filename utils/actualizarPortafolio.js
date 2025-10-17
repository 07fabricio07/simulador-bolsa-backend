const PortafolioJugadores = require("../models/PortafolioJugadores");
const HistorialLimpio = require("../models/HistorialLimpio");
const RegistrosRegistrador = require("../models/RegistrosRegistrador");

const VALOR_INICIAL = 10000; // Valor inicial en cada celda

async function actualizarStockJugadorAccion(jugador, accion) {
  try {
    console.log(`Iniciando actualización de stock: Jugador=${jugador}, Acción=${accion}`);

    // Suma total de compras en ambas colecciones
    const comprasHL = await HistorialLimpio.aggregate([
      { $match: { comprador: jugador, accion } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);
    console.log('Compras en HistorialLimpio:', comprasHL);

    const comprasRR = await RegistrosRegistrador.aggregate([
      { $match: { comprador: jugador, accion } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);
    console.log('Compras en RegistrosRegistrador:', comprasRR);

    const sumaCompras = (comprasHL[0]?.total || 0) + (comprasRR[0]?.total || 0);

    // Suma total de ventas en ambas colecciones
    const ventasHL = await HistorialLimpio.aggregate([
      { $match: { vendedor: jugador, accion } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);
    console.log('Ventas en HistorialLimpio:', ventasHL);

    const ventasRR = await RegistrosRegistrador.aggregate([
      { $match: { vendedor: jugador, accion } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);
    console.log('Ventas en RegistrosRegistrador:', ventasRR);

    const sumaVentas = (ventasHL[0]?.total || 0) + (ventasRR[0]?.total || 0);

    // Valor final: inicial + compras - ventas
    const nuevoStock = VALOR_INICIAL + sumaCompras - sumaVentas;

    console.log(`Calculado nuevo stock: Jugador=${jugador}, Acción=${accion}, Compras=${sumaCompras}, Ventas=${sumaVentas}, NuevoStock=${nuevoStock}`);

    // Actualiza el stock en el PortafolioJugadores
    const portafolio = await PortafolioJugadores.findOne({});
    if (!portafolio) {
      console.error('PortafolioJugadores no encontrado. Verifica que la colección exista.');
      return;
    }

    // Busca la fila del jugador
    const fila = portafolio.filas.find(f => f.jugador === jugador);
    if (!fila) {
      console.error(`Jugador no encontrado en PortafolioJugadores: ${jugador}`);
      return;
    }

    fila[accion] = nuevoStock;

    await portafolio.save();
    console.log(`Stock actualizado correctamente: Jugador=${jugador}, Acción=${accion}, NuevoStock=${nuevoStock}`);
  } catch (error) {
    console.error(`Error al actualizar el stock: Jugador=${jugador}, Acción=${accion}`, error);
  }
}

module.exports = { actualizarStockJugadorAccion };