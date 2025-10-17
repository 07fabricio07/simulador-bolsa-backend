const PortafolioJugadores = require("../models/PortafolioJugadores");
const Historial = require("../models/Historial");

const VALOR_INICIAL = 10000; // Valor inicial en cada celda

async function actualizarStockJugadorAccion(jugador, accion) {
  try {
    console.log(`Iniciando cálculo de stock dinámico: Jugador=${jugador}, Acción=${accion}`);

    // Calcula la suma total de compras y ventas
    const compras = await Historial.aggregate([
      { $match: { comprador: jugador, accion, estado: 'aprobada' } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);
    const ventas = await Historial.aggregate([
      { $match: { vendedor: jugador, accion, estado: 'aprobada' } },
      { $group: { _id: null, total: { $sum: "$cantidad" } } }
    ]);

    const totalCompras = compras[0]?.total || 0;
    const totalVentas = ventas[0]?.total || 0;

    // Calcula el stock final
    const nuevoStock = VALOR_INICIAL + totalCompras - totalVentas;

    console.log(`Cálculo completado: Compras=${totalCompras}, Ventas=${totalVentas}, NuevoStock=${nuevoStock}`);

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